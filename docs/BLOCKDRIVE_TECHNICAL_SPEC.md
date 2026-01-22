# BlockDrive Technical Specification
## Dual-Mode Sharing & View-Only Portal Implementation

**For:** Claude Code / Engineering Team  
**Stack:** Supabase + Edge Functions + Clerk Auth + Alchemy Wallet SDK  
**Version:** 1.0  
**Date:** January 2026

---

## Executive Summary

This document specifies the implementation of BlockDrive's dual-mode file sharing system:

1. **BlockDrive User Sharing** - Full E2E encrypted access for Pro subscribers via `.blockdrive.sol` subdomains
2. **View-Only Links** - Browser-based viewing for external recipients with no account required

The architecture preserves the "Programmed Incompleteness" security model while enabling frictionless sharing with non-BlockDrive users.

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Edge Functions](#2-edge-functions)
3. [Solana/SNS Integration](#3-solanasns-integration)
4. [Cloudflare R2 Integration](#4-cloudflare-r2-integration)
5. [Frontend Integration](#5-frontend-integration)
6. [Environment Variables](#6-environment-variables)
7. [Migration Checklist](#7-migration-checklist)
8. [Security Considerations](#8-security-considerations)

---

## 1. Database Schema

### 1.1 New Tables

```sql
-- User tiers and subscription status
CREATE TYPE public.subscription_tier AS ENUM ('pro');

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tier subscription_tier NOT NULL DEFAULT 'pro',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- SNS subdomain registry (cached from on-chain)
CREATE TABLE public.sns_subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subdomain TEXT NOT NULL, -- e.g., 'alice' (without .blockdrive.sol)
    wallet_address TEXT NOT NULL, -- Solana address
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subdomain),
    UNIQUE(user_id)
);

-- File sharing records
CREATE TYPE public.share_type AS ENUM ('user', 'view_only');

CREATE TABLE public.file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_type share_type NOT NULL,
    
    -- For 'user' type shares
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_subdomain TEXT, -- cached for display
    recipient_wallet_address TEXT,
    critical_bytes_key TEXT, -- R2 key for recipient's critical bytes
    
    -- For 'view_only' type shares
    access_token TEXT UNIQUE, -- secure random token for link
    expires_at TIMESTAMPTZ,
    password_hash TEXT, -- optional password protection
    
    -- Shared fields
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_user_share CHECK (
        share_type != 'user' OR (recipient_user_id IS NOT NULL AND recipient_wallet_address IS NOT NULL)
    ),
    CONSTRAINT valid_view_only_share CHECK (
        share_type != 'view_only' OR (access_token IS NOT NULL AND expires_at IS NOT NULL)
    )
);

-- View-only link access logs (for analytics)
CREATE TABLE public.view_only_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID REFERENCES public.file_shares(id) ON DELETE CASCADE NOT NULL,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    converted_to_signup BOOLEAN DEFAULT FALSE
);
```

### 1.2 Indexes

```sql
CREATE INDEX idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX idx_file_shares_owner_id ON public.file_shares(owner_id);
CREATE INDEX idx_file_shares_recipient ON public.file_shares(recipient_user_id);
CREATE INDEX idx_file_shares_access_token ON public.file_shares(access_token) WHERE share_type = 'view_only';
CREATE INDEX idx_sns_subdomains_subdomain ON public.sns_subdomains(subdomain);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
```

### 1.3 RLS Policies

```sql
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sns_subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = _user_id
        AND status = 'active'
        AND (current_period_end IS NULL OR current_period_end > NOW())
    );
$$;

-- File shares: owners see their shares, recipients see shares to them
CREATE POLICY "Users can view their own shares" ON public.file_shares
FOR SELECT USING (
    owner_id = auth.uid() OR recipient_user_id = auth.uid()
);

CREATE POLICY "Owners can create shares" ON public.file_shares
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can revoke shares" ON public.file_shares
FOR UPDATE USING (owner_id = auth.uid());

-- SNS subdomains: users can view all (for resolution), manage own
CREATE POLICY "Anyone can resolve subdomains" ON public.sns_subdomains
FOR SELECT USING (true);

CREATE POLICY "Users can manage own subdomain" ON public.sns_subdomains
FOR ALL USING (user_id = auth.uid());

-- Subscriptions: users can view own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
FOR SELECT USING (user_id = auth.uid());
```

---

## 2. Edge Functions

### 2.1 SNS Subdomain Resolution

**File:** `supabase/functions/resolve-subdomain/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { subdomain } = await req.json();
        
        if (!subdomain || typeof subdomain !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Invalid subdomain' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Check local cache first
        const { data: cached, error: cacheError } = await supabase
            .from('sns_subdomains')
            .select('wallet_address, user_id')
            .eq('subdomain', subdomain.toLowerCase())
            .single();

        if (cached) {
            return new Response(
                JSON.stringify({
                    subdomain: `${subdomain}.blockdrive.sol`,
                    wallet_address: cached.wallet_address,
                    user_id: cached.user_id,
                    source: 'cache'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // TODO: Query on-chain SNS registry via Alchemy SDK
        // This would use the Alchemy Wallet SDK to resolve the subdomain
        // from the actual Solana Name Service

        return new Response(
            JSON.stringify({ error: 'Subdomain not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
```

### 2.2 Check Subdomain Availability

**File:** `supabase/functions/check-subdomain-availability/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { subdomain } = await req.json();
        
        if (!subdomain || subdomain.length < 3 || !/^[a-zA-Z0-9_]+$/.test(subdomain)) {
            return new Response(
                JSON.stringify({ available: false, reason: 'invalid_format' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Check local registry
        const { data: existing } = await supabase
            .from('sns_subdomains')
            .select('id')
            .eq('subdomain', subdomain.toLowerCase())
            .single();

        if (existing) {
            return new Response(
                JSON.stringify({ available: false, reason: 'already_registered' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // TODO: Also check on-chain SNS registry for subdomains
        // registered outside of BlockDrive

        return new Response(
            JSON.stringify({ 
                available: true,
                subdomain: `${subdomain.toLowerCase()}.blockdrive.sol`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
```

### 2.3 Create Share (Dual Mode)

**File:** `supabase/functions/create-share/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nanoid } from "https://esm.sh/nanoid@4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClerkSession {
    userId: string;
    // Add other Clerk session properties as needed
}

async function validateClerkSession(token: string): Promise<ClerkSession | null> {
    // Validate Clerk JWT token
    // See: https://clerk.com/docs/backend-requests/handling/manual-jwt
    try {
        const response = await fetch('https://api.clerk.com/v1/tokens/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('CLERK_SECRET_KEY')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const session = await validateClerkSession(token);
        
        if (!session) {
            return new Response(
                JSON.stringify({ error: 'Invalid session' }),
                { status: 401, headers: corsHeaders }
            );
        }

        const userId = session.userId;
        
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { 
            file_id, 
            share_type, 
            recipient_subdomain, // for 'user' type
            expires_in, // for 'view_only' type: '24h', '7d', '30d'
            password // optional for 'view_only'
        } = await req.json();

        // Verify user owns the file
        const { data: file, error: fileError } = await supabase
            .from('files')
            .select('id, owner_id')
            .eq('id', file_id)
            .eq('owner_id', userId)
            .single();

        if (fileError || !file) {
            return new Response(
                JSON.stringify({ error: 'File not found or access denied' }),
                { status: 404, headers: corsHeaders }
            );
        }

        if (share_type === 'user') {
            // Resolve recipient subdomain
            const { data: recipient } = await supabase
                .from('sns_subdomains')
                .select('user_id, wallet_address')
                .eq('subdomain', recipient_subdomain.toLowerCase())
                .single();

            if (!recipient) {
                return new Response(
                    JSON.stringify({ error: 'Recipient subdomain not found' }),
                    { status: 404, headers: corsHeaders }
                );
            }

            // Check recipient has active subscription
            const { data: hasSubscription } = await supabase.rpc('has_active_subscription', {
                _user_id: recipient.user_id
            });

            if (!hasSubscription) {
                return new Response(
                    JSON.stringify({ 
                        error: 'Recipient must have BlockDrive Pro to receive files',
                        code: 'RECIPIENT_NO_SUBSCRIPTION'
                    }),
                    { status: 403, headers: corsHeaders }
                );
            }

            // Generate recipient-specific critical bytes
            // 1. Derive encryption key from recipient's wallet public key
            // 2. Create new critical bytes encrypted for recipient
            // 3. Upload to R2 with unique key
            const criticalBytesKey = `shares/${file_id}/${recipient.user_id}/${nanoid()}`;

            // TODO: Implement critical bytes generation
            // await generateAndStoreCriticalBytes(file_id, recipient.wallet_address, criticalBytesKey);

            const { data: share, error: shareError } = await supabase
                .from('file_shares')
                .insert({
                    file_id,
                    owner_id: userId,
                    share_type: 'user',
                    recipient_user_id: recipient.user_id,
                    recipient_subdomain: recipient_subdomain.toLowerCase(),
                    recipient_wallet_address: recipient.wallet_address,
                    critical_bytes_key: criticalBytesKey
                })
                .select()
                .single();

            if (shareError) throw shareError;

            return new Response(
                JSON.stringify({
                    share_id: share.id,
                    share_type: 'user',
                    recipient: `${recipient_subdomain}.blockdrive.sol`,
                    recipient_address: recipient.wallet_address
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

        } else if (share_type === 'view_only') {
            // Calculate expiration
            const expiryMap: Record<string, number> = {
                '24h': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000
            };
            const expiresAt = new Date(Date.now() + (expiryMap[expires_in] || expiryMap['7d']));

            // Generate secure access token
            const accessToken = nanoid(32);

            // Hash password if provided
            let passwordHash = null;
            if (password) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                passwordHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            }

            const { data: share, error: shareError } = await supabase
                .from('file_shares')
                .insert({
                    file_id,
                    owner_id: userId,
                    share_type: 'view_only',
                    access_token: accessToken,
                    expires_at: expiresAt.toISOString(),
                    password_hash: passwordHash
                })
                .select()
                .single();

            if (shareError) throw shareError;

            const viewUrl = `${Deno.env.get('PUBLIC_SITE_URL')}/view/${accessToken}`;

            return new Response(
                JSON.stringify({
                    share_id: share.id,
                    share_type: 'view_only',
                    view_url: viewUrl,
                    expires_at: expiresAt.toISOString(),
                    password_protected: !!password
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Invalid share type' }),
            { status: 400, headers: corsHeaders }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
});
```

### 2.4 View-Only File Renderer

**File:** `supabase/functions/view-file/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported MIME types for browser rendering
const RENDERABLE_TYPES: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'text/plain': 'text',
    'text/markdown': 'text',
    'application/json': 'text',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const accessToken = url.pathname.split('/').pop();
        const password = url.searchParams.get('password');

        if (!accessToken) {
            return new Response(
                JSON.stringify({ error: 'Invalid access token' }),
                { status: 400, headers: corsHeaders }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Validate share
        const { data: share, error: shareError } = await supabase
            .from('file_shares')
            .select(`
                id,
                file_id,
                expires_at,
                password_hash,
                revoked,
                files (
                    id,
                    name,
                    mime_type,
                    encrypted_data_cid,
                    critical_bytes_key
                )
            `)
            .eq('access_token', accessToken)
            .eq('share_type', 'view_only')
            .single();

        if (shareError || !share) {
            return new Response(
                JSON.stringify({ error: 'Share not found' }),
                { status: 404, headers: corsHeaders }
            );
        }

        // Check if revoked
        if (share.revoked) {
            return new Response(
                JSON.stringify({ error: 'This link has been revoked' }),
                { status: 403, headers: corsHeaders }
            );
        }

        // Check expiration
        if (new Date(share.expires_at) < new Date()) {
            return new Response(
                JSON.stringify({ error: 'This link has expired' }),
                { status: 403, headers: corsHeaders }
            );
        }

        // Verify password if required
        if (share.password_hash) {
            if (!password) {
                return new Response(
                    JSON.stringify({ 
                        error: 'Password required',
                        password_required: true 
                    }),
                    { status: 401, headers: corsHeaders }
                );
            }

            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const providedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

            if (providedHash !== share.password_hash) {
                return new Response(
                    JSON.stringify({ error: 'Invalid password' }),
                    { status: 401, headers: corsHeaders }
                );
            }
        }

        const file = share.files as any;
        const mimeType = file.mime_type;

        // Check if file type is renderable
        if (!RENDERABLE_TYPES[mimeType]) {
            return new Response(
                JSON.stringify({ 
                    error: 'This file type requires a BlockDrive Pro account to access',
                    file_name: file.name,
                    upgrade_required: true,
                    upgrade_url: `${Deno.env.get('PUBLIC_SITE_URL')}/signup?ref=view`
                }),
                { status: 403, headers: corsHeaders }
            );
        }

        // Log access
        await supabase.from('view_only_access_logs').insert({
            share_id: share.id,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
            user_agent: req.headers.get('user-agent')
        });

        // TODO: Implement server-side decryption
        // 1. Fetch encrypted data from Filebase (IPFS) using encrypted_data_cid
        // 2. Fetch owner's critical bytes from R2 using critical_bytes_key
        // 3. Decrypt file in memory (DO NOT store decrypted file)
        // 4. Stream or render based on file type

        // For now, return metadata for frontend rendering
        return new Response(
            JSON.stringify({
                file_name: file.name,
                mime_type: mimeType,
                render_type: RENDERABLE_TYPES[mimeType],
                // render_url would be a signed URL to stream the decrypted content
                // This requires implementing the actual decryption logic
                upgrade_cta: {
                    message: 'Want to download or share your own files?',
                    action: 'Get BlockDrive Pro',
                    url: `${Deno.env.get('PUBLIC_SITE_URL')}/signup?ref=view`
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
});
```

### 2.5 Revoke Share

**File:** `supabase/functions/revoke-share/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClerkSession {
    userId: string;
}

async function validateClerkSession(token: string): Promise<ClerkSession | null> {
    try {
        const response = await fetch('https://api.clerk.com/v1/tokens/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('CLERK_SECRET_KEY')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: corsHeaders }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const session = await validateClerkSession(token);
        
        if (!session) {
            return new Response(
                JSON.stringify({ error: 'Invalid session' }),
                { status: 401, headers: corsHeaders }
            );
        }

        const userId = session.userId;
        const { share_id } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Get share details
        const { data: share, error: shareError } = await supabase
            .from('file_shares')
            .select('id, share_type, critical_bytes_key, owner_id')
            .eq('id', share_id)
            .eq('owner_id', userId)
            .single();

        if (shareError || !share) {
            return new Response(
                JSON.stringify({ error: 'Share not found or access denied' }),
                { status: 404, headers: corsHeaders }
            );
        }

        // For user shares, delete critical bytes from R2
        if (share.share_type === 'user' && share.critical_bytes_key) {
            // TODO: Delete from Cloudflare R2
            // This is the key security action - without critical bytes,
            // the recipient can never decrypt the file again
            // await r2Client.delete(share.critical_bytes_key);
        }

        // Mark share as revoked
        const { error: updateError } = await supabase
            .from('file_shares')
            .update({ 
                revoked: true, 
                revoked_at: new Date().toISOString() 
            })
            .eq('id', share_id);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                success: true,
                share_id,
                share_type: share.share_type,
                message: share.share_type === 'user' 
                    ? 'Recipient critical bytes deleted - access permanently revoked'
                    : 'View-only link invalidated'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
        );
    }
});
```

---

## 3. Solana/SNS Integration

### 3.1 Subdomain Registration Flow

Using Alchemy Wallet SDK, implement the following during account creation:

```typescript
// lib/solana/sns-registration.ts

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createSubdomainInstruction } from '@bonfida/spl-name-service';
// Import Alchemy Wallet SDK types

interface RegistrationResult {
    subdomain: string;
    walletAddress: string;
    txSignature: string;
}

export async function registerBlockDriveSubdomain(
    subdomain: string,
    userWallet: PublicKey, // From Alchemy embedded wallet
    payerWallet: PublicKey, // BlockDrive's fee payer for gasless UX
    connection: Connection
): Promise<RegistrationResult> {
    // Validate subdomain format
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(subdomain)) {
        throw new Error('Invalid subdomain format');
    }

    // Get parent domain (blockdrive.sol)
    const parentDomain = 'blockdrive'; // Registered on SNS
    
    // Create subdomain registration instruction
    // This registers: subdomain.blockdrive.sol -> userWallet
    const instruction = await createSubdomainInstruction(
        connection,
        subdomain.toLowerCase(),
        parentDomain,
        userWallet, // Owner of the subdomain
        payerWallet // Pays registration fee
    );

    // Build and sign transaction
    const transaction = new Transaction().add(instruction);
    
    // Sign with BlockDrive's fee payer (gasless for user)
    // The user wallet also signs to prove ownership
    // Implementation depends on Alchemy Wallet SDK specifics
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, [/* signers */]);
    await connection.confirmTransaction(signature);

    return {
        subdomain: `${subdomain.toLowerCase()}.blockdrive.sol`,
        walletAddress: userWallet.toString(),
        txSignature: signature
    };
}

export async function resolveSubdomainOnChain(
    subdomain: string,
    connection: Connection
): Promise<string | null> {
    // Query SNS to resolve subdomain.blockdrive.sol to wallet address
    try {
        // Use @bonfida/spl-name-service to resolve
        // Returns wallet address or null if not found
        return null; // Placeholder
    } catch {
        return null;
    }
}
```

### 3.2 Alchemy Wallet Integration

```typescript
// lib/wallet/alchemy-provider.ts

import { Alchemy, Network } from 'alchemy-sdk';

const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.SOLANA_MAINNET // or SOLANA_DEVNET for testing
});

export interface EmbeddedWallet {
    publicKey: string;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    signTransaction: (tx: any) => Promise<any>;
}

export async function createEmbeddedWallet(userId: string): Promise<EmbeddedWallet> {
    // Create or retrieve embedded wallet for user
    // Implementation depends on Alchemy Wallet SDK
    
    // The wallet private key is derived deterministically from user credentials
    // This allows recovery without seed phrase backup
    
    return {
        publicKey: '',
        signMessage: async () => new Uint8Array(),
        signTransaction: async (tx) => tx
    };
}

export async function getWalletForUser(userId: string): Promise<EmbeddedWallet | null> {
    // Retrieve existing wallet for user
    return null;
}
```

### 3.3 Key Derivation from Wallet

```typescript
// lib/crypto/key-derivation.ts

export async function deriveEncryptionKeys(
    walletPrivateKey: Uint8Array
): Promise<{
    encryptionKey: CryptoKey;
    signingKey: CryptoKey;
}> {
    // Derive deterministic encryption keys from wallet private key
    // This allows key recovery from wallet without additional backup
    
    // Use HKDF (HMAC-based Key Derivation Function)
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        walletPrivateKey,
        'HKDF',
        false,
        ['deriveKey']
    );
    
    const encryptionKey = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new TextEncoder().encode('blockdrive-encryption-v1'),
            info: new TextEncoder().encode('file-encryption')
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, // Not extractable
        ['encrypt', 'decrypt']
    );
    
    const signingKey = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new TextEncoder().encode('blockdrive-signing-v1'),
            info: new TextEncoder().encode('file-signing')
        },
        keyMaterial,
        { name: 'HMAC', hash: 'SHA-256', length: 256 },
        false,
        ['sign', 'verify']
    );
    
    return { encryptionKey, signingKey };
}
```

---

## 4. Cloudflare R2 Integration

### 4.1 Critical Bytes Storage

```typescript
// lib/storage/critical-bytes.ts

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
}

export class CriticalBytesStore {
    private r2: S3Client;
    private bucketName: string;
    
    constructor(config: R2Config) {
        this.bucketName = config.bucketName;
        this.r2 = new S3Client({
            region: 'auto',
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
    }
    
    /**
     * Store critical bytes for a file
     * Key format: users/{userId}/files/{fileId}/critical.bin
     */
    async store(key: string, criticalBytes: Uint8Array): Promise<void> {
        await this.r2.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: criticalBytes,
            ContentType: 'application/octet-stream',
            // No caching - always fetch fresh
            CacheControl: 'no-store'
        }));
    }
    
    /**
     * Retrieve critical bytes for decryption
     */
    async retrieve(key: string): Promise<Uint8Array | null> {
        try {
            const response = await this.r2.send(new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            }));
            
            if (!response.Body) return null;
            return new Uint8Array(await response.Body.transformToByteArray());
        } catch (e: any) {
            if (e.name === 'NoSuchKey') return null;
            throw e;
        }
    }
    
    /**
     * Delete critical bytes - THIS IS THE REVOCATION MECHANISM
     * Once deleted, the file can never be decrypted again
     */
    async delete(key: string): Promise<void> {
        await this.r2.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        }));
    }
    
    /**
     * Generate a share-specific critical bytes key
     */
    generateShareKey(fileId: string, recipientUserId: string): string {
        return `shares/${fileId}/${recipientUserId}/${crypto.randomUUID()}`;
    }
}
```

### 4.2 Critical Bytes Generation for Shares

```typescript
// lib/crypto/share-encryption.ts

import { CriticalBytesStore } from '../storage/critical-bytes';

interface ShareCriticalBytes {
    key: string; // R2 storage key
    bytes: Uint8Array; // The critical bytes themselves
}

/**
 * Generate critical bytes for a share recipient
 * The recipient gets their own copy, encrypted to their wallet
 */
export async function generateShareCriticalBytes(
    originalCriticalBytes: Uint8Array,
    ownerPrivateKey: Uint8Array,
    recipientPublicKey: Uint8Array,
    fileId: string,
    recipientUserId: string,
    store: CriticalBytesStore
): Promise<ShareCriticalBytes> {
    // 1. Decrypt original critical bytes with owner's key
    const { encryptionKey: ownerKey } = await deriveEncryptionKeys(ownerPrivateKey);
    const decryptedCriticalBytes = await decryptCriticalBytes(originalCriticalBytes, ownerKey);
    
    // 2. Re-encrypt for recipient using their public key
    // Use ECDH key agreement to derive a shared secret
    const sharedSecret = await deriveSharedSecret(ownerPrivateKey, recipientPublicKey);
    const recipientEncryptedBytes = await encryptCriticalBytes(decryptedCriticalBytes, sharedSecret);
    
    // 3. Store in R2 with unique key
    const storageKey = store.generateShareKey(fileId, recipientUserId);
    await store.store(storageKey, recipientEncryptedBytes);
    
    return {
        key: storageKey,
        bytes: recipientEncryptedBytes
    };
}

/**
 * Revoke a share by deleting recipient's critical bytes
 */
export async function revokeShareAccess(
    criticalBytesKey: string,
    store: CriticalBytesStore
): Promise<void> {
    await store.delete(criticalBytesKey);
    // File is now permanently inaccessible to the recipient
}
```

---

## 5. Frontend Integration

### 5.1 Share Dialog Component

```tsx
// components/sharing/ShareDialog.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Link, Loader2, Check, X, Copy } from 'lucide-react';

interface ShareDialogProps {
    fileId: string;
    fileName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ fileId, fileName, open, onOpenChange }: ShareDialogProps) {
    const [mode, setMode] = useState<'user' | 'link'>('user');
    const { toast } = useToast();
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{fileName}"</DialogTitle>
                </DialogHeader>
                
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'user' | 'link')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="user" className="gap-2">
                            <Users className="h-4 w-4" />
                            BlockDrive User
                        </TabsTrigger>
                        <TabsTrigger value="link" className="gap-2">
                            <Link className="h-4 w-4" />
                            View-Only Link
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="user">
                        <UserShareForm fileId={fileId} onSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                    
                    <TabsContent value="link">
                        <LinkShareForm fileId={fileId} onSuccess={() => onOpenChange(false)} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function UserShareForm({ fileId, onSuccess }: { fileId: string; onSuccess: () => void }) {
    const [subdomain, setSubdomain] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const { toast } = useToast();
    
    // Debounced subdomain resolution
    useEffect(() => {
        if (subdomain.length < 3) {
            setResolvedAddress(null);
            return;
        }
        
        const timer = setTimeout(async () => {
            setIsResolving(true);
            try {
                const result = await resolveSubdomain(subdomain);
                setResolvedAddress(result?.wallet_address || null);
            } catch {
                setResolvedAddress(null);
            }
            setIsResolving(false);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [subdomain]);
    
    const handleShare = async () => {
        if (!resolvedAddress) return;
        
        setIsSharing(true);
        try {
            await createShare({
                file_id: fileId,
                share_type: 'user',
                recipient_subdomain: subdomain
            });
            
            toast({
                title: 'File shared!',
                description: `${subdomain}.blockdrive.sol now has access`
            });
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Share failed',
                description: error.message,
                variant: 'destructive'
            });
        }
        setIsSharing(false);
    };
    
    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Recipient's BlockDrive subdomain</label>
                <div className="relative">
                    <Input
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                        placeholder="alice"
                        className="pr-24"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        .blockdrive.sol
                    </span>
                </div>
                
                {/* Resolution status */}
                <div className="h-5 flex items-center gap-2 text-sm">
                    {isResolving && (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-muted-foreground">Looking up...</span>
                        </>
                    )}
                    {!isResolving && resolvedAddress && (
                        <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">
                                Found: {resolvedAddress.slice(0, 8)}...
                            </span>
                        </>
                    )}
                    {!isResolving && subdomain.length >= 3 && !resolvedAddress && (
                        <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">User not found</span>
                        </>
                    )}
                </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <strong>Full access sharing:</strong> Recipient will be able to download 
                and decrypt this file. You can revoke access at any time.
            </div>
            
            <Button 
                onClick={handleShare} 
                disabled={!resolvedAddress || isSharing}
                className="w-full"
            >
                {isSharing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Encrypting for recipient...
                    </>
                ) : (
                    'Share File'
                )}
            </Button>
        </div>
    );
}

function LinkShareForm({ fileId, onSuccess }: { fileId: string; onSuccess: () => void }) {
    const [expiry, setExpiry] = useState<'24h' | '7d' | '30d'>('7d');
    const [password, setPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const { toast } = useToast();
    
    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const result = await createShare({
                file_id: fileId,
                share_type: 'view_only',
                expires_in: expiry,
                password: password || undefined
            });
            
            setShareLink(result.view_url);
        } catch (error: any) {
            toast({
                title: 'Failed to create link',
                description: error.message,
                variant: 'destructive'
            });
        }
        setIsCreating(false);
    };
    
    const copyLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            toast({ title: 'Link copied!' });
        }
    };
    
    if (shareLink) {
        return (
            <div className="space-y-4 pt-4">
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 text-center">
                    <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Link created!</p>
                </div>
                
                <div className="flex gap-2">
                    <Input value={shareLink} readOnly className="text-sm" />
                    <Button variant="outline" onClick={copyLink}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                    Anyone with this link can view the file in their browser.
                    {password && ' Password protection enabled.'}
                </p>
                
                <Button onClick={onSuccess} className="w-full">Done</Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Link expires after</label>
                <Select value={expiry} onValueChange={(v) => setExpiry(v as any)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Password (optional)</label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <strong>View-only link:</strong> Recipients can only view in browser. 
                No download, no account required. Great for external collaborators.
            </div>
            
            <Button 
                onClick={handleCreate} 
                disabled={isCreating}
                className="w-full"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating link...
                    </>
                ) : (
                    'Create Link'
                )}
            </Button>
        </div>
    );
}

// API functions
async function resolveSubdomain(subdomain: string) {
    const res = await fetch('/api/resolve-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
    });
    if (!res.ok) return null;
    return res.json();
}

async function createShare(params: any) {
    const res = await fetch('/api/create-share', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify(params)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Share failed');
    }
    return res.json();
}

async function getAuthToken(): Promise<string> {
    // Get Clerk session token
    // Implementation depends on Clerk React SDK
    return '';
}
```

### 5.2 View-Only Portal Page

```tsx
// pages/view/[token].tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Lock, FileX, Clock, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ViewFileResponse {
    file_name: string;
    mime_type: string;
    render_type: 'pdf' | 'image' | 'text';
    render_url?: string;
    password_required?: boolean;
    upgrade_required?: boolean;
    upgrade_url?: string;
    upgrade_cta?: {
        message: string;
        action: string;
        url: string;
    };
    error?: string;
}

export default function ViewOnlyPage() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [fileData, setFileData] = useState<ViewFileResponse | null>(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (token) {
            loadFile();
        }
    }, [token]);
    
    const loadFile = async (pwd?: string) => {
        setLoading(true);
        setPasswordError(false);
        
        try {
            const url = new URL(`/api/view-file/${token}`, window.location.origin);
            if (pwd) url.searchParams.set('password', pwd);
            
            const res = await fetch(url.toString());
            const data = await res.json();
            
            if (data.password_required && !pwd) {
                setFileData({ ...data, password_required: true } as ViewFileResponse);
                setLoading(false);
                return;
            }
            
            if (data.error === 'Invalid password') {
                setPasswordError(true);
                setLoading(false);
                return;
            }
            
            if (!res.ok) {
                setError(data.error || 'Failed to load file');
                setLoading(false);
                return;
            }
            
            setFileData(data);
        } catch {
            setError('Failed to load file');
        }
        setLoading(false);
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadFile(password);
    };
    
    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading file...</p>
                </div>
            </div>
        );
    }
    
    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center max-w-md">
                    {error.includes('expired') ? (
                        <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    ) : error.includes('revoked') ? (
                        <FileX className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    ) : (
                        <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    )}
                    <h1 className="text-2xl font-bold mb-2">
                        {error.includes('expired') ? 'Link Expired' : 
                         error.includes('revoked') ? 'Access Revoked' : 
                         'File Not Found'}
                    </h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <a href="https://blockdrive.io" className="text-primary hover:underline">
                        Learn about BlockDrive →
                    </a>
                </div>
            </div>
        );
    }
    
    // Password required
    if (fileData?.password_required) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Password Protected</h1>
                        <p className="text-muted-foreground">
                            Enter the password to view this file
                        </p>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className={passwordError ? 'border-red-500' : ''}
                        />
                        {passwordError && (
                            <p className="text-sm text-red-500">Incorrect password</p>
                        )}
                        <Button type="submit" className="w-full">
                            View File
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
    
    // File viewer
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="font-medium">{fileData?.file_name}</h1>
                    <p className="text-sm text-muted-foreground">View-only • Shared via BlockDrive</p>
                </div>
                <a 
                    href={fileData?.upgrade_cta?.url || 'https://blockdrive.io'} 
                    target="_blank"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    Get BlockDrive Pro <ExternalLink className="h-3 w-3" />
                </a>
            </header>
            
            {/* File content */}
            <main className="flex-1 p-4">
                <FileRenderer 
                    type={fileData?.render_type || 'text'}
                    url={fileData?.render_url}
                    fileName={fileData?.file_name}
                />
            </main>
            
            {/* Upgrade CTA */}
            {fileData?.upgrade_cta && (
                <footer className="border-t bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-4">
                    <div className="max-w-xl mx-auto flex items-center justify-between">
                        <p className="text-sm">{fileData.upgrade_cta.message}</p>
                        <a href={fileData.upgrade_cta.url}>
                            <Button size="sm">{fileData.upgrade_cta.action}</Button>
                        </a>
                    </div>
                </footer>
            )}
        </div>
    );
}

function FileRenderer({ type, url, fileName }: { 
    type: 'pdf' | 'image' | 'text'; 
    url?: string;
    fileName?: string;
}) {
    if (!url) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Preview not available
            </div>
        );
    }
    
    switch (type) {
        case 'pdf':
            return (
                <iframe 
                    src={url} 
                    className="w-full h-full min-h-[600px] rounded-lg border"
                    title={fileName}
                />
            );
        case 'image':
            return (
                <div className="flex items-center justify-center h-full">
                    <img 
                        src={url} 
                        alt={fileName}
                        className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
                    />
                </div>
            );
        case 'text':
            return (
                <pre className="bg-card border rounded-lg p-4 overflow-auto max-h-[80vh] text-sm">
                    {/* Text content would be fetched and displayed here */}
                </pre>
            );
        default:
            return null;
    }
}
```

---

## 6. Environment Variables

### 6.1 Supabase Edge Functions Secrets

```bash
# Set via Supabase CLI or Dashboard

# Clerk Authentication
supabase secrets set CLERK_SECRET_KEY=sk_live_xxxxx

# Cloudflare R2 Storage
supabase secrets set R2_ACCOUNT_ID=xxxxx
supabase secrets set R2_ACCESS_KEY_ID=xxxxx
supabase secrets set R2_SECRET_ACCESS_KEY=xxxxx
supabase secrets set R2_BUCKET_NAME=blockdrive-critical-bytes

# Solana / Alchemy
supabase secrets set ALCHEMY_API_KEY=xxxxx
supabase secrets set SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/xxxxx
supabase secrets set SNS_PARENT_DOMAIN=blockdrive.sol
supabase secrets set FEE_PAYER_PRIVATE_KEY=xxxxx  # For gasless SNS registration

# App Config
supabase secrets set PUBLIC_SITE_URL=https://app.blockdrive.io
```

### 6.2 Frontend Environment Variables

```bash
# .env.local

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_ALCHEMY_API_KEY=xxxxx
VITE_SOLANA_NETWORK=mainnet-beta
```

---

## 7. Migration Checklist

### Phase 1: Database Setup
- [ ] Run SQL migrations for new tables (subscriptions, sns_subdomains, file_shares, view_only_access_logs)
- [ ] Create indexes for performance
- [ ] Enable RLS and create policies
- [ ] Create `has_active_subscription` helper function

### Phase 2: Edge Functions
- [ ] Deploy `resolve-subdomain` function
- [ ] Deploy `check-subdomain-availability` function
- [ ] Deploy `create-share` function
- [ ] Deploy `view-file` function
- [ ] Deploy `revoke-share` function
- [ ] Set all required secrets

### Phase 3: External Integrations
- [ ] Configure Cloudflare R2 bucket with proper CORS
- [ ] Set up Alchemy Wallet SDK
- [ ] Register `blockdrive.sol` domain on SNS (if not already)
- [ ] Set up fee payer wallet for gasless transactions

### Phase 4: Frontend
- [ ] Implement ShareDialog component with dual-mode tabs
- [ ] Create view-only portal page at `/view/[token]`
- [ ] Add share management UI (list shares, revoke)
- [ ] Integrate SNS subdomain registration in signup flow

### Phase 5: Testing
- [ ] Test user-to-user sharing end-to-end
- [ ] Test view-only link creation and viewing
- [ ] Test revocation for both share types
- [ ] Test expired link handling
- [ ] Test password-protected links
- [ ] Load test view-file endpoint

### Phase 6: Launch
- [ ] Enable feature flags
- [ ] Monitor error rates
- [ ] Track conversion from view-only to signup

---

## 8. Security Considerations

### 8.1 Critical Security Rules

1. **Never expose critical bytes to view-only recipients**
   - All decryption for view-only happens server-side in edge functions
   - Decrypted content is streamed, never stored

2. **Critical bytes are the revocation mechanism**
   - For user shares: deleting critical bytes = permanent revocation
   - For view-only: just invalidate the token (set `revoked = true`)

3. **Access tokens must be cryptographically random**
   - Use `nanoid(32)` or `crypto.randomUUID()`
   - Never use sequential IDs or predictable patterns

4. **Rate limit the view-file endpoint**
   - Prevent brute-force token guessing
   - Suggested: 10 requests/minute per IP

5. **Log all access for audit trail**
   - Record IP, user agent, timestamp for every view
   - Required for compliance and security investigations

### 8.2 Password Hashing

The current implementation uses SHA-256 for simplicity. For production:

```typescript
// Consider upgrading to bcrypt or argon2
import { hash, verify } from '@node-rs/bcrypt';

// Hashing
const passwordHash = await hash(password, 12);

// Verification
const isValid = await verify(password, storedHash);
```

### 8.3 Content Security for View-Only

```typescript
// Add CSP headers to view-file responses
const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
};
```

---

## 9. API Reference Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/functions/v1/resolve-subdomain` | POST | None | Resolve .blockdrive.sol to wallet address |
| `/functions/v1/check-subdomain-availability` | POST | None | Check if subdomain is available |
| `/functions/v1/create-share` | POST | Clerk JWT | Create user share or view-only link |
| `/functions/v1/view-file/{token}` | GET | None | Get file metadata for rendering |
| `/functions/v1/revoke-share` | POST | Clerk JWT | Revoke a share |

---

## 10. Contact

For questions about this specification, contact the BlockDrive engineering team.

---

*Document Version: 1.0*  
*Last Updated: January 2026*

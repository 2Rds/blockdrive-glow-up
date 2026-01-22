import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistSignup {
  email: string;
  name?: string;
  company?: string;
  company_size?: string;
  use_case?: string;
  source?: string;
  ab_variant?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
    if (!SLACK_WEBHOOK_URL) {
      throw new Error("SLACK_WEBHOOK_URL is not configured");
    }

    const { email, name, company, company_size, use_case, source, ab_variant }: WaitlistSignup = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if this is a high-value B2B lead
    const isB2BLead = company && company.trim() !== '';
    const headerEmoji = isB2BLead ? '⭐ 🏢' : '🚀';
    
    // Build Slack Block Kit message
    const blocks: Record<string, unknown>[] = [
      {
        type: "header",
        text: { type: "plain_text", text: `${headerEmoji} New Waitlist Signup!`, emoji: true }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Email:*\n${email}` },
          { type: "mrkdwn", text: `*Name:*\n${name || '_Not provided_'}` },
        ]
      }
    ];

    // Add company details for B2B leads
    if (isB2BLead) {
      blocks.push({
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Company:*\n${company}` },
          { type: "mrkdwn", text: `*Size:*\n${company_size || '_Not provided_'}` },
        ]
      });
    }

    // Add use case if provided
    if (use_case) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*Use Case:*\n${use_case}` }
      });
    }

    // Add context footer
    blocks.push(
      { type: "divider" },
      {
        type: "context",
        elements: [
          { 
            type: "mrkdwn", 
            text: `Source: ${source || 'unknown'} | Variant: ${ab_variant || 'unknown'} | ${new Date().toISOString()}` 
          }
        ]
      }
    );

    // Send to Slack
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack webhook failed [${response.status}]: ${errorText}`);
    }

    // Consume response body
    await response.text();

    console.log(`Slack notification sent for: ${email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending Slack notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
  referrer?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization - require apikey header matching anon key
    const apiKey = req.headers.get('apikey');
    const expectedKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!apiKey || apiKey !== expectedKey) {
      console.error("Unauthorized request - invalid or missing apikey");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    if (!NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not configured");
    }

    const NOTION_WAITLIST_DATABASE_ID = Deno.env.get("NOTION_WAITLIST_DATABASE_ID");
    if (!NOTION_WAITLIST_DATABASE_ID) {
      throw new Error("NOTION_WAITLIST_DATABASE_ID is not configured");
    }

    const { email, name, company, company_size, use_case, source, ab_variant, referrer }: WaitlistSignup = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Notion page properties
    const properties: Record<string, unknown> = {
      // Email is the title property
      "Email": {
        title: [{ text: { content: email } }]
      },
      // Status defaults to "New"
      "Status": {
        select: { name: "New" }
      },
      // Signup Date
      "Signup Date": {
        date: { start: new Date().toISOString().split('T')[0] }
      }
    };

    // Add optional text properties
    if (name) {
      properties["Full Name"] = { rich_text: [{ text: { content: name } }] };
    }

    if (company) {
      properties["Company"] = { rich_text: [{ text: { content: company } }] };
    }

    // Add select properties
    if (company_size) {
      properties["Company Size"] = { select: { name: company_size } };
    }

    if (use_case) {
      properties["Use Case"] = { select: { name: use_case } };
    }

    if (source) {
      properties["Source"] = { select: { name: source } };
    }

    if (ab_variant) {
      properties["A/B Variant"] = { select: { name: ab_variant } };
    }

    // Add referrer as URL if provided
    if (referrer) {
      properties["Referrer"] = { url: referrer };
    }

    // Create page in Notion database
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_WAITLIST_DATABASE_ID },
        properties
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Notion API error:", data);
      throw new Error(`Notion API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    console.log(`Notion page created for: ${email}, page ID: ${data.id}`);

    return new Response(
      JSON.stringify({ success: true, pageId: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error syncing to Notion:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
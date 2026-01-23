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
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    if (!NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not configured");
    }

    const NOTION_WAITLIST_DATABASE_ID = Deno.env.get("NOTION_WAITLIST_DATABASE_ID");
    if (!NOTION_WAITLIST_DATABASE_ID) {
      throw new Error("NOTION_WAITLIST_DATABASE_ID is not configured");
    }

    const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
    // Slack is optional - we'll log if not configured but continue

    const data: WaitlistSignup = await req.json();
    const { email, name, company, company_size, use_case, source, ab_variant, referrer } = data;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === CREATE NOTION PAGE (Primary storage) ===
    const properties: Record<string, unknown> = {
      "Email": {
        title: [{ text: { content: email } }]
      },
      "Status": {
        select: { name: "New" }
      },
      "Signup Date": {
        date: { start: new Date().toISOString().split('T')[0] }
      }
    };

    if (name) {
      properties["Full Name"] = { rich_text: [{ text: { content: name } }] };
    }
    if (company) {
      properties["Company"] = { rich_text: [{ text: { content: company } }] };
    }
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
    if (referrer) {
      properties["Referrer"] = { url: referrer };
    }

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
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

    const notionData = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Notion API error:", notionData);
      throw new Error(`Notion API failed [${notionResponse.status}]: ${JSON.stringify(notionData)}`);
    }

    console.log(`Notion page created for: ${email}, page ID: ${notionData.id}`);

    // === SEND SLACK NOTIFICATION (Fire-and-forget) ===
    if (SLACK_WEBHOOK_URL) {
      try {
        const isB2BLead = company && company.trim() !== '';
        const headerEmoji = isB2BLead ? '⭐ 🏢' : '🚀';
        
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

        if (isB2BLead) {
          blocks.push({
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Company:*\n${company}` },
              { type: "mrkdwn", text: `*Size:*\n${company_size || '_Not provided_'}` },
            ]
          });
        }

        if (use_case) {
          blocks.push({
            type: "section",
            text: { type: "mrkdwn", text: `*Use Case:*\n${use_case}` }
          });
        }

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

        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks }),
        });

        if (slackResponse.ok) {
          await slackResponse.text(); // Consume response body
          console.log(`Slack notification sent for: ${email}`);
        } else {
          const errorText = await slackResponse.text();
          console.error(`Slack webhook failed [${slackResponse.status}]: ${errorText}`);
        }
      } catch (slackError) {
        // Don't fail the whole request if Slack fails
        console.error("Slack notification error:", slackError);
      }
    } else {
      console.log("SLACK_WEBHOOK_URL not configured, skipping notification");
    }

    return new Response(
      JSON.stringify({ success: true, pageId: notionData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in waitlist-signup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

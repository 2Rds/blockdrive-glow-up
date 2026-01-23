import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistSignup {
  email: string;
  customer_type?: "personal" | "business";
  name?: string;
  company?: string;
  company_size?: string;
  use_case?: string;
  source?: string;
  ab_variant?: string;
  referrer?: string;
}

// Personal user email template
const getPersonalEmailTemplate = (userName: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #22c55e, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BlockDrive</h1>
    </div>
    
    <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Welcome, ${userName}! 🎉</h2>
    
    <p style="color: #a1a1aa; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
      You're officially on our waitlist! We're building the future of personal file security — 
      where <strong style="color: #ffffff;">you</strong> own your data, not big tech.
    </p>
    
    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #22c55e; font-size: 18px; margin: 0 0 16px 0;">Why you'll love BlockDrive</h3>
      <ul style="color: #d4d4d8; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong style="color: #ffffff;">Military-grade encryption</strong> — Your files are unreadable to everyone but you</li>
        <li><strong style="color: #ffffff;">Zero-knowledge privacy</strong> — We can't see your data, even if we wanted to</li>
        <li><strong style="color: #ffffff;">Simple sharing</strong> — Share securely with a link, revoke access instantly</li>
      </ul>
    </div>
    
    <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0;">What happens next?</h3>
      <ul style="color: #a1a1aa; line-height: 2; margin: 0; padding-left: 20px;">
        <li>We'll email you when early access opens</li>
        <li>Early supporters get priority access + special perks</li>
        <li>You'll receive exclusive updates on our progress</li>
      </ul>
    </div>
    
    <p style="color: #a1a1aa; line-height: 1.8; font-size: 16px; margin-bottom: 32px;">
      Have questions? Just reply to this email — we read every message.
    </p>
    
    <div style="border-top: 1px solid #27272a; padding-top: 24px; margin-top: 32px;">
      <p style="color: #71717a; font-size: 14px; margin: 0;">
        Cheers,<br/>
        <strong style="color: #a1a1aa;">The BlockDrive Team</strong>
      </p>
    </div>
  </div>
`;

// Business user email template
const getBusinessEmailTemplate = (
  userName: string,
  company?: string,
  companySize?: string,
  useCase?: string
) => {
  const companyName = company || "your organization";
  
  // Contextual messaging based on use case
  let useCaseMessage = "";
  if (useCase) {
    const useCaseMessages: Record<string, string> = {
      "Secure file sharing": "We noticed you're interested in <strong style='color: #ffffff;'>secure file sharing with clients and partners</strong>. BlockDrive makes it easy to share sensitive documents with granular access controls and instant revocation.",
      "Internal storage": "You're looking for <strong style='color: #ffffff;'>internal document storage with access control</strong> — perfect. BlockDrive gives your team encrypted storage with role-based permissions.",
      "Compliance": "Regulatory compliance is on your radar. BlockDrive is built with <strong style='color: #ffffff;'>HIPAA, SOC2, and GDPR requirements</strong> in mind, making audits a breeze.",
      "Replace cloud storage": "Ready to move beyond traditional cloud storage? BlockDrive offers <strong style='color: #ffffff;'>enterprise-grade security</strong> without the complexity.",
    };
    useCaseMessage = useCaseMessages[useCase] || "";
  }

  // Contextual messaging based on company size
  let sizeMessage = "";
  if (companySize) {
    const sizeMessages: Record<string, string> = {
      "1-10": "For lean teams like yours, we're building simple but powerful security tools.",
      "11-50": "Growing teams need scalable security — that's exactly what we're building.",
      "51-200": "For organizations your size, we're focused on team management and access controls.",
      "201-1000": "Enterprise-grade security for growing organizations, without enterprise complexity.",
      "1000+": "We're building for enterprise scale with the features large organizations need.",
    };
    sizeMessage = sizeMessages[companySize] || "";
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #ffffff;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #22c55e, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">BlockDrive</h1>
      </div>
      
      <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Welcome${company ? `, ${company}` : ""}! 🏢</h2>
      
      <p style="color: #a1a1aa; line-height: 1.8; font-size: 16px; margin-bottom: 24px;">
        Hi ${userName}, you're officially on our priority business waitlist. We're building 
        secure, decentralized storage designed for teams and organizations like ${companyName}.
      </p>

      ${useCaseMessage ? `
        <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="color: #d4d4d8; line-height: 1.8; font-size: 15px; margin: 0;">
            ${useCaseMessage}
          </p>
        </div>
      ` : ""}
      
      <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #22c55e; font-size: 18px; margin: 0 0 16px 0;">Built for teams like yours</h3>
        <ul style="color: #d4d4d8; line-height: 2; margin: 0; padding-left: 20px;">
          <li><strong style="color: #ffffff;">Team access controls</strong> — Fine-grained permissions for every file</li>
          <li><strong style="color: #ffffff;">Audit trails</strong> — Complete visibility into who accessed what, when</li>
          <li><strong style="color: #ffffff;">Instant revocation</strong> — Remove access immediately, no re-encryption needed</li>
          <li><strong style="color: #ffffff;">Compliance-ready</strong> — Built with HIPAA, SOC2, and GDPR in mind</li>
        </ul>
      </div>

      ${sizeMessage ? `
        <p style="color: #a1a1aa; line-height: 1.8; font-size: 15px; margin-bottom: 24px; font-style: italic;">
          ${sizeMessage}
        </p>
      ` : ""}
      
      <div style="background: linear-gradient(135deg, #22c55e, #10b981); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
        <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">
          🚀 Business leads get priority early access
        </p>
      </div>
      
      <p style="color: #a1a1aa; line-height: 1.8; font-size: 16px; margin-bottom: 32px;">
        Want to discuss your team's needs or schedule a demo? Just reply to this email — 
        we'd love to chat.
      </p>
      
      <div style="border-top: 1px solid #27272a; padding-top: 24px; margin-top: 32px;">
        <p style="color: #71717a; font-size: 14px; margin: 0;">
          Looking forward to working together,<br/>
          <strong style="color: #a1a1aa;">The BlockDrive Team</strong>
        </p>
      </div>
    </div>
  `;
};

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
    const { email, customer_type, name, company, company_size, use_case, source, ab_variant, referrer } = data;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if B2B based on explicit customer_type
    const isB2BLead = customer_type === "business";

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

    if (customer_type) {
      properties["Customer Type"] = { select: { name: customer_type === "business" ? "Business" : "Personal" } };
    }
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

    console.log(`Notion page created for: ${email}, page ID: ${notionData.id}, customer_type: ${customer_type || 'unknown'}`);

    // === SEND SLACK NOTIFICATION (Fire-and-forget) ===
    if (SLACK_WEBHOOK_URL) {
      try {
        const headerEmoji = isB2BLead ? '⭐ 🏢' : '👤';
        const headerText = isB2BLead ? 'New Business Lead!' : 'New Personal Signup!';
        
        const blocks: Record<string, unknown>[] = [
          {
            type: "header",
            text: { type: "plain_text", text: `${headerEmoji} ${headerText}`, emoji: true }
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Email:*\n${email}` },
              { type: "mrkdwn", text: `*Name:*\n${name || '_Not provided_'}` },
            ]
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Type:*\n${customer_type === 'business' ? '🏢 Business' : '👤 Personal'}` },
            ]
          }
        ];

        if (isB2BLead) {
          blocks.push({
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Company:*\n${company || '_Not provided_'}` },
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

    // === SEND CONFIRMATION EMAIL (Fire-and-forget) ===
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      try {
        const userName = name || email.split('@')[0];
        
        // Choose template based on customer type
        const emailHtml = isB2BLead
          ? getBusinessEmailTemplate(userName, company, company_size, use_case)
          : getPersonalEmailTemplate(userName);
        
        const emailSubject = isB2BLead
          ? `Welcome to BlockDrive${company ? `, ${company}` : ""}! 🏢`
          : "You're on the BlockDrive waitlist! 🎉";
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "BlockDrive <team@waitlist.blockdrive.co>",
            to: [email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log(`Confirmation email sent to: ${email}, id: ${emailData.id}, template: ${isB2BLead ? 'business' : 'personal'}`);
        } else {
          const errorData = await emailResponse.json();
          console.error(`Email send failed [${emailResponse.status}]:`, errorData);
        }
      } catch (emailError) {
        // Don't fail the whole request if email fails
        console.error("Confirmation email error:", emailError);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping confirmation email");
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

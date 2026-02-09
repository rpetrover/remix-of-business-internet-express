import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://businessinternetexpress.lovable.app";

// 5-step drip sequence templates
function getDripEmail(step: number, lead: { business_name: string; city?: string; state?: string }) {
  const name = lead.business_name;
  const location = [lead.city, lead.state].filter(Boolean).join(", ");

  const emails: Record<number, { subject: string; html: string }> = {
    1: {
      subject: `🎉 Fiber Internet Is Now Available for ${name}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <img src="https://businessinternetexpress.lovable.app/favicon.png" alt="BIE" style="height:40px;margin-bottom:20px;" />
          <h1 style="color:#1a1a2e;font-size:24px;">Great News, ${name}!</h1>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            <strong>Fiber internet has just become available in ${location || "your area"}!</strong> 
            This means your business can now access speeds up to <strong>30 Gbps</strong> — the fastest, 
            most reliable connection available.
          </p>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            As a certified Spectrum Business partner, we can get you connected with:
          </p>
          <ul style="font-size:15px;color:#333;line-height:1.8;">
            <li>✅ No data caps — ever</li>
            <li>✅ Free professional installation</li>
            <li>✅ Free modem &amp; WiFi equipment</li>
            <li>✅ 24/7 U.S.-based support</li>
            <li>✅ Plans starting at just <strong>$49.99/mo</strong></li>
          </ul>
          <div style="text-align:center;margin:30px 0;">
            <a href="${SITE_URL}?utm_source=outbound&utm_medium=email&utm_campaign=fiber_upgrade&utm_content=step1" 
               style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              Check Availability &amp; Order Now →
            </a>
          </div>
          <p style="font-size:14px;color:#666;">
            Or call us directly: <a href="tel:+18882303278" style="color:#2563eb;">1-888-230-FAST</a>
          </p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#999;">
            Business Internet Express | <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a>
          </p>
        </div>`,
    },
    2: {
      subject: `${name}, See How Fiber Can Transform Your Business`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <img src="https://businessinternetexpress.lovable.app/favicon.png" alt="BIE" style="height:40px;margin-bottom:20px;" />
          <h1 style="color:#1a1a2e;font-size:24px;">Still Using Cable or DSL?</h1>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            Hi ${name}, we recently let you know that fiber internet is now available in ${location || "your area"}.
            Here's why businesses are making the switch:
          </p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr style="background:#f8fafc;">
              <th style="padding:12px;text-align:left;border-bottom:2px solid #e2e8f0;">Feature</th>
              <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;">Cable/DSL</th>
              <th style="padding:12px;text-align:center;border-bottom:2px solid #e2e8f0;color:#2563eb;">Fiber</th>
            </tr>
            <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;">Download Speed</td><td style="text-align:center;padding:10px;">Up to 100 Mbps</td><td style="text-align:center;padding:10px;color:#2563eb;font-weight:bold;">Up to 30 Gbps</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;">Upload Speed</td><td style="text-align:center;padding:10px;">5-35 Mbps</td><td style="text-align:center;padding:10px;color:#2563eb;font-weight:bold;">Symmetrical</td></tr>
            <tr><td style="padding:10px;border-bottom:1px solid #f1f5f9;">Reliability</td><td style="text-align:center;padding:10px;">Weather-dependent</td><td style="text-align:center;padding:10px;color:#2563eb;font-weight:bold;">99.9% uptime</td></tr>
            <tr><td style="padding:10px;">Data Caps</td><td style="text-align:center;padding:10px;">Often limited</td><td style="text-align:center;padding:10px;color:#2563eb;font-weight:bold;">Unlimited</td></tr>
          </table>
          <div style="text-align:center;margin:30px 0;">
            <a href="${SITE_URL}?utm_source=outbound&utm_medium=email&utm_campaign=fiber_upgrade&utm_content=step2" 
               style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              View Plans &amp; Pricing →
            </a>
          </div>
          <p style="font-size:14px;color:#666;">Questions? Call <a href="tel:+18882303278" style="color:#2563eb;">1-888-230-FAST</a></p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#999;">Business Internet Express | <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a></p>
        </div>`,
    },
    3: {
      subject: `⚡ Limited-Time: Free Installation for ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <img src="https://businessinternetexpress.lovable.app/favicon.png" alt="BIE" style="height:40px;margin-bottom:20px;" />
          <h1 style="color:#1a1a2e;font-size:24px;">Free Installation — Act Now!</h1>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            ${name}, for a limited time, businesses upgrading to fiber internet get:
          </p>
          <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;margin:20px 0;border-radius:4px;">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#1a1a2e;">🎁 FREE professional installation</p>
            <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#1a1a2e;">🎁 FREE modem &amp; WiFi equipment</p>
            <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#1a1a2e;">🎁 No long-term contracts required</p>
          </div>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            Most businesses are installed within <strong>24-48 hours</strong>. Don't wait — fiber availability 
            is limited and filling up fast in ${location || "your area"}.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${SITE_URL}?utm_source=outbound&utm_medium=email&utm_campaign=fiber_upgrade&utm_content=step3" 
               style="background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              Claim Free Installation →
            </a>
          </div>
          <p style="font-size:14px;color:#666;">Call now: <a href="tel:+18882303278" style="color:#2563eb;">1-888-230-FAST</a></p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#999;">Business Internet Express | <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a></p>
        </div>`,
    },
    4: {
      subject: `${name}, Your Competitors Are Already on Fiber`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <img src="https://businessinternetexpress.lovable.app/favicon.png" alt="BIE" style="height:40px;margin-bottom:20px;" />
          <h1 style="color:#1a1a2e;font-size:24px;">Don't Get Left Behind</h1>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            Hi ${name}, businesses in ${location || "your area"} are rapidly switching to fiber internet. 
            Here's what they're experiencing:
          </p>
          <div style="margin:20px 0;">
            <div style="padding:16px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
              <p style="margin:0;font-size:15px;color:#333;">
                <strong>"Our video calls never drop anymore and file uploads are instant."</strong>
                <br><span style="font-size:13px;color:#666;">— Local business owner</span>
              </p>
            </div>
            <div style="padding:16px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
              <p style="margin:0;font-size:15px;color:#333;">
                <strong>"We switched for the same price as our old cable plan. Best decision ever."</strong>
                <br><span style="font-size:13px;color:#666;">— Restaurant manager</span>
              </p>
            </div>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${SITE_URL}?utm_source=outbound&utm_medium=email&utm_campaign=fiber_upgrade&utm_content=step4" 
               style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              Upgrade Now →
            </a>
          </div>
          <p style="font-size:14px;color:#666;">Call <a href="tel:+18882303278" style="color:#2563eb;">1-888-230-FAST</a> — we're here 24/7</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#999;">Business Internet Express | <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a></p>
        </div>`,
    },
    5: {
      subject: `⏰ Final Reminder: Fiber Internet for ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <img src="https://businessinternetexpress.lovable.app/favicon.png" alt="BIE" style="height:40px;margin-bottom:20px;" />
          <h1 style="color:#1a1a2e;font-size:24px;">Last Chance, ${name}</h1>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            This is our final reminder that <strong>fiber internet is available for your business</strong> in ${location || "your area"}.
          </p>
          <p style="font-size:16px;color:#333;line-height:1.6;">
            We won't email you about this again, but the offer stands:
          </p>
          <div style="background:#fef3c7;border:1px solid #f59e0b;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-size:16px;color:#92400e;">
              ⚡ Speeds up to 30 Gbps<br>
              💰 Plans from $49.99/mo<br>
              🔧 Free installation &amp; equipment<br>
              📞 24/7 support at 1-888-230-FAST
            </p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${SITE_URL}?utm_source=outbound&utm_medium=email&utm_campaign=fiber_upgrade&utm_content=step5_final" 
               style="background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
              Get Connected Today →
            </a>
          </div>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:12px;color:#999;">Business Internet Express | <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a></p>
        </div>`,
    },
  };

  return emails[step] || emails[1];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, leadIds, campaignRunId } = await req.json();

    // Action: send next drip step to eligible leads
    if (action === "send-next-step") {
      // Get leads that have email and are eligible for the next drip step
      let query = supabase
        .from("outbound_leads")
        .select("*")
        .not("email", "is", null)
        .in("campaign_status", ["new", "email_sent"])
        .lt("drip_step", 5)
        .order("created_at", { ascending: true })
        .limit(50);

      if (leadIds && leadIds.length > 0) {
        query = query.in("id", leadIds);
      }
      if (campaignRunId) {
        query = query.eq("discovery_batch", campaignRunId);
      }

      const { data: leads, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      if (!leads || leads.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: "No eligible leads" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let sent = 0;
      let failed = 0;

      for (const lead of leads) {
        const nextStep = (lead.drip_step || 0) + 1;
        const emailContent = getDripEmail(nextStep, lead);
        const html = emailContent.html.replace(/\{\{email\}\}/g, encodeURIComponent(lead.email));

        try {
          await resend.emails.send({
            from: "Business Internet Express <service@businessinternetexpress.com>",
            to: [lead.email],
            subject: emailContent.subject,
            html,
          });

          await supabase
            .from("outbound_leads")
            .update({
              drip_step: nextStep,
              campaign_status: "email_sent",
              last_email_sent_at: new Date().toISOString(),
            })
            .eq("id", lead.id);

          sent++;
        } catch (err) {
          console.error(`Failed to email ${lead.email}:`, err);
          failed++;
        }
      }

      // Update campaign run if provided
      if (campaignRunId) {
        const { data: run } = await supabase
          .from("outbound_campaign_runs")
          .select("total_emails_sent")
          .eq("id", campaignRunId)
          .single();

        await supabase
          .from("outbound_campaign_runs")
          .update({ total_emails_sent: (run?.total_emails_sent || 0) + sent })
          .eq("id", campaignRunId);
      }

      return new Response(
        JSON.stringify({ success: true, sent, failed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send-next-step'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Outbound drip error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

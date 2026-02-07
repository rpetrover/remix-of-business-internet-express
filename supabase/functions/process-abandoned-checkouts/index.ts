import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Follow-up email sequence — aggressive cadence
const EMAIL_SEQUENCE = [
  {
    step: 1,
    delay_hours: 1,
    subject: "Don't miss out — your {plan} plan is waiting!",
    template: "urgency_reminder",
  },
  {
    step: 2,
    delay_hours: 24,
    subject: "Still looking for business internet? We saved your quote",
    template: "value_reminder",
  },
  {
    step: 3,
    delay_hours: 48,
    subject: "⚡ Limited time: Get installed in under 24 hours",
    template: "speed_install",
  },
  {
    step: 4,
    delay_hours: 120, // 5 days
    subject: "Your competitors are getting connected — are you?",
    template: "fomo",
  },
  {
    step: 5,
    delay_hours: 168, // 7 days
    subject: "Last chance: Complete your {plan} order today",
    template: "final_chance",
  },
];

// Call schedule: after email 2 and email 4
const CALL_AFTER_STEPS = [2, 4];

function generateEmailHtml(
  template: string,
  data: {
    name: string;
    plan: string;
    provider: string;
    price: string;
    speed: string;
    optOutUrl: string;
  }
): string {
  const { name, plan, provider, price, speed, optOutUrl } = data;
  const firstName = name?.split(" ")[0] || "there";

  const templates: Record<string, string> = {
    urgency_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #003087, #0052CC); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Plan Is Waiting! ⚡</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
          <p style="font-size: 16px; color: #333;">You were just looking at the <strong>${plan}</strong> plan from <strong>${provider}</strong>:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #003087;">
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #003087;">${plan}</p>
            ${speed ? `<p style="margin: 5px 0; color: #666;">Speed: ${speed}</p>` : ""}
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${price}/mo</p>
          </div>
          <p style="font-size: 16px; color: #333;">Many of our providers offer <strong>same-day or next-day installation</strong>. Complete your order now and get connected fast!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.businessinternetexpress.com/check-availability" style="background: #003087; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Order →</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or call us at <strong>1-888-230-FAST</strong> — our AI agents are available 24/7!</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Business Internet Express | <a href="${optOutUrl}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
    value_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #003087, #0052CC); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">We Saved Your Quote 📋</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
          <p style="font-size: 16px; color: #333;">We noticed you haven't completed your business internet order yet. Here's a quick reminder of what you selected:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #003087;">
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #003087;">${provider} — ${plan}</p>
            ${speed ? `<p style="margin: 5px 0; color: #666;">Speed: ${speed}</p>` : ""}
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${price}/mo</p>
          </div>
          <h3 style="color: #003087;">Why businesses choose us:</h3>
          <ul style="color: #333; line-height: 1.8;">
            <li>✅ 28+ providers compared for the best price</li>
            <li>✅ Same-day & next-day installation available</li>
            <li>✅ No extra cost — providers pay us, not you</li>
            <li>✅ 24/7 AI-powered support</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.businessinternetexpress.com/check-availability" style="background: #003087; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Order →</a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Business Internet Express | <a href="${optOutUrl}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
    speed_install: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e65100, #ff8f00); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚡ Get Installed in Under 24 Hours</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
          <p style="font-size: 16px; color: #333;">Did you know many of our providers can have your business internet <strong>installed within 24 hours</strong>?</p>
          <p style="font-size: 16px; color: #333;">Your selected plan:</p>
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e65100;">
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #e65100;">${provider} — ${plan}</p>
            ${speed ? `<p style="margin: 5px 0; color: #666;">Speed: ${speed}</p>` : ""}
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${price}/mo</p>
          </div>
          <p style="font-size: 16px; color: #333;">Every day without reliable internet is a day your business falls behind. <strong>Let's get you connected today.</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.businessinternetexpress.com/check-availability" style="background: #e65100; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Order Now — Install Tomorrow →</a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Business Internet Express | <a href="${optOutUrl}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
    fomo: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1b5e20, #43a047); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Competitors Are Getting Connected 🏃</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
          <p style="font-size: 16px; color: #333;">In the time since you started shopping for business internet, <strong>hundreds of other businesses</strong> have already signed up and gotten connected.</p>
          <p style="font-size: 16px; color: #333;">Reliable internet isn't just a utility — it's a <strong>competitive advantage</strong>. Faster speeds mean:</p>
          <ul style="color: #333; line-height: 1.8;">
            <li>🚀 Better video calls and customer interactions</li>
            <li>☁️ Faster cloud app performance</li>
            <li>💰 More efficient operations = more revenue</li>
            <li>🔒 Stronger security with business-grade service</li>
          </ul>
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 16px; color: #1b5e20;">Your saved plan: <strong>${provider} — ${plan}</strong> at <strong>${price}/mo</strong></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.businessinternetexpress.com/check-availability" style="background: #1b5e20; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Get Connected Now →</a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Business Internet Express | <a href="${optOutUrl}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
    final_chance: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #b71c1c, #e53935); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Last Chance — Your Quote Expires Soon</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; color: #333;">Hi ${firstName},</p>
          <p style="font-size: 16px; color: #333;">This is our final reminder about your business internet quote. After today, we'll stop sending follow-ups, but we'll always be here when you're ready.</p>
          <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b71c1c;">
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #b71c1c;">${provider} — ${plan}</p>
            ${speed ? `<p style="margin: 5px 0; color: #666;">Speed: ${speed}</p>` : ""}
            <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #333;">${price}/mo</p>
          </div>
          <p style="font-size: 16px; color: #333;"><strong>Remember:</strong> Our service is completely free. Providers pay us, so you get the same price (or better) as going direct. There's literally no downside.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.businessinternetexpress.com/check-availability" style="background: #b71c1c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Your Order — Final Reminder →</a>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">Or call <strong>1-888-230-FAST</strong> anytime — we're available 24/7!</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Business Internet Express | <a href="${optOutUrl}" style="color: #999;">Unsubscribe</a></p>
        </div>
      </div>
    `,
  };

  return templates[template] || templates.urgency_reminder;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);
    const siteUrl = "https://www.businessinternetexpress.com";

    // Get all active abandoned checkouts that haven't opted out or converted
    const { data: checkouts, error: fetchError } = await supabase
      .from("abandoned_checkouts")
      .select("*")
      .eq("status", "abandoned")
      .eq("opted_out", false)
      .eq("converted", false)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;

    const results = { emails_sent: 0, calls_initiated: 0, errors: 0 };

    for (const checkout of checkouts || []) {
      const hoursSinceCreation =
        (Date.now() - new Date(checkout.created_at).getTime()) / (1000 * 60 * 60);

      // Find the next email step to send
      const nextStep = EMAIL_SEQUENCE.find(
        (step) => step.step === checkout.follow_up_count + 1
      );

      if (!nextStep) continue; // All emails sent
      if (hoursSinceCreation < nextStep.delay_hours) continue; // Not time yet

      // Check if this step was already executed
      const { data: existingAction } = await supabase
        .from("follow_up_actions")
        .select("id")
        .eq("checkout_id", checkout.id)
        .eq("sequence_step", nextStep.step)
        .eq("action_type", "email")
        .maybeSingle();

      if (existingAction) continue; // Already sent

      // Send the follow-up email
      try {
        const subject = nextStep.subject.replace("{plan}", checkout.selected_plan || "internet");
        const optOutUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(checkout.email)}`;

        const html = generateEmailHtml(nextStep.template, {
          name: checkout.customer_name || "there",
          plan: checkout.selected_plan || "Business Internet",
          provider: checkout.selected_provider || "our recommended provider",
          price: checkout.monthly_price ? `$${checkout.monthly_price}` : "competitive pricing",
          speed: checkout.speed || "",
          optOutUrl,
        });

        const emailResult = await resend.emails.send({
          from: "Business Internet Express <service@businessinternetexpress.com>",
          to: [checkout.email],
          subject,
          html,
        });

        // Log the action
        await supabase.from("follow_up_actions").insert({
          checkout_id: checkout.id,
          action_type: "email",
          sequence_step: nextStep.step,
          subject,
          status: "sent",
          response_data: emailResult,
          executed_at: new Date().toISOString(),
        });

        // Update checkout
        await supabase
          .from("abandoned_checkouts")
          .update({
            follow_up_count: nextStep.step,
            last_follow_up_at: new Date().toISOString(),
          })
          .eq("id", checkout.id);

        results.emails_sent++;

        // Schedule outbound call after specific email steps
        if (CALL_AFTER_STEPS.includes(nextStep.step) && twilioSid && twilioToken && twilioPhone && checkout.phone) {
          try {
            // Initiate Twilio call
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`;
            const twimlUrl = `${supabaseUrl}/functions/v1/outbound-call-handler?checkout_id=${checkout.id}`;

            const callParams = new URLSearchParams({
              To: checkout.phone.startsWith("+") ? checkout.phone : `+1${checkout.phone}`,
              From: twilioPhone,
              Url: twimlUrl,
              StatusCallback: `${supabaseUrl}/functions/v1/outbound-call-handler?action=status&checkout_id=${checkout.id}`,
              StatusCallbackEvent: "completed",
            });

            const callResponse = await fetch(twilioUrl, {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: callParams.toString(),
            });

            const callData = await callResponse.json();

            // Log the call action
            await supabase.from("follow_up_actions").insert({
              checkout_id: checkout.id,
              action_type: "call",
              sequence_step: nextStep.step,
              status: callResponse.ok ? "completed" : "failed",
              response_data: callData,
              executed_at: new Date().toISOString(),
            });

            if (callResponse.ok) results.calls_initiated++;
          } catch (callError) {
            console.error("Call error:", callError);
            results.errors++;
          }
        }
      } catch (emailError) {
        console.error("Email error for checkout", checkout.id, emailError);

        await supabase.from("follow_up_actions").insert({
          checkout_id: checkout.id,
          action_type: "email",
          sequence_step: nextStep.step,
          status: "failed",
          response_data: { error: String(emailError) },
          executed_at: new Date().toISOString(),
        });

        results.errors++;
      }
    }

    console.log("Processing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing abandoned checkouts:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

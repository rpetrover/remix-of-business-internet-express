import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Resend sends inbound emails as POST with webhook payload
    const payload = await req.json();
    console.log("Inbound email received:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract email data from Resend webhook payload
    const fromEmail = payload.from || payload.data?.from || '';
    const fromName = payload.from_name || payload.data?.from_name || null;
    const toEmail = payload.to || payload.data?.to || 'service@businessinternetexpress.com';
    const emailSubject = payload.subject || payload.data?.subject || '(No subject)';
    const bodyHtml = payload.html || payload.data?.html || null;
    const bodyText = payload.text || payload.data?.text || null;

    // Store the inbound email
    const { data: emailData, error: insertError } = await supabase.from("emails").insert({
      direction: "inbound",
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      subject: emailSubject,
      body_html: bodyHtml,
      body_text: bodyText,
      status: "received",
    }).select().single();

    if (insertError) {
      console.error("Error storing inbound email:", insertError);
      throw insertError;
    }

    // Check AI config for auto-reply
    const { data: aiConfig } = await supabase
      .from("email_ai_config")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (aiConfig && emailData) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (LOVABLE_API_KEY) {
        // Build training examples into the prompt
        let trainingContext = "";
        const examples = (aiConfig.training_examples as any[]) || [];
        if (examples.length > 0) {
          trainingContext = "\n\nHere are examples of how to respond:\n" +
            examples.map((ex: any, i: number) =>
              `Example ${i + 1}:\nInbound: ${ex.inbound}\nResponse: ${ex.response}`
            ).join("\n\n");
        }

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: aiConfig.system_prompt + trainingContext,
              },
              {
                role: "user",
                content: `From: ${fromName || fromEmail}\nSubject: ${emailSubject}\n\n${bodyText || bodyHtml || ''}`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiReply = aiData.choices?.[0]?.message?.content;

          if (aiReply) {
            if (aiConfig.mode === "auto") {
              // Auto-reply: send immediately
              const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
              await resend.emails.send({
                from: "Business Internet Express <noreply@businessinternetexpress.com>",
                to: [fromEmail],
                subject: `Re: ${emailSubject}`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="padding: 24px;">${aiReply.replace(/\n/g, "<br/>")}</div>
                  <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                    Business Internet Express | businessinternetexpress.com
                  </div>
                </div>`,
              });

              // Log the auto-reply
              await supabase.from("emails").insert({
                direction: "outbound",
                from_email: "noreply@businessinternetexpress.com",
                from_name: "Business Internet Express",
                to_email: fromEmail,
                to_name: fromName,
                subject: `Re: ${emailSubject}`,
                body_html: aiReply,
                body_text: aiReply,
                status: "sent",
                ai_auto_replied: true,
              });

              // Mark original as replied
              await supabase.from("emails").update({
                status: "replied",
                ai_auto_replied: true,
              }).eq("id", emailData.id);

              console.log("AI auto-reply sent to:", fromEmail);
            } else {
              // Draft mode: save the draft for review
              await supabase.from("emails").update({
                ai_draft: aiReply,
              }).eq("id", emailData.id);

              console.log("AI draft saved for email:", emailData.id);
            }
          }
        } else {
          const errorText = await aiResponse.text();
          console.error("AI gateway error:", aiResponse.status, errorText);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing inbound email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

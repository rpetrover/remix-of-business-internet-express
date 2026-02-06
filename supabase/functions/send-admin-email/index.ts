import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { to, toName, subject, body, inReplyTo } = await req.json();

    if (!to?.trim() || !subject?.trim() || !body?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Business Internet Express <noreply@businessinternetexpress.com>",
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 24px;">
            ${body.replace(/\n/g, '<br/>')}
          </div>
          <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            Business Internet Express | businessinternetexpress.com
          </div>
        </div>
      `,
    });

    console.log("Admin email sent:", emailResponse);

    // Log the outbound email in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("emails").insert({
      direction: "outbound",
      from_email: "noreply@businessinternetexpress.com",
      from_name: "Business Internet Express",
      to_email: to,
      to_name: toName || null,
      subject,
      body_html: body,
      body_text: body,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

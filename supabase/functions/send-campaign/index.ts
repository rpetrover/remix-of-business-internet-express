import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const { campaignId } = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Missing campaignId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get pending recipients
    const { data: contacts, error: contactsError } = await supabase
      .from("campaign_contacts")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("status", "pending");

    if (contactsError) throw contactsError;
    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No pending recipients" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark campaign as sending
    await supabase.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

    let sentCount = 0;
    let failedCount = 0;

    // Send to each recipient
    for (const contact of contacts) {
      try {
        await resend.emails.send({
          from: "Business Internet Express <noreply@businessinternetexpress.com>",
          to: [contact.email],
          subject: campaign.subject,
          html: campaign.body_html || `<p>${campaign.subject}</p>`,
        });

        await supabase
          .from("campaign_contacts")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", contact.id);

        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to ${contact.email}:`, err.message);
        await supabase
          .from("campaign_contacts")
          .update({ status: "failed" })
          .eq("id", contact.id);
        failedCount++;
      }
    }

    // Update campaign stats
    await supabase.from("campaigns").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: (campaign.sent_count || 0) + sentCount,
      failed_count: (campaign.failed_count || 0) + failedCount,
    }).eq("id", campaignId);

    console.log(`Campaign "${campaign.name}" sent: ${sentCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, failed: failedCount }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

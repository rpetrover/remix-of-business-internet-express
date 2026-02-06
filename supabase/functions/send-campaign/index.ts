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
    // Authenticate and authorize admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = claimsData.claims.sub as string;
    const { data: isAdmin } = await supabaseAuth.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { campaignId } = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Missing campaignId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for database operations
    const supabaseService = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get campaign
    const { data: campaign, error: campaignError } = await supabaseService
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Get pending recipients
    const { data: contacts, error: contactsError } = await supabaseService
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
    await supabaseService.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

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

        await supabaseService
          .from("campaign_contacts")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", contact.id);

        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to ${contact.email}:`, err.message);
        await supabaseService
          .from("campaign_contacts")
          .update({ status: "failed" })
          .eq("id", contact.id);
        failedCount++;
      }
    }

    // Update campaign stats
    await supabaseService.from("campaigns").update({
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
      JSON.stringify({ error: "Failed to send campaign" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

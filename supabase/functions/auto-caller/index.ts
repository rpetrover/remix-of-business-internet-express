import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELEVENLABS_AGENT_ID = "agent_4701kgtb1mdhfjkv2brwt1a1s68j";

// Determine timezone from ZIP code prefix
function getTimezoneForZip(zip: string): string {
  const num = parseInt(zip.substring(0, 3));

  // Pacific Time: CA (900-961), OR (970-979), WA (980-994), NV (889-898)
  if ((num >= 900 && num <= 961) || (num >= 970 && num <= 994) || (num >= 889 && num <= 898)) {
    return "America/Los_Angeles";
  }
  // Mountain Time: AZ (850-865), CO (800-816), ID (832-838), MT (590-599), NM (870-884), UT (840-847), WY (820-831)
  if ((num >= 850 && num <= 865) || (num >= 800 && num <= 816) || (num >= 832 && num <= 838) ||
      (num >= 590 && num <= 599) || (num >= 870 && num <= 884) || (num >= 840 && num <= 847) ||
      (num >= 820 && num <= 831)) {
    return "America/Denver";
  }
  // Central Time
  if ((num >= 750 && num <= 799) || (num >= 600 && num <= 629) || (num >= 530 && num <= 549) ||
      (num >= 550 && num <= 567) || (num >= 500 && num <= 528) || (num >= 630 && num <= 658) ||
      (num >= 716 && num <= 729) || (num >= 700 && num <= 714) || (num >= 386 && num <= 397) ||
      (num >= 350 && num <= 369) || (num >= 730 && num <= 749) || (num >= 660 && num <= 679) ||
      (num >= 680 && num <= 693) || (num >= 570 && num <= 577) || (num >= 580 && num <= 588) ||
      (num >= 380 && num <= 385)) {
    return "America/Chicago";
  }
  // Default: Eastern Time
  return "America/New_York";
}

// Check if 8AM-10PM in lead's local timezone
function isWithinCallingHours(zip: string): boolean {
  const tz = getTimezoneForZip(zip);
  const now = new Date();
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const hour = localTime.getHours();
  return hour >= 8 && hour < 22;
}

function formatPhoneNumber(phone: string): string {
  let phoneNumber = phone.replace(/[^0-9+]/g, "");
  if (!phoneNumber.startsWith("+")) {
    if (phoneNumber.startsWith("1") && phoneNumber.length === 11) {
      phoneNumber = "+" + phoneNumber;
    } else {
      phoneNumber = "+1" + phoneNumber;
    }
  }
  return phoneNumber;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get("ELEVENLABS_PHONE_NUMBER_ID");

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_PHONE_NUMBER_ID) {
      throw new Error("ElevenLabs credentials not configured");
    }

    // Fetch eligible leads
    const { data: leads, error: fetchError } = await supabase
      .from("outbound_leads")
      .select("*")
      .not("phone", "is", null)
      .not("campaign_status", "in", '("converted","not_interested","do_not_contact")')
      .or("last_call_at.is.null,last_call_at.lt." + new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .order("is_fiber_launch_area", { ascending: false, nullsFirst: false })
      .order("last_call_at", { ascending: true, nullsFirst: true })
      .limit(20);

    if (fetchError) throw fetchError;
    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ success: true, called: 0, message: "No eligible leads to call" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to leads within calling hours
    const callableLeads = leads.filter((lead: any) => lead.zip && isWithinCallingHours(lead.zip));

    if (callableLeads.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          called: 0,
          message: "No leads within calling hours (8AM-10PM local time)",
          totalEligible: leads.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let called = 0;
    let failed = 0;
    const maxCallsPerRun = 5;

    for (const lead of callableLeads.slice(0, maxCallsPerRun)) {
      try {
        const phoneNumber = formatPhoneNumber(lead.phone);

        // Use ElevenLabs native Twilio outbound call API
        const elResponse = await fetch(
          "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              agent_id: ELEVENLABS_AGENT_ID,
              agent_phone_number_id: ELEVENLABS_PHONE_NUMBER_ID,
              to_number: phoneNumber,
              conversation_initiation_client_data: {
                dynamic_variables: {
                  lead_id: lead.id,
                  business_name: lead.business_name,
                  city: lead.city || "your area",
                  state: lead.state || "",
                },
              },
            }),
          }
        );

        const elData = await elResponse.json();

        if (!elResponse.ok) {
          console.error(`ElevenLabs error for ${lead.business_name}:`, elData);
          failed++;
          continue;
        }

        // Update lead
        await supabase
          .from("outbound_leads")
          .update({
            campaign_status: "called",
            last_call_at: new Date().toISOString(),
            call_sid: elData.callSid || null,
          })
          .eq("id", lead.id);

        // Log call record
        await supabase.from("call_records").insert({
          direction: "outbound",
          callee_phone: phoneNumber,
          customer_name: lead.business_name,
          customer_email: lead.email,
          status: "initiated",
          call_sid: elData.callSid || null,
          conversation_id: elData.conversation_id || null,
        });

        called++;
        console.log(`✅ Called ${lead.business_name} (${lead.city}, ${lead.state}) - ${elData.callSid}`);

        // Delay between calls
        await new Promise((r) => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to call ${lead.business_name}:`, e);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        called,
        failed,
        totalEligible: leads.length,
        withinCallingHours: callableLeads.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-caller error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELEVENLABS_AGENT_ID = "agent_4701kgtb1mdhfjkv2brwt1a1s68j";

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

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const leadId = url.searchParams.get("lead_id");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // --- Twilio status callback (still works with ElevenLabs native integration) ---
  if (action === "status") {
    try {
      const formData = await req.formData();
      const callStatus = formData.get("CallStatus")?.toString();
      const callDuration = formData.get("CallDuration")?.toString();
      const callSid = formData.get("CallSid")?.toString();
      const recordingUrl = formData.get("RecordingUrl")?.toString();
      const to = formData.get("To")?.toString();
      const from = formData.get("From")?.toString();

      if (leadId) {
        const { data: lead } = await supabase
          .from("outbound_leads")
          .select("business_name, email")
          .eq("id", leadId)
          .maybeSingle();

        await supabase
          .from("outbound_leads")
          .update({
            call_outcome: callStatus === "completed" ? "answered" : callStatus || "no_answer",
            call_sid: callSid,
            call_recording_url: recordingUrl ? `${recordingUrl}.mp3` : null,
            last_call_at: new Date().toISOString(),
            campaign_status: "called",
          })
          .eq("id", leadId);

        await supabase.from("call_records").insert({
          direction: "outbound",
          caller_phone: from || null,
          callee_phone: to || null,
          customer_name: lead?.business_name || null,
          customer_email: lead?.email || null,
          duration_seconds: callDuration ? parseInt(callDuration, 10) : null,
          recording_url: recordingUrl ? `${recordingUrl}.mp3` : null,
          status: callStatus === "completed" ? "completed" : callStatus || "unknown",
          call_sid: callSid || null,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Status callback error:", error);
      return new Response("Error", { status: 500 });
    }
  }

  // --- Recording callback ---
  if (action === "recording") {
    try {
      const formData = await req.formData();
      const recordingUrl = formData.get("RecordingUrl")?.toString();
      const callSid = formData.get("CallSid")?.toString();

      if (callSid && recordingUrl) {
        await supabase
          .from("call_records")
          .update({ recording_url: `${recordingUrl}.mp3` })
          .eq("call_sid", callSid);

        if (leadId) {
          await supabase
            .from("outbound_leads")
            .update({ call_recording_url: `${recordingUrl}.mp3` })
            .eq("id", leadId);
        }
      }
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Recording callback error:", error);
      return new Response("Error", { status: 500 });
    }
  }

  // --- Initiate outbound call via ElevenLabs native Twilio integration ---
  if (action === "call") {
    try {
      if (!leadId) {
        return new Response(
          JSON.stringify({ error: "lead_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: lead, error: leadErr } = await supabase
        .from("outbound_leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadErr || !lead) {
        return new Response(
          JSON.stringify({ error: "Lead not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!lead.phone) {
        return new Response(
          JSON.stringify({ error: "Lead has no phone number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
      const ELEVENLABS_PHONE_NUMBER_ID = Deno.env.get("ELEVENLABS_PHONE_NUMBER_ID");

      if (!ELEVENLABS_API_KEY || !ELEVENLABS_PHONE_NUMBER_ID) {
        throw new Error("ElevenLabs credentials not configured");
      }

      const phoneNumber = formatPhoneNumber(lead.phone);

      // Randomly select opening variant A–E
      const variants = ["A", "B", "C", "D", "E"];
      const openingVariant = variants[Math.floor(Math.random() * variants.length)];
      console.log(`Selected opening variant: ${openingVariant} for lead ${leadId}`);

      // Use ElevenLabs native Twilio outbound call API
      // Connect buffer: 1.0s pause before agent audio to avoid talking over callee's "hello"
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
            first_message: "", // Empty first message = agent starts in listening mode
            conversation_initiation_client_data: {
              dynamic_variables: {
                lead_id: leadId,
                business_name: lead.business_name,
                city: lead.city || "your area",
                state: lead.state || "",
                opening_variant: openingVariant,
                connect_buffer_ms: "1000",
              },
            },
          }),
        }
      );

      const elData = await elResponse.json();
      console.log("ElevenLabs outbound call response:", JSON.stringify(elData));

      if (!elResponse.ok) {
        throw new Error(`ElevenLabs error: ${elData.message || JSON.stringify(elData)}`);
      }

      // Update lead status + log opening variant
      await supabase
        .from("outbound_leads")
        .update({
          campaign_status: "called",
          last_call_at: new Date().toISOString(),
          call_sid: elData.callSid || null,
          opening_variant: openingVariant,
        })
        .eq("id", leadId);

      // Log call record with conversation_id for later transcript/recording fetch
      await supabase.from("call_records").insert({
        direction: "outbound",
        callee_phone: phoneNumber,
        customer_name: lead.business_name,
        customer_email: lead.email,
        status: "initiated",
        call_sid: elData.callSid || null,
        conversation_id: elData.conversation_id || null,
      });

      return new Response(
        JSON.stringify({
          success: true,
          callSid: elData.callSid,
          conversationId: elData.conversation_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Outbound call error:", error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Invalid action. Use ?action=call&lead_id=..." }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

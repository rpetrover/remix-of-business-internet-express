import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

  // --- Twilio status callback ---
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

        // Also save to call_records
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

  // --- Initiate outbound call to a lead ---
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

      const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
      const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
      const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
      const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
      const ELEVENLABS_AGENT_ID = "agent_4701kgtb1mdhfjkv2brwt1a1s68j";

      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        throw new Error("Twilio credentials not configured");
      }

      // Get ElevenLabs signed URL for the call
      let signedUrl = "";
      if (ELEVENLABS_API_KEY) {
        try {
          const elRes = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
            { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
          );
          const elData = await elRes.json();
          signedUrl = elData.signed_url || "";
        } catch (e) {
          console.error("ElevenLabs signed URL error:", e);
        }
      }

      // Build TwiML - use ElevenLabs AI agent if available, otherwise use scripted message
      const functionUrl = `${supabaseUrl}/functions/v1/outbound-sales-call`;
      let twiml: string;

      if (signedUrl) {
        // Connect to ElevenLabs conversational AI agent
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${signedUrl}">
      <Parameter name="lead_id" value="${leadId}" />
      <Parameter name="business_name" value="${lead.business_name}" />
      <Parameter name="city" value="${lead.city || ""}" />
    </Stream>
  </Connect>
</Response>`;
      } else {
        // Fallback: scripted message
        twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">
    Hi, this is Business Internet Express calling for ${lead.business_name}.
    Great news! Fiber internet is now available in ${lead.city || "your area"}.
    You can now get speeds up to 30 gigabits per second starting at just $49.99 per month, 
    with free installation and no data caps.
    To learn more or place an order, visit businessinternetexpress.com or call us at 1-888-230-FAST.
    That's 1-888-230-3278. Thank you and have a great day!
  </Say>
</Response>`;
      }

      // Format phone number
      let phoneNumber = lead.phone.replace(/[^0-9+]/g, "");
      if (!phoneNumber.startsWith("+")) {
        if (phoneNumber.startsWith("1") && phoneNumber.length === 11) {
          phoneNumber = "+" + phoneNumber;
        } else {
          phoneNumber = "+1" + phoneNumber;
        }
      }

      // Initiate the Twilio call
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
      const callParams = new URLSearchParams({
        To: phoneNumber,
        From: TWILIO_PHONE_NUMBER,
        Twiml: twiml,
        StatusCallback: `${functionUrl}?action=status&lead_id=${leadId}`,
        StatusCallbackEvent: "completed",
        Record: "true",
        RecordingStatusCallback: `${functionUrl}?action=recording&lead_id=${leadId}`,
      });

      const twilioRes = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: callParams.toString(),
      });

      const twilioData = await twilioRes.json();

      if (!twilioRes.ok) {
        throw new Error(`Twilio error: ${twilioData.message || JSON.stringify(twilioData)}`);
      }

      // Update lead status
      await supabase
        .from("outbound_leads")
        .update({
          campaign_status: "called",
          last_call_at: new Date().toISOString(),
          call_sid: twilioData.sid,
        })
        .eq("id", leadId);

      return new Response(
        JSON.stringify({ success: true, callSid: twilioData.sid }),
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

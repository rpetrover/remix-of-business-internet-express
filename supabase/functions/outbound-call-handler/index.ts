import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const checkoutId = url.searchParams.get("checkout_id");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle call status callback from Twilio
  if (action === "status") {
    try {
      const formData = await req.formData();
      const callStatus = formData.get("CallStatus")?.toString();
      const callDuration = formData.get("CallDuration")?.toString();
      const callSid = formData.get("CallSid")?.toString();
      const recordingUrl = formData.get("RecordingUrl")?.toString();
      const to = formData.get("To")?.toString();
      const from = formData.get("From")?.toString();

      if (checkoutId) {
        // Update follow_up_actions
        await supabase
          .from("follow_up_actions")
          .update({
            status: callStatus === "completed" ? "completed" : "no_answer",
            response_data: { callStatus, callDuration, callSid, recordingUrl },
          })
          .eq("checkout_id", checkoutId)
          .eq("action_type", "call")
          .order("created_at", { ascending: false })
          .limit(1);

        // Get checkout info for the call record
        const { data: checkout } = await supabase
          .from("abandoned_checkouts")
          .select("customer_name, email, phone")
          .eq("id", checkoutId)
          .maybeSingle();

        // Save call record
        await supabase.from("call_records").insert({
          direction: "outbound",
          caller_phone: from || null,
          callee_phone: to || null,
          customer_name: checkout?.customer_name || null,
          customer_email: checkout?.email || null,
          duration_seconds: callDuration ? parseInt(callDuration, 10) : null,
          recording_url: recordingUrl ? `${recordingUrl}.mp3` : null,
          status: callStatus === "completed" ? "completed" : callStatus || "unknown",
          call_sid: callSid || null,
          related_checkout_id: checkoutId,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Status callback error:", error);
      return new Response("Error", { status: 500 });
    }
  }

  // Handle recording callback from Twilio
  if (action === "recording") {
    try {
      const formData = await req.formData();
      const recordingUrl = formData.get("RecordingUrl")?.toString();
      const callSid = formData.get("CallSid")?.toString();
      const recordingDuration = formData.get("RecordingDuration")?.toString();

      if (callSid && recordingUrl) {
        // Update existing call record with recording URL
        const { error } = await supabase
          .from("call_records")
          .update({
            recording_url: `${recordingUrl}.mp3`,
            duration_seconds: recordingDuration ? parseInt(recordingDuration, 10) : undefined,
          })
          .eq("call_sid", callSid);

        if (error) {
          console.error("Failed to update call record with recording:", error);
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Recording callback error:", error);
      return new Response("Error", { status: 500 });
    }
  }

  // Generate TwiML for the outbound call
  try {
    let customerName = "valued customer";
    let planName = "business internet";
    let providerName = "our recommended provider";
    let price = "";

    if (checkoutId) {
      const { data: checkout } = await supabase
        .from("abandoned_checkouts")
        .select("*")
        .eq("id", checkoutId)
        .maybeSingle();

      if (checkout) {
        customerName = checkout.customer_name?.split(" ")[0] || "valued customer";
        planName = checkout.selected_plan || "business internet";
        providerName = checkout.selected_provider || "our recommended provider";
        price = checkout.monthly_price ? `$${checkout.monthly_price} per month` : "";
      }
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">
    Hi ${customerName}, this is Business Internet Express calling. 
    We noticed you were recently looking at the ${planName} plan from ${providerName}${price ? ` at ${price}` : ""}.
    We wanted to make sure you got all the information you need and answer any questions.
    Our service is completely free — providers pay us, not you — so there's no extra cost to ordering through us.
    Plus, many of our providers offer same-day or next-day installation.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Matthew" language="en-US">
    If you'd like to complete your order or have any questions, just call us back at 1-888-230-FAST. 
    That's 1-888-230-3278. We're available 24/7 with AI-powered agents ready to help.
    Thank you ${customerName}, and have a great day!
  </Say>
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("TwiML generation error:", error);
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">
    Hi, this is Business Internet Express. We noticed you were recently shopping for business internet.
    Call us back at 1-888-230-FAST to complete your order. We're available 24/7. Thank you!
  </Say>
</Response>`;
    return new Response(fallbackTwiml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
};

serve(handler);

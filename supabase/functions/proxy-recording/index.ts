import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recording_url } = await req.json();
    if (!recording_url) {
      return new Response(JSON.stringify({ error: "recording_url required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const authHeader = btoa(`${accountSid}:${authToken}`);

    // Ensure .mp3 format
    let url = recording_url;
    if (!url.endsWith(".mp3") && !url.endsWith(".wav")) {
      url += ".mp3";
    }

    // If it's a relative Twilio URL, make it absolute
    if (url.startsWith("/")) {
      url = `https://api.twilio.com${url}`;
    }

    const resp = await fetch(url, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Twilio returned ${resp.status}` }), {
        status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await resp.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (e) {
    console.error("Recording proxy error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

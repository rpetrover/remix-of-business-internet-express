import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fetches conversation transcript, summary, and audio URL from ElevenLabs
// and updates the call_records table.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { call_record_id, conversation_id } = await req.json();

    if (!conversation_id) {
      return new Response(
        JSON.stringify({ error: "conversation_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch conversation details (transcript, metadata)
    const detailsRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}`,
      { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
    );

    if (!detailsRes.ok) {
      const errText = await detailsRes.text();
      throw new Error(`ElevenLabs details error ${detailsRes.status}: ${errText}`);
    }

    const details = await detailsRes.json();
    console.log("Conversation status:", details.status);

    // Build transcript from the transcript array
    let transcript = "";
    if (details.transcript && Array.isArray(details.transcript)) {
      transcript = details.transcript
        .map((t: any) => `${t.role === "agent" ? "Sarah" : "Customer"}: ${t.message}`)
        .join("\n");
    }

    // Get call duration
    const durationSeconds = details.call_duration_secs || null;

    // Determine call outcome from transcript content
    let callStatus = "completed";
    if (details.status === "processing") {
      callStatus = "processing";
    }

    // Generate AI summary using Lovable AI
    let summary = "";
    if (transcript) {
      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: "You are a sales call analyst. Summarize this outbound sales call in 2-3 sentences. Include: whether the customer was interested, any objections raised, the outcome (sale, callback requested, not interested, no answer, voicemail), and any action items. Be concise and factual.",
                },
                { role: "user", content: transcript },
              ],
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            summary = aiData.choices?.[0]?.message?.content || "";
          }
        }
      } catch (e) {
        console.error("AI summary error:", e);
      }
    }

    // Fetch audio recording URL
    let recordingUrl = null;
    if (details.has_audio) {
      // The audio endpoint returns the audio file directly
      // We store the URL for on-demand playback
      recordingUrl = `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}/audio`;
    }

    // Update call record
    const updateData: any = {
      conversation_id,
      status: callStatus,
    };

    if (transcript) updateData.transcript = transcript;
    if (summary) updateData.summary = summary;
    if (durationSeconds) updateData.duration_seconds = durationSeconds;
    if (recordingUrl) updateData.recording_url = recordingUrl;

    if (call_record_id) {
      await supabase
        .from("call_records")
        .update(updateData)
        .eq("id", call_record_id);
    } else if (conversation_id) {
      // Try to find by conversation_id
      await supabase
        .from("call_records")
        .update(updateData)
        .eq("conversation_id", conversation_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: details.status,
        has_transcript: !!transcript,
        has_summary: !!summary,
        has_audio: !!recordingUrl,
        duration_seconds: durationSeconds,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch call details error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

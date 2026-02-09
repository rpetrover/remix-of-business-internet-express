import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Webhook endpoint for ElevenLabs agent tool calls during outbound sales calls.
// Supports: log_gatekeeper, log_decision_maker, log_objection, log_callback, log_outcome
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tool_name, parameters } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const leadId = parameters?.lead_id;
    if (!leadId) {
      return new Response(
        JSON.stringify({ error: "lead_id is required in parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updateData: Record<string, any> = {};
    let responseMessage = "";

    switch (tool_name) {
      case "log_gatekeeper":
        updateData = {
          gatekeeper_encountered: true,
          notes: parameters.notes
            ? `Gatekeeper: ${parameters.notes}`
            : "Gatekeeper encountered",
        };
        responseMessage = "Gatekeeper encounter logged.";
        break;

      case "log_decision_maker":
        updateData = {
          decision_maker_reached: true,
          decision_maker_name: parameters.name || null,
          decision_maker_title: parameters.title || null,
        };
        responseMessage = "Decision maker info logged.";
        break;

      case "log_objection":
        // Append to existing objections array
        const { data: existing } = await supabase
          .from("outbound_leads")
          .select("objections_triggered")
          .eq("id", leadId)
          .single();

        const currentObjections = existing?.objections_triggered || [];
        const newObjection = parameters.objection || "unknown";
        updateData = {
          objections_triggered: [...currentObjections, newObjection],
        };
        responseMessage = `Objection "${newObjection}" logged.`;
        break;

      case "log_callback":
        updateData = {
          callback_time: parameters.callback_time || null,
          campaign_status: "callback",
          call_outcome: "callback_requested",
        };
        responseMessage = "Callback request logged.";
        break;

      case "log_outcome":
        updateData = {
          call_outcome: parameters.outcome || "unknown",
          campaign_status: parameters.outcome === "interested" ? "qualified" : "called",
          qualifying_answers: parameters.qualifying_answers || null,
        };
        responseMessage = `Call outcome "${parameters.outcome}" logged.`;
        break;

      case "log_dnc":
        updateData = {
          campaign_status: "dnc",
          call_outcome: "dnc",
          notes: "Do-Not-Call request honored",
        };
        responseMessage = "DNC request logged. Lead removed from calling list.";
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown tool: ${tool_name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
      .from("outbound_leads")
      .update(updateData)
      .eq("id", leadId);

    if (error) {
      console.error(`Error updating lead for ${tool_name}:`, error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${tool_name} logged for lead ${leadId}`);

    return new Response(
      JSON.stringify({ success: true, message: responseMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agent tools webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

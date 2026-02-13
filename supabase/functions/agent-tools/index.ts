import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Resolve a lead_id from fallback identifiers. If no lead exists, create one.
 * Priority: lead_id > conversation_id > phone > call_sid
 */
async function resolveLeadId(
  supabase: any,
  parameters: Record<string, any>
): Promise<string> {
  // 1. Direct lead_id provided
  if (parameters.lead_id) return parameters.lead_id;

  // 2. Try conversation_id lookup via call_records -> outbound_leads
  if (parameters.conversation_id) {
    const { data: callRec } = await supabase
      .from("call_records")
      .select("customer_name")
      .eq("conversation_id", parameters.conversation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (callRec?.customer_name) {
      const { data: lead } = await supabase
        .from("outbound_leads")
        .select("id")
        .eq("business_name", callRec.customer_name)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lead) return lead.id;
    }
  }

  // 3. Try phone lookup
  if (parameters.phone) {
    const { data: lead } = await supabase
      .from("outbound_leads")
      .select("id")
      .eq("phone", parameters.phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lead) return lead.id;
  }

  // 4. Try call_sid lookup
  if (parameters.call_sid) {
    const { data: lead } = await supabase
      .from("outbound_leads")
      .select("id")
      .eq("call_sid", parameters.call_sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lead) return lead.id;
  }

  // 5. Create a new placeholder lead
  const businessName =
    parameters.business_name || parameters.phone || "Unknown (auto-created)";
  const { data: newLead, error } = await supabase
    .from("outbound_leads")
    .insert({
      business_name: businessName,
      phone: parameters.phone || null,
      call_sid: parameters.call_sid || null,
      campaign_status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create fallback lead:", error);
    throw new Error("Could not resolve or create lead");
  }

  console.log(`Auto-created lead ${newLead.id} for tool call`);
  return newLead.id;
}

// Webhook endpoint for ElevenLabs agent tool calls during outbound sales calls.
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

    // Resolve lead_id via fallbacks — never fail just because lead_id is missing
    let leadId: string;
    try {
      leadId = await resolveLeadId(supabase, parameters || {});
    } catch (e) {
      console.error("Lead resolution failed:", e);
      // Return ok so the agent never speaks an error
      return new Response(
        JSON.stringify({ status: "ok" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updateData: Record<string, any> = {};

    switch (tool_name) {
      case "log_gatekeeper":
        updateData = {
          gatekeeper_encountered: true,
          notes: parameters.notes
            ? `Gatekeeper: ${parameters.notes}`
            : "Gatekeeper encountered",
        };
        break;

      case "log_decision_maker":
        updateData = {
          decision_maker_reached: true,
          decision_maker_name: parameters.name || null,
          decision_maker_title: parameters.title || null,
        };
        break;

      case "log_objection": {
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
        break;
      }

      case "log_callback":
        updateData = {
          callback_time: parameters.callback_time || null,
          campaign_status: "callback",
          call_outcome: "callback_requested",
        };
        break;

      case "log_outcome":
        updateData = {
          call_outcome: parameters.outcome || "unknown",
          campaign_status: parameters.outcome === "interested" ? "qualified" : "called",
          qualifying_answers: parameters.qualifying_answers || null,
        };
        break;

      case "log_dnc":
        updateData = {
          campaign_status: "dnc",
          call_outcome: "dnc",
          notes: "Do-Not-Call request honored",
        };
        break;

      case "log_zip_confirmation": {
        const rawInput = parameters.zip_raw_input || "";
        const parsed = parameters.zip_parsed || "";
        const confirmed = parameters.zip_confirmed === true;
        const retryCount = typeof parameters.zip_retry_count === "number" ? parameters.zip_retry_count : 0;

        updateData = {
          zip_raw_input: rawInput,
          zip_parsed: parsed,
          zip_confirmed: confirmed,
          zip_retry_count: retryCount,
        };

        if (confirmed && /^\d{5}$/.test(parsed)) {
          updateData.zip = parsed;
        }

        if (!confirmed && retryCount >= 2) {
          updateData.campaign_status = "callback";
          updateData.call_outcome = "zip_unresolved";
        }
        break;
      }

      case "log_address_component": {
        const component = parameters.component || "";
        const value = parameters.value || "";
        const step = parameters.step || "not_started";

        if (component === "street") updateData.address_street = value;
        else if (component === "city") updateData.address_city_collected = value;
        else if (component === "state") updateData.address_state_collected = value;

        updateData.address_collection_step = step;
        break;
      }

      case "log_turn_taking_metrics": {
        const metricsData: Record<string, any> = {};
        if (parameters.started_speaking_before_user !== undefined)
          metricsData.started_speaking_before_user = parameters.started_speaking_before_user;
        if (parameters.interruptions_count !== undefined)
          metricsData.interruptions_count = parameters.interruptions_count;
        if (parameters.no_input_reprompt_used !== undefined)
          metricsData.no_input_reprompt_used = parameters.no_input_reprompt_used;
        if (parameters.no_response_end !== undefined)
          metricsData.no_response_end = parameters.no_response_end;
        if (parameters.first_user_utterance_detected !== undefined)
          metricsData.first_user_utterance_detected = parameters.first_user_utterance_detected;
        if (parameters.time_to_first_agent_speech_ms !== undefined)
          metricsData.time_to_first_agent_speech_ms = parameters.time_to_first_agent_speech_ms;
        if (parameters.time_to_first_user_speech_ms !== undefined)
          metricsData.time_to_first_user_speech_ms = parameters.time_to_first_user_speech_ms;

        const { data: latestCall } = await supabase
          .from("call_records")
          .select("id")
          .eq("customer_name", parameters.business_name || "")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestCall) {
          await supabase
            .from("call_records")
            .update(metricsData)
            .eq("id", latestCall.id);
        }

        if (parameters.no_response_end) {
          updateData = { call_outcome: "no_response", campaign_status: "called" };
        }
        break;
      }

      default:
        // Unknown tool — return ok silently
        console.warn(`Unknown tool: ${tool_name}`);
        return new Response(
          JSON.stringify({ status: "ok" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("outbound_leads")
        .update(updateData)
        .eq("id", leadId);

      if (error) {
        console.error(`Error updating lead for ${tool_name}:`, error);
      }
    }

    console.log(`${tool_name} ok for lead ${leadId}`);

    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agent tools webhook error:", error);
    // Always return ok to prevent agent from speaking errors
    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

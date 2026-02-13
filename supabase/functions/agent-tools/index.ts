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

// ─── Plan Lookup Data (mirrors frontend src/data/providers.ts) ────────────────

interface PlanInfo {
  name: string;
  speed: string;
  price: string;
}

interface ProviderInfo {
  name: string;
  technology: string;
  plans: PlanInfo[];
  isPreferred?: boolean;
  nationwide?: boolean;
  dedicatedFiber?: boolean;
  zipPrefixes?: string[];
}

// Spectrum ZIP prefixes
const SPECTRUM_ZIP_PREFIXES = [
  "100","101","102","103","104","105","106","107","108","109",
  "110","111","112","113","114","115","116","117","118","119",
  "120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149",
  "200","201","202","203","204","205","206","207","208","209","210","211","212","213","214","215","216","217","218","219",
  "220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236",
  "270","271","272","273","274","275","276","277","278","279","280","281",
  "282","283","284","285","286","287","288","289","290","291","292","293","294","295","296","297","298","299",
  "300","301","302","303","304","305","306","307","308","309","310","311","312","313","314","315","316","317","318","319",
  "320","321","322","323","324","325","326","327","328","329","330","331","332","333","334","335","336","337","338","339",
  "340","341","342","343","344","345","346","347","348","349",
  "370","371","372","373","374","376","377","378","379","380","381","382","383","384","385",
  "386","387","388","389","390","391","392","393","394","395","396","397",
  "400","401","402","403","404","405","406","407","408","409","410","411","412","413","414","415","416","417","418",
  "430","431","432","433","434","435","436","437","438","439",
  "440","441","442","443","444","445","446","447","448","449",
  "450","451","452","453","454","455","456","457","458","459",
  "460","461","462","463","464","465","466","467","468","469","470","471","472","473","474","475","476","477","478","479",
  "480","481","482","483","484","485","486","487","488","489",
  "530","531","532","534","535","537","538","539",
  "540","541","542","543","544","545","546","547","548","549",
  "550","551","553","554","555","556","557","558","559",
  "600","601","602","603","604","605","606","607","608","609",
  "610","611","612","613","614","615","616","617","618","619",
  "750","751","752","753","754","755","756","757","758","759",
  "760","761","762","763","764","765","766","767","768","769",
  "770","771","772","773","774","775","776","777","778","779",
  "900","901","902","903","904","905","906","907","908","909",
  "910","911","912","913","914","915","916","917","918","919",
  "920","921","922","923","924","925","926","927","928",
  "930","931","932","933","934","935",
];

const PROVIDERS: ProviderInfo[] = [
  {
    name: "Spectrum Business",
    technology: "Cable / Fiber",
    isPreferred: true,
    zipPrefixes: SPECTRUM_ZIP_PREFIXES,
    plans: [
      { name: "Internet Premier", speed: "500 Mbps", price: "$65.00/mo" },
      { name: "Internet Ultra", speed: "750 Mbps", price: "$95.00/mo" },
      { name: "Internet Gig", speed: "1 Gbps", price: "$115.00/mo" },
    ],
  },
  {
    name: "AT&T Business",
    technology: "Fiber / IPBB",
    zipPrefixes: [
      "900","901","902","903","904","905","906","907","908","909","910","911","912","913","914","915","916","917","918","919","920","921","922","923","924","925","926","927","928","930","931","932","933","934","935","936","937","938","939",
      "750","751","752","753","754","755","756","757","758","759","760","761","762","763","764","765","766","767","768","769","770","771","772","773","774","775","776","777","778","779","780","781","782","783","784","785","786","787","788","789","790","791","792","793","794","795","796","797","798","799",
      "300","301","302","303","304","305","306","307","308","309","310","311","312","313","314","315","316","317","318","319",
      "320","321","322","323","324","325","326","327","328","329","330","331","332","333","334","335","336","337","338","339",
      "600","601","602","603","604","605","606","607","608","609","610","611","612","613","614","615","616","617","618","619",
      "430","431","432","433","434","435","436","437","438","439","440","441","442","443","444","445","446","447","448","449","450","451","452","453",
      "480","481","482","483","484","485","486","487","488","489",
      "460","461","462","463","464","465","466","467","468","469","470","471","472","473","474","475","476","477","478","479",
      "530","531","532","534","535","537","538","539",
      "270","271","272","273","274","275","276","277","278","279",
      "290","291","292","293","294","295","296",
    ],
    plans: [
      { name: "Business Internet 100", speed: "100 Mbps", price: "$40.00/mo" },
      { name: "Business Fiber 500", speed: "500 Mbps", price: "$55.00/mo" },
      { name: "Business Fiber 1 Gig", speed: "1 Gbps", price: "$80.00/mo" },
    ],
  },
  {
    name: "Viasat",
    technology: "Satellite",
    nationwide: true,
    plans: [
      { name: "Business 25", speed: "25 Mbps", price: "$99.99/mo" },
      { name: "Business 50", speed: "50 Mbps", price: "$149.99/mo" },
      { name: "Business 100", speed: "100 Mbps", price: "$199.99/mo" },
    ],
  },
];

function lookupPlans(zip: string): { spectrumAvailable: boolean; providers: { name: string; technology: string; isPreferred?: boolean; plans: PlanInfo[] }[] } {
  const prefix = zip.substring(0, 3);
  const matched: { name: string; technology: string; isPreferred?: boolean; plans: PlanInfo[] }[] = [];

  for (const p of PROVIDERS) {
    if (p.nationwide || (p.zipPrefixes && p.zipPrefixes.includes(prefix))) {
      matched.push({ name: p.name, technology: p.technology, isPreferred: p.isPreferred, plans: p.plans });
    }
  }

  const spectrumAvailable = SPECTRUM_ZIP_PREFIXES.includes(prefix);
  return { spectrumAvailable, providers: matched };
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

    // ─── lookup_plans: returns data directly, no lead resolution needed ───
    if (tool_name === "lookup_plans") {
      const zip = (parameters?.zip || "").replace(/\D/g, "").substring(0, 5);
      if (!zip || zip.length < 5) {
        return new Response(
          JSON.stringify({ status: "ok", providers: [], message: "I need a valid 5-digit ZIP code to look up plans." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = lookupPlans(zip);
      console.log(`lookup_plans for ZIP ${zip}: ${result.providers.length} providers found`);

      return new Response(
        JSON.stringify({
          status: "ok",
          zip,
          spectrumAvailable: result.spectrumAvailable,
          totalProviders: result.providers.length,
          providers: result.providers,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── All other tools: resolve lead_id via fallbacks ───
    let leadId: string;
    try {
      leadId = await resolveLeadId(supabase, parameters || {});
    } catch (e) {
      console.error("Lead resolution failed:", e);
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

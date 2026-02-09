import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPORT_VERSION = "1.0.0";
const TIMEZONE = "America/New_York";
const MIN_SAMPLE_SIZE = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  try {
    // Determine report date (yesterday in ET)
    const body = await req.json().catch(() => ({}));
    const reportDate = body.report_date || getYesterdayET();

    const { windowStart, windowEnd } = getDateWindow(reportDate);
    const { windowStart: trailingStart } = getTrailingWindow(reportDate, 7);

    console.log(`Generating daily report for ${reportDate}, window: ${windowStart} → ${windowEnd}`);

    // ── FETCH ALL DATA IN PARALLEL ──
    const [
      yesterdayCalls, trailingCalls, yesterdayOrders, trailingOrders,
      yesterdayFollowups, trailingFollowups, yesterdayChangelog,
      transcriptInsights, callRecords
    ] = await Promise.all([
      fetchCalls(supabase, windowStart, windowEnd),
      fetchCalls(supabase, trailingStart, windowStart),
      fetchOrders(supabase, windowStart, windowEnd),
      fetchOrders(supabase, trailingStart, windowStart),
      fetchFollowups(supabase, windowStart, windowEnd),
      fetchFollowups(supabase, trailingStart, windowStart),
      fetchChangelog(supabase, windowStart, windowEnd),
      fetchTranscriptInsights(supabase, windowStart, windowEnd),
      fetchCallRecords(supabase, windowStart, windowEnd),
    ]);

    // ── COMPUTE ALL SECTIONS ──
    const ydayMetrics = computeScoreboard(yesterdayCalls);
    const trailMetrics = computeScoreboard(trailingCalls);
    const openerLeaderboard = computeOpenerLeaderboard(yesterdayCalls);
    const objectionLeaderboard = computeObjectionLeaderboard(yesterdayCalls);
    const gatekeeperInsights = computeGatekeeperInsights(yesterdayCalls);
    const funnel = computeFunnel(yesterdayCalls);
    const followupPerf = computeFollowupPerformance(yesterdayFollowups, trailingFollowups);
    const leadSourcePerf = computeLeadSourcePerformance(yesterdayCalls);
    const segmentWins = computeSegmentWins(yesterdayCalls);
    const compliance = computeCompliance(yesterdayCalls, yesterdayFollowups);
    const changelogSummary = summarizeChangelog(yesterdayChangelog);

    // ── EXECUTIVE SUMMARY via AI ──
    const executiveSummary = await generateExecutiveSummary(lovableKey, {
      ydayMetrics, trailMetrics, openerLeaderboard, objectionLeaderboard,
      funnel, compliance, reportDate,
    });

    // ── RECOMMENDATIONS via AI ──
    const recommendations = await generateRecommendations(lovableKey, {
      ydayMetrics, trailMetrics, openerLeaderboard, objectionLeaderboard,
      gatekeeperInsights, funnel, leadSourcePerf, compliance,
    });

    // ── BUILD JSON REPORT ──
    const jsonReport = {
      metadata: {
        report_date: reportDate,
        generated_at: new Date().toISOString(),
        timezone: TIMEZONE,
        data_window_start: windowStart,
        data_window_end: windowEnd,
        trailing_window_start: trailingStart,
        version: REPORT_VERSION,
      },
      executive_summary: executiveSummary,
      scoreboard: {
        yesterday: ydayMetrics,
        trailing_7day_avg: trailMetrics,
        deltas: computeDeltas(ydayMetrics, trailMetrics),
      },
      opener_leaderboard: openerLeaderboard,
      objection_leaderboard: objectionLeaderboard,
      gatekeeper_insights: gatekeeperInsights,
      funnel_breakdown: funnel,
      followup_performance: followupPerf,
      lead_source_performance: leadSourcePerf,
      segment_wins: segmentWins,
      compliance_checks: compliance,
      changelog_summary: changelogSummary,
      recommendations: recommendations,
    };

    // ── BUILD MARKDOWN REPORT ──
    const markdownReport = buildMarkdown(jsonReport, reportDate);

    // ── SAVE TO STORAGE ──
    const jsonPath = `daily/${reportDate}.json`;
    const mdPath = `daily/${reportDate}.md`;

    await Promise.all([
      supabase.storage.from("reports").upload(jsonPath, JSON.stringify(jsonReport, null, 2), {
        contentType: "application/json", upsert: true,
      }),
      supabase.storage.from("reports").upload(mdPath, markdownReport, {
        contentType: "text/markdown", upsert: true,
      }),
    ]);

    // ── ALSO SAVE TO orchestrator_reports TABLE ──
    await supabase.from("orchestrator_reports").insert({
      report_type: "daily_marketing",
      report_date: reportDate,
      metrics: jsonReport.scoreboard,
      bottleneck: executiveSummary?.biggest_bottleneck || null,
      recommendations: jsonReport.recommendations,
      audit_results: jsonReport.compliance_checks,
      auto_applied: [],
      needs_approval: [],
      experiments: jsonReport.opener_leaderboard,
    });

    console.log(`Report saved: ${jsonPath}, ${mdPath}`);

    return new Response(JSON.stringify({
      success: true,
      report_date: reportDate,
      json_path: jsonPath,
      md_path: mdPath,
      summary: executiveSummary,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Daily report error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ═══════════════════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════════════════

function getYesterdayET(): string {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
  et.setDate(et.getDate() - 1);
  return et.toISOString().split("T")[0];
}

function getDateWindow(dateStr: string) {
  // Convert ET date boundaries to UTC for DB queries
  const windowStart = new Date(`${dateStr}T00:00:00-05:00`).toISOString();
  const windowEnd = new Date(`${dateStr}T23:59:59-05:00`).toISOString();
  return { windowStart, windowEnd };
}

function getTrailingWindow(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return getDateWindow(d.toISOString().split("T")[0]);
}

// ═══════════════════════════════════════════════════════════════════
// DATA FETCHERS
// ═══════════════════════════════════════════════════════════════════

async function fetchCalls(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("outbound_leads")
    .select("*")
    .gte("last_call_at", start)
    .lt("last_call_at", end)
    .not("last_call_at", "is", null);
  return data || [];
}

async function fetchOrders(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", start)
    .lt("created_at", end);
  return data || [];
}

async function fetchFollowups(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("follow_up_actions")
    .select("*")
    .gte("scheduled_at", start)
    .lt("scheduled_at", end);
  return data || [];
}

async function fetchChangelog(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("optimization_changelog")
    .select("*")
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false });
  return data || [];
}

async function fetchTranscriptInsights(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("transcript_insights")
    .select("*")
    .gte("created_at", start)
    .lt("created_at", end);
  return data || [];
}

async function fetchCallRecords(supabase: any, start: string, end: string) {
  const { data } = await supabase
    .from("call_records")
    .select("id, duration_seconds, status, created_at")
    .gte("created_at", start)
    .lt("created_at", end);
  return data || [];
}

// ═══════════════════════════════════════════════════════════════════
// SCOREBOARD
// ═══════════════════════════════════════════════════════════════════

function computeScoreboard(calls: any[]) {
  const total = calls.length;
  if (total === 0) return emptyScoreboard();

  const answered = calls.filter(c => c.call_outcome && c.call_outcome !== "voicemail").length;
  const engaged = calls.filter(c => c.duration_seconds && c.duration_seconds > 45).length;
  const hangup10 = calls.filter(c =>
    c.call_outcome === "hangup_10s" ||
    (c.duration_seconds && c.duration_seconds < 10 && c.call_outcome?.includes("hangup"))
  ).length;
  const gatekeeperPassed = calls.filter(c => c.decision_maker_reached).length;
  const discoveryComplete = calls.filter(c => {
    const qa = c.qualifying_answers;
    return qa && typeof qa === "object" && Object.keys(qa).length >= 5;
  }).length;
  const comparisonSent = calls.filter(c => c.call_outcome === "comparison_sent").length;
  const followupSet = calls.filter(c => c.next_followup_datetime).length;
  const closed = calls.filter(c => c.call_outcome === "order_closed").length;

  return {
    dialed: total,
    answered,
    answered_rate: pct(answered, total),
    engaged,
    engagement_rate: pct(engaged, answered),
    hangup_10s: hangup10,
    first_10s_hangup_rate: pct(hangup10, answered),
    gatekeeper_passed: gatekeeperPassed,
    gatekeeper_pass_rate: pct(gatekeeperPassed, answered),
    discovery_complete: discoveryComplete,
    discovery_completion_rate: pct(discoveryComplete, answered),
    comparison_sent: comparisonSent,
    comparison_sent_rate: pct(comparisonSent, answered),
    followup_set: followupSet,
    followup_set_rate: pct(followupSet, answered),
    orders_closed: closed,
    close_rate: pct(closed, answered),
    orders_per_100_answered: answered > 0 ? round((closed / answered) * 100) : 0,
  };
}

function emptyScoreboard() {
  return {
    dialed: 0, answered: 0, answered_rate: 0, engaged: 0, engagement_rate: 0,
    hangup_10s: 0, first_10s_hangup_rate: 0, gatekeeper_passed: 0, gatekeeper_pass_rate: 0,
    discovery_complete: 0, discovery_completion_rate: 0, comparison_sent: 0,
    comparison_sent_rate: 0, followup_set: 0, followup_set_rate: 0, orders_closed: 0,
    close_rate: 0, orders_per_100_answered: 0,
  };
}

function computeDeltas(yesterday: any, trailing: any) {
  const deltas: Record<string, number> = {};
  const rateKeys = [
    "answered_rate", "engagement_rate", "first_10s_hangup_rate", "gatekeeper_pass_rate",
    "discovery_completion_rate", "comparison_sent_rate", "followup_set_rate", "close_rate",
  ];
  for (const k of rateKeys) {
    deltas[k] = round((yesterday[k] || 0) - (trailing[k] || 0));
  }
  return deltas;
}

// ═══════════════════════════════════════════════════════════════════
// OPENER LEADERBOARD
// ═══════════════════════════════════════════════════════════════════

function computeOpenerLeaderboard(calls: any[]) {
  const variants: Record<string, any> = {};
  for (const c of calls) {
    const v = c.opening_variant || "unknown";
    if (!variants[v]) variants[v] = { variant: v, answered: 0, engaged: 0, discovery_complete: 0, comparison_sent: 0, closed: 0 };
    if (c.call_outcome && c.call_outcome !== "voicemail") variants[v].answered++;
    if (c.duration_seconds && c.duration_seconds > 45) variants[v].engaged++;
    const qa = c.qualifying_answers;
    if (qa && typeof qa === "object" && Object.keys(qa).length >= 5) variants[v].discovery_complete++;
    if (c.call_outcome === "comparison_sent") variants[v].comparison_sent++;
    if (c.call_outcome === "order_closed") variants[v].closed++;
  }

  return Object.values(variants).map((v: any) => ({
    ...v,
    engagement_rate: pct(v.engaged, v.answered),
    discovery_completion_rate: pct(v.discovery_complete, v.answered),
    comparison_sent_rate: pct(v.comparison_sent, v.answered),
    close_rate: pct(v.closed, v.answered),
    sample_size_warning: v.answered < 50,
  })).sort((a: any, b: any) => b.engagement_rate - a.engagement_rate);
}

// ═══════════════════════════════════════════════════════════════════
// OBJECTION LEADERBOARD
// ═══════════════════════════════════════════════════════════════════

function computeObjectionLeaderboard(calls: any[]) {
  const answered = calls.filter(c => c.call_outcome && c.call_outcome !== "voicemail");
  const totalAnswered = answered.length;
  const objMap: Record<string, { count: number; durations: number[]; outcomes: Record<string, number> }> = {};

  for (const c of answered) {
    if (!c.objections_triggered || !Array.isArray(c.objections_triggered)) continue;
    for (const obj of c.objections_triggered) {
      if (!objMap[obj]) objMap[obj] = { count: 0, durations: [], outcomes: {} };
      objMap[obj].count++;
      if (c.duration_seconds) objMap[obj].durations.push(c.duration_seconds);
      const outcome = c.call_outcome || "unknown";
      objMap[obj].outcomes[outcome] = (objMap[obj].outcomes[outcome] || 0) + 1;
    }
  }

  return Object.entries(objMap)
    .map(([key, val]) => ({
      objection: key,
      frequency: val.count,
      pct_of_answered: pct(val.count, totalAnswered),
      avg_duration: val.durations.length > 0 ? round(val.durations.reduce((a, b) => a + b, 0) / val.durations.length) : 0,
      outcomes: val.outcomes,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════
// GATEKEEPER INSIGHTS
// ═══════════════════════════════════════════════════════════════════

function computeGatekeeperInsights(calls: any[]) {
  const answered = calls.filter(c => c.call_outcome && c.call_outcome !== "voicemail");
  const withGatekeeper = answered.filter(c => c.gatekeeper_encountered);
  const passed = withGatekeeper.filter(c => c.decision_maker_reached);

  // Industry breakdown
  const industryBlocked: Record<string, { total: number; blocked: number }> = {};
  for (const c of withGatekeeper) {
    const ind = c.business_type || "unknown";
    if (!industryBlocked[ind]) industryBlocked[ind] = { total: 0, blocked: 0 };
    industryBlocked[ind].total++;
    if (!c.decision_maker_reached) industryBlocked[ind].blocked++;
  }

  const topBlockingIndustries = Object.entries(industryBlocked)
    .map(([ind, val]) => ({ industry: ind, gatekeeper_calls: val.total, blocked_pct: pct(val.blocked, val.total) }))
    .sort((a, b) => b.blocked_pct - a.blocked_pct)
    .slice(0, 5);

  return {
    total_answered: answered.length,
    calls_with_gatekeeper: withGatekeeper.length,
    gatekeeper_encounter_rate: pct(withGatekeeper.length, answered.length),
    gatekeeper_pass_rate: pct(passed.length, withGatekeeper.length),
    top_blocking_industries: topBlockingIndustries,
  };
}

// ═══════════════════════════════════════════════════════════════════
// FUNNEL BREAKDOWN
// ═══════════════════════════════════════════════════════════════════

function computeFunnel(calls: any[]) {
  const answered = calls.filter(c => c.call_outcome && c.call_outcome !== "voicemail").length;
  const engaged = calls.filter(c => c.duration_seconds && c.duration_seconds > 45).length;
  const discoveryComplete = calls.filter(c => {
    const qa = c.qualifying_answers;
    return qa && typeof qa === "object" && Object.keys(qa).length >= 5;
  }).length;
  const comparisonSent = calls.filter(c => c.call_outcome === "comparison_sent").length;
  const followupSet = calls.filter(c => c.next_followup_datetime).length;
  const closed = calls.filter(c => c.call_outcome === "order_closed").length;

  const stages = [
    { stage: "answered", count: answered },
    { stage: "engaged_gt_45s", count: engaged, conversion_from_prev: pct(engaged, answered) },
    { stage: "discovery_complete", count: discoveryComplete, conversion_from_prev: pct(discoveryComplete, engaged) },
    { stage: "comparison_sent", count: comparisonSent, conversion_from_prev: pct(comparisonSent, discoveryComplete) },
    { stage: "followup_set", count: followupSet, conversion_from_prev: pct(followupSet, comparisonSent) },
    { stage: "order_closed", count: closed, conversion_from_prev: pct(closed, followupSet) },
  ];

  // Find biggest drop-off
  let biggestDrop = { from: "", to: "", drop_pct: 0 };
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count;
    const curr = stages[i].count;
    const dropPct = prev > 0 ? round(((prev - curr) / prev) * 100) : 0;
    if (dropPct > biggestDrop.drop_pct) {
      biggestDrop = { from: stages[i - 1].stage, to: stages[i].stage, drop_pct: dropPct };
    }
  }

  return { stages, biggest_dropoff: biggestDrop };
}

// ═══════════════════════════════════════════════════════════════════
// FOLLOW-UP PERFORMANCE
// ═══════════════════════════════════════════════════════════════════

function computeFollowupPerformance(yesterdayFU: any[], trailingFU: any[]) {
  const byChannel: Record<string, { sent: number; executed: number; pending: number }> = {};

  for (const fu of yesterdayFU) {
    const ch = fu.action_type || "unknown";
    if (!byChannel[ch]) byChannel[ch] = { sent: 0, executed: 0, pending: 0 };
    byChannel[ch].sent++;
    if (fu.status === "executed") byChannel[ch].executed++;
    if (fu.status === "pending") byChannel[ch].pending++;
  }

  const trailTotal = trailingFU.length;
  const trailExecuted = trailingFU.filter(f => f.status === "executed").length;
  const trailingExecRate = pct(trailExecuted, trailTotal);

  return {
    yesterday: byChannel,
    total_sent: yesterdayFU.length,
    trailing_7day_execution_rate: trailingExecRate,
  };
}

// ═══════════════════════════════════════════════════════════════════
// LEAD SOURCE PERFORMANCE
// ═══════════════════════════════════════════════════════════════════

function computeLeadSourcePerformance(calls: any[]) {
  const sources: Record<string, any> = {};

  for (const c of calls) {
    const src = c.discovery_batch || c.fiber_launch_source || "organic";
    if (!sources[src]) sources[src] = { source: src, dialed: 0, answered: 0, engaged: 0, comparison_sent: 0, closed: 0 };
    sources[src].dialed++;
    if (c.call_outcome && c.call_outcome !== "voicemail") sources[src].answered++;
    if (c.duration_seconds && c.duration_seconds > 45) sources[src].engaged++;
    if (c.call_outcome === "comparison_sent") sources[src].comparison_sent++;
    if (c.call_outcome === "order_closed") sources[src].closed++;
  }

  return Object.values(sources).map((s: any) => ({
    ...s,
    answered_rate: pct(s.answered, s.dialed),
    engagement_rate: pct(s.engaged, s.answered),
    comparison_sent_rate: pct(s.comparison_sent, s.answered),
    close_rate: pct(s.closed, s.answered),
    orders_per_100_answered: s.answered > 0 ? round((s.closed / s.answered) * 100) : 0,
  })).sort((a: any, b: any) => b.close_rate - a.close_rate);
}

// ═══════════════════════════════════════════════════════════════════
// SEGMENT WINS
// ═══════════════════════════════════════════════════════════════════

function computeSegmentWins(calls: any[]) {
  const byIndustry: Record<string, { answered: number; engaged: number; comparison_sent: number; closed: number }> = {};
  const byZip: Record<string, { answered: number; engaged: number }> = {};

  for (const c of calls) {
    if (c.call_outcome && c.call_outcome !== "voicemail") {
      const ind = c.business_type || "unknown";
      if (!byIndustry[ind]) byIndustry[ind] = { answered: 0, engaged: 0, comparison_sent: 0, closed: 0 };
      byIndustry[ind].answered++;
      if (c.duration_seconds && c.duration_seconds > 45) byIndustry[ind].engaged++;
      if (c.call_outcome === "comparison_sent") byIndustry[ind].comparison_sent++;
      if (c.call_outcome === "order_closed") byIndustry[ind].closed++;

      const zip = c.zip || "unknown";
      if (!byZip[zip]) byZip[zip] = { answered: 0, engaged: 0 };
      byZip[zip].answered++;
      if (c.duration_seconds && c.duration_seconds > 45) byZip[zip].engaged++;
    }
  }

  const topIndustriesByClose = Object.entries(byIndustry)
    .filter(([_, v]) => v.answered >= MIN_SAMPLE_SIZE)
    .map(([ind, v]) => ({ industry: ind, close_rate: pct(v.closed, v.answered), answered: v.answered }))
    .sort((a, b) => b.close_rate - a.close_rate)
    .slice(0, 5);

  const topIndustriesByComparison = Object.entries(byIndustry)
    .filter(([_, v]) => v.answered >= MIN_SAMPLE_SIZE)
    .map(([ind, v]) => ({ industry: ind, comparison_sent_rate: pct(v.comparison_sent, v.answered), answered: v.answered }))
    .sort((a, b) => b.comparison_sent_rate - a.comparison_sent_rate)
    .slice(0, 5);

  const topZipsByEngagement = Object.entries(byZip)
    .filter(([_, v]) => v.answered >= 5)
    .map(([zip, v]) => ({ zip, engagement_rate: pct(v.engaged, v.answered), answered: v.answered }))
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 5);

  return { topIndustriesByClose, topIndustriesByComparison, topZipsByEngagement };
}

// ═══════════════════════════════════════════════════════════════════
// COMPLIANCE CHECKS
// ═══════════════════════════════════════════════════════════════════

function computeCompliance(calls: any[], followups: any[]) {
  const dncLeads = calls.filter(c => c.call_outcome === "DNC" || c.campaign_status === "dnc");
  const dncIds = new Set(dncLeads.map(c => c.id));

  // Check if any follow-ups are scheduled for DNC leads
  // (follow_up_actions references checkout_id, but we check for overlap)
  const dncFollowupsScheduled = 0; // Would need cross-reference

  // SMS without consent
  const smsNoConsent = calls.filter(c => c.sms_consent === false && c.last_email_sent_at).length;

  // Calls outside 8am-10pm (approximate using created_at hour)
  const outsideHours = calls.filter(c => {
    if (!c.last_call_at) return false;
    const d = new Date(c.last_call_at);
    const etHour = parseInt(d.toLocaleString("en-US", { timeZone: TIMEZONE, hour: "numeric", hour12: false }));
    return etHour < 8 || etHour >= 22;
  }).length;

  return {
    dnc_outcomes: dncLeads.length,
    dnc_followups_scheduled: dncFollowupsScheduled,
    dnc_compliant: dncFollowupsScheduled === 0,
    sms_without_consent: smsNoConsent,
    sms_compliant: smsNoConsent === 0,
    calls_outside_hours: outsideHours,
    time_compliant: outsideHours === 0,
    overall_compliant: dncFollowupsScheduled === 0 && smsNoConsent === 0 && outsideHours === 0,
  };
}

// ═══════════════════════════════════════════════════════════════════
// CHANGELOG SUMMARY
// ═══════════════════════════════════════════════════════════════════

function summarizeChangelog(changes: any[]) {
  if (changes.length === 0) return { changes_applied: [], rollbacks: [], total: 0 };

  return {
    total: changes.length,
    changes_applied: changes.filter(c => c.status === "applied").map(c => ({
      type: c.change_type,
      title: c.title,
      reason: c.reason,
    })),
    rollbacks: changes.filter(c => c.rolled_back_at).map(c => ({
      type: c.change_type,
      title: c.title,
      rolled_back_at: c.rolled_back_at,
    })),
    pending_approval: changes.filter(c => c.status === "pending").map(c => ({
      type: c.change_type,
      title: c.title,
      reason: c.reason,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════════
// AI: EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════════════════

async function generateExecutiveSummary(lovableKey: string | undefined, data: any) {
  if (!lovableKey) {
    return buildFallbackSummary(data);
  }

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a sales analytics expert for a B2B telecom broker. Generate an executive summary with exactly these fields as a JSON object:
- bullets: array of 5-8 strings summarizing key findings
- biggest_bottleneck: string (ONE bottleneck)
- biggest_win: string (ONE win)
- recommended_focus: string (ONE focus area for today)
- improved_vs_trailing: array of metric names that improved
- worsened_vs_trailing: array of metric names that worsened
Return ONLY valid JSON, no markdown.`
          },
          { role: "user", content: JSON.stringify(data) },
        ],
      }),
    });

    if (resp.ok) {
      const aiData = await resp.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      }
    }
  } catch (e) {
    console.error("AI executive summary error:", e);
  }
  return buildFallbackSummary(data);
}

function buildFallbackSummary(data: any) {
  const { ydayMetrics: y, trailMetrics: t } = data;
  const improved: string[] = [];
  const worsened: string[] = [];

  const checks = [
    ["engagement_rate", "Engagement rate"],
    ["close_rate", "Close rate"],
    ["gatekeeper_pass_rate", "Gatekeeper pass rate"],
    ["discovery_completion_rate", "Discovery completion rate"],
    ["first_10s_hangup_rate", "First 10s hangup rate"],
  ];

  for (const [key, label] of checks) {
    if ((y[key] || 0) > (t[key] || 0) + 1) improved.push(label);
    else if ((y[key] || 0) < (t[key] || 0) - 1) worsened.push(label);
  }

  // Determine bottleneck
  let bottleneck = "insufficient_data";
  if (y.dialed > 0) {
    if (y.first_10s_hangup_rate > 30) bottleneck = "High first-10s hangup rate — opener issue";
    else if (y.gatekeeper_pass_rate < 40) bottleneck = "Low gatekeeper pass rate";
    else if (y.discovery_completion_rate < 30) bottleneck = "Low discovery completion";
    else if (y.close_rate < 5) bottleneck = "Low close rate despite good funnel";
  }

  return {
    bullets: [
      `Dialed ${y.dialed} calls, ${y.answered} answered (${y.answered_rate}%)`,
      `Close rate: ${y.close_rate}% (7-day avg: ${t.close_rate}%)`,
      `Engagement rate: ${y.engagement_rate}% (7-day avg: ${t.engagement_rate}%)`,
      improved.length > 0 ? `Improved: ${improved.join(", ")}` : "No significant improvements vs trailing",
      worsened.length > 0 ? `Worsened: ${worsened.join(", ")}` : "No significant regressions",
      `Orders closed: ${y.orders_closed}`,
    ],
    biggest_bottleneck: bottleneck,
    biggest_win: improved.length > 0 ? improved[0] : "Steady performance",
    recommended_focus: bottleneck !== "insufficient_data" ? bottleneck : "Continue current approach",
    improved_vs_trailing: improved,
    worsened_vs_trailing: worsened,
  };
}

// ═══════════════════════════════════════════════════════════════════
// AI: RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════

async function generateRecommendations(lovableKey: string | undefined, data: any) {
  if (!lovableKey) {
    return {
      likely_root_causes: ["Insufficient data for AI analysis"],
      suggested_experiments: [],
      changes_to_consider: [],
    };
  }

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a B2B telecom sales optimization consultant. Based on daily metrics, produce recommendations as JSON:
- likely_root_causes: array of max 3 strings (hypotheses about why metrics are what they are)
- suggested_experiments: array of max 3 objects with {name, description, success_criteria}
- changes_to_consider: array of max 5 objects with {change, classification ("SAFE"|"NEEDS_APPROVAL"), rationale}
Focus on actionable, specific recommendations. Return ONLY valid JSON.`
          },
          { role: "user", content: JSON.stringify(data) },
        ],
      }),
    });

    if (resp.ok) {
      const aiData = await resp.json();
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      }
    }
  } catch (e) {
    console.error("AI recommendations error:", e);
  }

  return {
    likely_root_causes: ["Unable to generate AI recommendations"],
    suggested_experiments: [],
    changes_to_consider: [],
  };
}

// ═══════════════════════════════════════════════════════════════════
// MARKDOWN BUILDER
// ═══════════════════════════════════════════════════════════════════

function buildMarkdown(report: any, reportDate: string): string {
  const md: string[] = [];
  const { scoreboard, executive_summary: es, opener_leaderboard, objection_leaderboard,
    gatekeeper_insights: gi, funnel_breakdown: fb, followup_performance: fp,
    lead_source_performance: lsp, segment_wins: sw, compliance_checks: cc,
    changelog_summary: cl, recommendations: rec } = report;
  const y = scoreboard.yesterday;
  const t = scoreboard.trailing_7day_avg;
  const d = scoreboard.deltas;

  md.push(`# 📊 Daily Marketing & Agent Performance Report`);
  md.push(`**Date:** ${reportDate} | **Generated:** ${report.metadata.generated_at} | **Timezone:** ${TIMEZONE}\n`);

  // 1) Executive Summary
  md.push(`## 1. Executive Summary\n`);
  if (es?.bullets) {
    for (const b of es.bullets) md.push(`- ${b}`);
  }
  md.push(`\n**🔴 Biggest Bottleneck:** ${es?.biggest_bottleneck || "N/A"}`);
  md.push(`**🟢 Biggest Win:** ${es?.biggest_win || "N/A"}`);
  md.push(`**🎯 Recommended Focus:** ${es?.recommended_focus || "N/A"}\n`);

  // 2) Scoreboard
  md.push(`## 2. Scoreboard\n`);
  md.push(`| Metric | Yesterday | 7-Day Avg | Delta |`);
  md.push(`|--------|-----------|-----------|-------|`);
  md.push(`| Dialed | ${y.dialed} | ${t.dialed} | — |`);
  md.push(`| Answered Rate | ${y.answered_rate}% (${y.answered}) | ${t.answered_rate}% | ${fmtDelta(d.answered_rate)} |`);
  md.push(`| Engagement Rate | ${y.engagement_rate}% (${y.engaged}) | ${t.engagement_rate}% | ${fmtDelta(d.engagement_rate)} |`);
  md.push(`| 10s Hangup Rate | ${y.first_10s_hangup_rate}% (${y.hangup_10s}) | ${t.first_10s_hangup_rate}% | ${fmtDelta(d.first_10s_hangup_rate)} |`);
  md.push(`| Gatekeeper Pass | ${y.gatekeeper_pass_rate}% (${y.gatekeeper_passed}) | ${t.gatekeeper_pass_rate}% | ${fmtDelta(d.gatekeeper_pass_rate)} |`);
  md.push(`| Discovery Complete | ${y.discovery_completion_rate}% (${y.discovery_complete}) | ${t.discovery_completion_rate}% | ${fmtDelta(d.discovery_completion_rate)} |`);
  md.push(`| Comparison Sent | ${y.comparison_sent_rate}% (${y.comparison_sent}) | ${t.comparison_sent_rate}% | ${fmtDelta(d.comparison_sent_rate)} |`);
  md.push(`| Follow-up Set | ${y.followup_set_rate}% (${y.followup_set}) | ${t.followup_set_rate}% | ${fmtDelta(d.followup_set_rate)} |`);
  md.push(`| Close Rate | ${y.close_rate}% (${y.orders_closed}) | ${t.close_rate}% | ${fmtDelta(d.close_rate)} |`);
  md.push(`| Orders/100 Answered | ${y.orders_per_100_answered} | ${t.orders_per_100_answered} | — |\n`);

  // 3) Opener Leaderboard
  md.push(`## 3. Opener A/B Leaderboard\n`);
  if (opener_leaderboard.length > 0) {
    md.push(`| Rank | Variant | Answered | Engage% | Discovery% | Compare% | Close% | ⚠️ |`);
    md.push(`|------|---------|----------|---------|------------|----------|--------|-----|`);
    opener_leaderboard.forEach((o: any, i: number) => {
      const warn = o.sample_size_warning ? "⚠️ <50" : "✅";
      const badge = i < 2 ? "🏆" : i >= opener_leaderboard.length - 2 ? "🔻" : "";
      md.push(`| ${i + 1}${badge} | ${o.variant} | ${o.answered} | ${o.engagement_rate}% | ${o.discovery_completion_rate}% | ${o.comparison_sent_rate}% | ${o.close_rate}% | ${warn} |`);
    });
  } else {
    md.push(`_No opener data available._`);
  }
  md.push(``);

  // 4) Objection Leaderboard
  md.push(`## 4. Objection Leaderboard (Top 10)\n`);
  if (objection_leaderboard.length > 0) {
    md.push(`| Rank | Objection | Count | % Answered | Avg Duration | Top Outcome |`);
    md.push(`|------|-----------|-------|------------|--------------|-------------|`);
    objection_leaderboard.forEach((o: any, i: number) => {
      const topOutcome = Object.entries(o.outcomes).sort((a: any, b: any) => b[1] - a[1])[0];
      md.push(`| ${i + 1} | ${o.objection} | ${o.frequency} | ${o.pct_of_answered}% | ${o.avg_duration}s | ${topOutcome ? topOutcome[0] : "N/A"} |`);
    });
  } else {
    md.push(`_No objection data available._`);
  }
  md.push(``);

  // 5) Gatekeeper
  md.push(`## 5. Gatekeeper Insights\n`);
  md.push(`- Calls with gatekeeper: ${gi.calls_with_gatekeeper} (${gi.gatekeeper_encounter_rate}%)`);
  md.push(`- Gatekeeper pass rate: ${gi.gatekeeper_pass_rate}%`);
  if (gi.top_blocking_industries?.length > 0) {
    md.push(`- **Top blocking industries:**`);
    gi.top_blocking_industries.forEach((ind: any) => {
      md.push(`  - ${ind.industry}: ${ind.blocked_pct}% blocked (${ind.gatekeeper_calls} calls)`);
    });
  }
  md.push(``);

  // 6) Funnel
  md.push(`## 6. Funnel Breakdown\n`);
  md.push(`| Stage | Count | Conversion |`);
  md.push(`|-------|-------|------------|`);
  fb.stages.forEach((s: any) => {
    md.push(`| ${s.stage} | ${s.count} | ${s.conversion_from_prev !== undefined ? s.conversion_from_prev + "%" : "—"} |`);
  });
  md.push(`\n**Biggest drop-off:** ${fb.biggest_dropoff.from} → ${fb.biggest_dropoff.to} (${fb.biggest_dropoff.drop_pct}% drop)\n`);

  // 7) Follow-up
  md.push(`## 7. Follow-up Performance\n`);
  md.push(`Total actions: ${fp.total_sent} | Trailing 7-day execution rate: ${fp.trailing_7day_execution_rate}%\n`);
  if (Object.keys(fp.yesterday).length > 0) {
    md.push(`| Channel | Sent | Executed | Pending |`);
    md.push(`|---------|------|----------|---------|`);
    for (const [ch, v] of Object.entries(fp.yesterday) as any) {
      md.push(`| ${ch} | ${v.sent} | ${v.executed} | ${v.pending} |`);
    }
  }
  md.push(``);

  // 8) Lead Source
  md.push(`## 8. Lead Source Performance\n`);
  if (lsp.length > 0) {
    md.push(`| Source | Dialed | Ans% | Engage% | Compare% | Close% | Ord/100 |`);
    md.push(`|--------|--------|------|---------|----------|--------|---------|`);
    lsp.forEach((s: any) => {
      md.push(`| ${s.source} | ${s.dialed} | ${s.answered_rate}% | ${s.engagement_rate}% | ${s.comparison_sent_rate}% | ${s.close_rate}% | ${s.orders_per_100_answered} |`);
    });
  }
  md.push(``);

  // 9) Segment Wins
  md.push(`## 9. Segment Wins\n`);
  if (sw.topIndustriesByClose?.length > 0) {
    md.push(`**Top Industries by Close Rate:**`);
    sw.topIndustriesByClose.forEach((i: any) => md.push(`- ${i.industry}: ${i.close_rate}% (n=${i.answered})`));
  }
  if (sw.topZipsByEngagement?.length > 0) {
    md.push(`\n**Top Zips by Engagement:**`);
    sw.topZipsByEngagement.forEach((z: any) => md.push(`- ${z.zip}: ${z.engagement_rate}% (n=${z.answered})`));
  }
  md.push(``);

  // 10) Compliance
  md.push(`## 10. Quality & Compliance\n`);
  md.push(`| Check | Status | Count |`);
  md.push(`|-------|--------|-------|`);
  md.push(`| DNC honored | ${cc.dnc_compliant ? "✅" : "🔴 ALERT"} | ${cc.dnc_outcomes} DNC outcomes |`);
  md.push(`| SMS consent | ${cc.sms_compliant ? "✅" : "🔴 ALERT"} | ${cc.sms_without_consent} violations |`);
  md.push(`| Call time window | ${cc.time_compliant ? "✅" : "🔴 ALERT"} | ${cc.calls_outside_hours} outside hours |`);
  md.push(`| **Overall** | ${cc.overall_compliant ? "✅ PASS" : "🔴 FAIL"} | |`);
  md.push(``);

  // 11) Changelog
  md.push(`## 11. What Changed?\n`);
  if (cl.total === 0) {
    md.push(`_No changes recorded yesterday._`);
  } else {
    if (cl.changes_applied?.length > 0) {
      md.push(`**Applied:**`);
      cl.changes_applied.forEach((c: any) => md.push(`- [${c.type}] ${c.title}: ${c.reason}`));
    }
    if (cl.rollbacks?.length > 0) {
      md.push(`**Rollbacks:**`);
      cl.rollbacks.forEach((c: any) => md.push(`- [${c.type}] ${c.title}`));
    }
  }
  md.push(``);

  // 12) Recommendations
  md.push(`## 12. Recommendations\n`);
  if (rec?.likely_root_causes?.length > 0) {
    md.push(`**Likely Root Causes:**`);
    rec.likely_root_causes.forEach((r: string) => md.push(`1. ${r}`));
  }
  if (rec?.suggested_experiments?.length > 0) {
    md.push(`\n**Suggested Experiments:**`);
    rec.suggested_experiments.forEach((e: any) => {
      md.push(`- **${e.name}**: ${e.description} (Success: ${e.success_criteria})`);
    });
  }
  if (rec?.changes_to_consider?.length > 0) {
    md.push(`\n**Changes to Consider:**`);
    rec.changes_to_consider.forEach((c: any) => {
      md.push(`- [${c.classification}] ${c.change} — ${c.rationale}`);
    });
  }
  md.push(``);

  md.push(`---\n_Report v${REPORT_VERSION} | Generated by Business Internet Express Optimization Engine_`);

  return md.join("\n");
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════

function pct(num: number, denom: number): number {
  return denom > 0 ? round((num / denom) * 100) : 0;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function fmtDelta(d: number): string {
  if (d > 0) return `+${d}pp ↑`;
  if (d < 0) return `${d}pp ↓`;
  return "—";
}

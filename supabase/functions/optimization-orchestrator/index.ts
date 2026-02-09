import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  try {
    const { cadence } = await req.json(); // 'daily' | 'weekly' | 'monthly'
    console.log(`Running ${cadence} optimization loop...`);

    if (cadence === "daily") {
      return new Response(JSON.stringify(await runDaily(supabase, lovableKey)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else if (cadence === "weekly") {
      return new Response(JSON.stringify(await runWeekly(supabase, lovableKey)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else if (cadence === "monthly") {
      return new Response(JSON.stringify(await runMonthly(supabase, lovableKey)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid cadence" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Orchestrator error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// ─── DAILY LOOP ───────────────────────────────────────────────────
async function runDaily(supabase: any, lovableKey: string | undefined) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1) Pull last 24h outbound leads (call logs)
  const { data: recentCalls } = await supabase
    .from("outbound_leads")
    .select("*")
    .gte("last_call_at", yesterday.toISOString())
    .not("last_call_at", "is", null);

  // 2) Pull trailing 7-day calls for comparison
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { data: trailingCalls } = await supabase
    .from("outbound_leads")
    .select("*")
    .gte("last_call_at", sevenDaysAgo.toISOString())
    .lt("last_call_at", yesterday.toISOString())
    .not("last_call_at", "is", null);

  // 3) Compute metrics
  const todayMetrics = computeMetrics(recentCalls || []);
  const trailingMetrics = computeMetrics(trailingCalls || []);

  // 4) Identify bottleneck
  const bottleneck = identifyBottleneck(todayMetrics, trailingMetrics);

  // 5) A/B test management - update opener weights
  const openerUpdates = await manageOpenerAB(supabase, recentCalls || []);

  // 6) Transcript analysis via AI
  const transcriptInsights = await analyzeTranscripts(supabase, lovableKey, recentCalls || []);

  // 7) Safe auto-apply patches
  const autoApplied = await applySafePatches(supabase, todayMetrics, bottleneck);

  // 8) Queue risky changes
  const needsApproval = await queueRiskyChanges(supabase, todayMetrics, bottleneck);

  // 9) Save report
  const report = {
    report_type: "daily",
    report_date: now.toISOString().split("T")[0],
    metrics: todayMetrics,
    bottleneck,
    auto_applied: autoApplied,
    needs_approval: needsApproval,
    experiments: openerUpdates,
    recommendations: { transcript_insights_count: transcriptInsights },
  };

  await supabase.from("orchestrator_reports").insert(report);

  return report;
}

// ─── WEEKLY LOOP ──────────────────────────────────────────────────
async function runWeekly(supabase: any, lovableKey: string | undefined) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Pull week's calls
  const { data: weekCalls } = await supabase
    .from("outbound_leads")
    .select("*")
    .gte("last_call_at", weekAgo.toISOString())
    .not("last_call_at", "is", null);

  const calls = weekCalls || [];
  const metrics = computeMetrics(calls);

  // 30-call audit: 10 hangup<10s, 10 hangup<45s, 10 best
  const { data: callRecords } = await supabase
    .from("call_records")
    .select("*")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  const records = callRecords || [];
  const shortHangups = records.filter((c: any) => c.duration_seconds && c.duration_seconds < 10).slice(0, 10);
  const medHangups = records.filter((c: any) => c.duration_seconds && c.duration_seconds >= 10 && c.duration_seconds < 45).slice(0, 10);
  const bestCalls = records.filter((c: any) => c.duration_seconds && c.duration_seconds > 120).slice(0, 10);

  // Opener leaderboard
  const openerStats: Record<string, { calls: number; engaged: number; closed: number }> = {};
  for (const c of calls) {
    const v = c.opening_variant || "unknown";
    if (!openerStats[v]) openerStats[v] = { calls: 0, engaged: 0, closed: 0 };
    openerStats[v].calls++;
    if (c.duration_seconds && c.duration_seconds > 45) openerStats[v].engaged++;
    if (c.call_outcome === "order_closed") openerStats[v].closed++;
  }

  // Objection leaderboard
  const objectionFreq: Record<string, number> = {};
  for (const c of calls) {
    if (c.objections_triggered) {
      for (const obj of c.objections_triggered) {
        objectionFreq[obj] = (objectionFreq[obj] || 0) + 1;
      }
    }
  }

  // Lead source performance
  const sourcePerf: Record<string, { leads: number; orders: number }> = {};
  for (const c of calls) {
    const src = c.discovery_batch || "organic";
    if (!sourcePerf[src]) sourcePerf[src] = { leads: 0, orders: 0 };
    sourcePerf[src].leads++;
    if (c.call_outcome === "order_closed") sourcePerf[src].orders++;
  }

  // Generate AI-powered patch proposals if available
  let patchProposals: any = null;
  if (lovableKey) {
    patchProposals = await generateWeeklyPatches(lovableKey, {
      openerStats,
      objectionFreq,
      shortHangups: shortHangups.length,
      bestCalls: bestCalls.length,
    });
  }

  const report = {
    report_type: "weekly",
    report_date: now.toISOString().split("T")[0],
    metrics,
    bottleneck: null,
    auto_applied: [],
    needs_approval: patchProposals ? [patchProposals] : [],
    experiments: [],
    audit_results: {
      short_hangups: shortHangups.length,
      med_hangups: medHangups.length,
      best_calls: bestCalls.length,
    },
    recommendations: {
      opener_leaderboard: openerStats,
      objection_leaderboard: objectionFreq,
      lead_source_performance: sourcePerf,
    },
  };

  await supabase.from("orchestrator_reports").insert(report);
  return report;
}

// ─── MONTHLY LOOP ─────────────────────────────────────────────────
async function runMonthly(supabase: any, lovableKey: string | undefined) {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Lead-source allocation optimization
  const { data: monthCalls } = await supabase
    .from("outbound_leads")
    .select("*")
    .gte("created_at", monthAgo.toISOString());

  const { data: monthOrders } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", monthAgo.toISOString());

  const calls = monthCalls || [];
  const orders = monthOrders || [];
  const metrics = computeMetrics(calls);

  // Segment analysis by industry + state
  const segments: Record<string, { leads: number; orders: number; convRate: number }> = {};
  for (const c of calls) {
    const key = `${c.business_type || "unknown"}_${c.state || "unknown"}`;
    if (!segments[key]) segments[key] = { leads: 0, orders: 0, convRate: 0 };
    segments[key].leads++;
    if (c.call_outcome === "order_closed") segments[key].orders++;
  }
  for (const k of Object.keys(segments)) {
    segments[k].convRate = segments[k].leads > 0 ? segments[k].orders / segments[k].leads : 0;
  }

  // Gold library - top 20 calls
  const { data: topCalls } = await supabase
    .from("call_records")
    .select("*")
    .gte("created_at", monthAgo.toISOString())
    .not("duration_seconds", "is", null)
    .order("duration_seconds", { ascending: false })
    .limit(20);

  if (topCalls && topCalls.length > 0) {
    const goldEntries = topCalls.map((c: any) => ({
      call_id: c.id,
      month: now.toISOString().split("T")[0].slice(0, 7) + "-01",
      outcome: c.status,
      duration_seconds: c.duration_seconds,
      tags: ["top_call", "monthly_review"],
    }));
    await supabase.from("gold_library").insert(goldEntries);
  }

  // Compliance audit
  const complianceIssues: any[] = [];

  // Check SMS without consent
  const { data: smsNoConsent } = await supabase
    .from("outbound_leads")
    .select("id, business_name, phone")
    .eq("sms_consent", false)
    .gte("last_email_sent_at", monthAgo.toISOString())
    .limit(50);

  if (smsNoConsent && smsNoConsent.length > 0) {
    complianceIssues.push({ type: "sms_without_consent", count: smsNoConsent.length });
  }

  // Update lead source allocations
  const sourceStats: Record<string, { leads: number; orders: number }> = {};
  for (const c of calls) {
    const src = c.discovery_batch || "organic";
    if (!sourceStats[src]) sourceStats[src] = { leads: 0, orders: 0 };
    sourceStats[src].leads++;
    if (c.call_outcome === "order_closed") sourceStats[src].orders++;
  }

  for (const [source, stats] of Object.entries(sourceStats)) {
    const convRate = stats.leads > 0 ? stats.orders / stats.leads : 0;
    await supabase.from("lead_source_allocations").upsert({
      source_name: source,
      total_leads: stats.leads,
      total_orders: stats.orders,
      conversion_rate: convRate,
      updated_at: new Date().toISOString(),
    }, { onConflict: "source_name" });
  }

  const report = {
    report_type: "monthly",
    report_date: now.toISOString().split("T")[0],
    metrics,
    bottleneck: null,
    auto_applied: [],
    needs_approval: [],
    experiments: [],
    audit_results: {
      compliance_issues: complianceIssues,
      gold_library_added: topCalls?.length || 0,
    },
    recommendations: {
      segment_analysis: segments,
      lead_source_stats: sourceStats,
      total_orders: orders.length,
    },
  };

  await supabase.from("orchestrator_reports").insert(report);
  return report;
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────

function computeMetrics(calls: any[]) {
  const total = calls.length;
  if (total === 0) return {
    total_dialed: 0, answered: 0, connection_rate: 0,
    engagement_rate: 0, first_10s_hangup_rate: 0,
    gatekeeper_pass_rate: 0, discovery_completion_rate: 0,
    comparison_sent_rate: 0, followup_set_rate: 0, close_rate: 0,
  };

  const answered = calls.filter(c => c.call_outcome && c.call_outcome !== "voicemail").length;
  const engaged = calls.filter(c => c.duration_seconds && c.duration_seconds > 45).length;
  const hangup10 = calls.filter(c => c.call_outcome === "hangup_10s" || (c.duration_seconds && c.duration_seconds < 10 && c.call_outcome?.includes("hangup"))).length;
  const gatekeeperPassed = calls.filter(c => c.decision_maker_reached).length;
  const discoveryComplete = calls.filter(c => {
    const qa = c.qualifying_answers;
    return qa && typeof qa === "object" && Object.keys(qa).length >= 5;
  }).length;
  const comparisonSent = calls.filter(c => c.call_outcome === "comparison_sent").length;
  const followupSet = calls.filter(c => c.next_followup_datetime).length;
  const closed = calls.filter(c => c.call_outcome === "order_closed").length;

  return {
    total_dialed: total,
    answered,
    connection_rate: answered / total,
    engagement_rate: answered > 0 ? engaged / answered : 0,
    first_10s_hangup_rate: answered > 0 ? hangup10 / answered : 0,
    gatekeeper_pass_rate: answered > 0 ? gatekeeperPassed / answered : 0,
    discovery_completion_rate: answered > 0 ? discoveryComplete / answered : 0,
    comparison_sent_rate: answered > 0 ? comparisonSent / answered : 0,
    followup_set_rate: answered > 0 ? followupSet / answered : 0,
    close_rate: answered > 0 ? closed / answered : 0,
  };
}

function identifyBottleneck(today: any, trailing: any): string {
  if (!today || !trailing || today.total_dialed === 0) return "insufficient_data";

  const diffs: { name: string; delta: number }[] = [
    { name: "opener_issue", delta: today.first_10s_hangup_rate - trailing.first_10s_hangup_rate },
    { name: "gatekeeper_module_issue", delta: trailing.gatekeeper_pass_rate - today.gatekeeper_pass_rate },
    { name: "discovery_friction", delta: trailing.discovery_completion_rate - today.discovery_completion_rate },
    { name: "template_cadence_issue", delta: (today.comparison_sent_rate > trailing.comparison_sent_rate && today.followup_set_rate < trailing.followup_set_rate) ? 0.1 : 0 },
  ];

  const worst = diffs.reduce((a, b) => a.delta > b.delta ? a : b);
  return worst.delta > 0.02 ? worst.name : "no_significant_bottleneck";
}

async function manageOpenerAB(supabase: any, calls: any[]) {
  // Compute stats per opener variant
  const stats: Record<string, { total: number; answered: number; engaged: number; discoveryComplete: number; closed: number }> = {};
  for (const c of calls) {
    const v = c.opening_variant || "A";
    if (!stats[v]) stats[v] = { total: 0, answered: 0, engaged: 0, discoveryComplete: 0, closed: 0 };
    stats[v].total++;
    if (c.call_outcome && c.call_outcome !== "voicemail") stats[v].answered++;
    if (c.duration_seconds && c.duration_seconds > 45) stats[v].engaged++;
    const qa = c.qualifying_answers;
    if (qa && typeof qa === "object" && Object.keys(qa).length >= 5) stats[v].discoveryComplete++;
    if (c.call_outcome === "order_closed") stats[v].closed++;
  }

  const updates: any[] = [];
  for (const [variant, s] of Object.entries(stats)) {
    const engRate = s.answered > 0 ? s.engaged / s.answered : 0;
    const discRate = s.answered > 0 ? s.discoveryComplete / s.answered : 0;
    const clsRate = s.answered > 0 ? s.closed / s.answered : 0;

    await supabase.from("opener_weights").update({
      total_calls: s.total,
      total_answered: s.answered,
      engagement_rate: engRate,
      discovery_completion_rate: discRate,
      close_rate: clsRate,
      updated_at: new Date().toISOString(),
    }).eq("variant", variant);

    updates.push({ variant, engagement_rate: engRate, discovery_completion_rate: discRate, close_rate: clsRate });
  }

  // Check if we have enough sample size to adjust weights
  const { data: allWeights } = await supabase.from("opener_weights").select("*").order("engagement_rate", { ascending: false });
  if (allWeights && allWeights.length >= 3) {
    const totalAnswered = allWeights.reduce((sum: number, w: any) => sum + (w.total_answered || 0), 0);
    if (totalAnswered >= 50) {
      // Top 2 get 40% each, rest get split or paused
      const sorted = [...allWeights].sort((a: any, b: any) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
      for (let i = 0; i < sorted.length; i++) {
        const newWeight = i < 2 ? 40 : (i < 3 ? 20 : 0);
        const isPaused = i >= 3;
        const before = { weight: sorted[i].weight, is_paused: sorted[i].is_paused };
        const after = { weight: newWeight, is_paused: isPaused };

        if (before.weight !== after.weight || before.is_paused !== after.is_paused) {
          await supabase.from("opener_weights").update({ weight: newWeight, is_paused: isPaused, updated_at: new Date().toISOString() }).eq("id", sorted[i].id);

          await supabase.from("optimization_changelog").insert({
            change_type: "opener_weight",
            change_category: "safe",
            status: "applied",
            title: `Opener ${sorted[i].variant} weight: ${before.weight}% → ${newWeight}%${isPaused ? " (paused)" : ""}`,
            reason: `Ranked #${i + 1} by engagement rate (${(sorted[i].engagement_rate * 100).toFixed(1)}%)`,
            before_json: before,
            after_json: after,
          });
        }
      }
    }
  }

  return updates;
}

async function analyzeTranscripts(supabase: any, lovableKey: string | undefined, calls: any[]) {
  if (!lovableKey) return 0;

  // Get recent call records with transcripts
  const callIds = calls.map(c => c.call_sid).filter(Boolean);
  if (callIds.length === 0) return 0;

  const { data: records } = await supabase
    .from("call_records")
    .select("id, transcript, duration_seconds, status, summary")
    .in("call_sid", callIds.slice(0, 20))
    .not("transcript", "is", null);

  if (!records || records.length === 0) return 0;

  let insightsCount = 0;
  for (const record of records) {
    if (!record.transcript || record.transcript.length < 50) continue;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a sales call analyst. Analyze this transcript and extract insights. Return a JSON object with:
- trigger_line: the line/phrase that triggered a hangup or negative reaction (null if none)
- last_agent_sentence: last thing the agent said before hangup (null if n/a)
- last_prospect_sentence: last thing prospect said before hangup (null if n/a)
- objections: array of objection keywords detected (e.g. "under_contract", "too_expensive", "happy_current")
- sentiment_shift: one of "neutral_to_engaged", "engaged_to_annoyed", "positive_throughout", "negative_throughout", or null
- winning_phrases: array of effective phrases the agent used
- failing_phrases: array of phrases that got negative reactions
Return ONLY the JSON object, no markdown.`
            },
            { role: "user", content: record.transcript.substring(0, 3000) }
          ],
        }),
      });

      if (resp.ok) {
        const aiData = await resp.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            const hangupCat = record.duration_seconds
              ? record.duration_seconds < 10 ? "sub_10s"
              : record.duration_seconds < 45 ? "sub_45s" : "normal"
              : null;

            await supabase.from("transcript_insights").insert({
              call_id: record.id,
              trigger_line: parsed.trigger_line,
              last_agent_sentence: parsed.last_agent_sentence,
              last_prospect_sentence: parsed.last_prospect_sentence,
              objection_detected: parsed.objections || [],
              sentiment_shift: parsed.sentiment_shift,
              winning_phrases: parsed.winning_phrases || [],
              failing_phrases: parsed.failing_phrases || [],
              hangup_category: hangupCat,
            });
            insightsCount++;
          } catch { /* skip parse errors */ }
        }
      }
    } catch (e) {
      console.error("Transcript analysis error:", e);
    }
  }

  return insightsCount;
}

async function applySafePatches(supabase: any, metrics: any, bottleneck: string) {
  const applied: any[] = [];

  // Example: if discovery is the bottleneck, log a safe reorder suggestion
  if (bottleneck === "discovery_friction" && metrics.discovery_completion_rate < 0.5) {
    const change = {
      change_type: "script_patch",
      change_category: "safe",
      status: "applied",
      title: "Reorder discovery questions: lead with pain point (Q3) before spend (Q1)",
      reason: `Discovery completion rate at ${(metrics.discovery_completion_rate * 100).toFixed(1)}%, below 50% threshold`,
      before_json: { order: ["Q1", "Q2", "Q3", "Q4", "Q5"] },
      after_json: { order: ["Q3", "Q1", "Q2", "Q4", "Q5"] },
      metrics_snapshot: metrics,
    };
    await supabase.from("optimization_changelog").insert(change);
    applied.push(change);
  }

  return applied;
}

async function queueRiskyChanges(supabase: any, metrics: any, bottleneck: string) {
  const queued: any[] = [];

  if (bottleneck === "opener_issue" && metrics.first_10s_hangup_rate > 0.4) {
    const change = {
      change_type: "script_patch",
      change_category: "needs_approval",
      status: "pending",
      title: "Rewrite opening to emphasize cost savings before broker introduction",
      reason: `First 10s hangup rate at ${(metrics.first_10s_hangup_rate * 100).toFixed(1)}%, exceeds 40% threshold`,
      before_json: { opener_style: "broker_introduction_first" },
      after_json: { opener_style: "savings_hook_first" },
      metrics_snapshot: metrics,
    };
    await supabase.from("optimization_changelog").insert(change);
    queued.push(change);
  }

  return queued;
}

async function generateWeeklyPatches(lovableKey: string, data: any) {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a sales optimization consultant. Based on call data, propose improvements. Return JSON with:
- opener_rewrites: array of 2 new opener scripts (broker tone, under 3 sentences each)
- objection_improvements: array of 2 improved objection responses
- gatekeeper_improvement: 1 new gatekeeper technique
- cadence_adjustment: recommendation for follow-up timing changes
Return ONLY JSON, no markdown.`
          },
          { role: "user", content: JSON.stringify(data) }
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
    console.error("Weekly patch generation error:", e);
  }
  return null;
}

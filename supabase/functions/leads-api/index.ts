import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function authenticate(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("LEADS_API_KEY");
  if (!expectedKey || !apiKey) return false;
  return apiKey === expectedKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate
  if (!authenticate(req)) {
    return jsonResponse({ error: "Unauthorized. Provide a valid x-api-key header." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // pathParts: ["leads-api"] or ["leads-api", "<resource>"] or ["leads-api", "<resource>", "<id>"]
  const resource = pathParts[1] || "";
  const resourceId = pathParts[2] || "";

  try {
    // ─── GET /leads-api/leads ───
    if (req.method === "GET" && (resource === "leads" || resource === "")) {
      const params = url.searchParams;
      const limit = Math.min(parseInt(params.get("limit") || "100"), 500);
      const offset = parseInt(params.get("offset") || "0");
      const status = params.get("status");
      const since = params.get("since"); // ISO date
      const gclid = params.get("gclid");
      const utmSource = params.get("utm_source");
      const utmCampaign = params.get("utm_campaign");
      const state = params.get("state");
      const zip = params.get("zip");
      const includeOrders = params.get("include_orders") !== "false";

      // Fetch abandoned_checkouts (leads)
      let leadsQuery = supabase
        .from("abandoned_checkouts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) leadsQuery = leadsQuery.eq("status", status);
      if (since) leadsQuery = leadsQuery.gte("created_at", since);
      if (gclid) leadsQuery = leadsQuery.eq("gclid", gclid);
      if (utmSource) leadsQuery = leadsQuery.eq("utm_source", utmSource);
      if (utmCampaign) leadsQuery = leadsQuery.eq("utm_campaign", utmCampaign);
      if (state) leadsQuery = leadsQuery.eq("state", state);
      if (zip) leadsQuery = leadsQuery.eq("zip", zip);

      const { data: leads, error: leadsError } = await leadsQuery;
      if (leadsError) throw leadsError;

      let orders: any[] = [];
      if (includeOrders) {
        let ordersQuery = supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) ordersQuery = ordersQuery.eq("status", status);
        if (since) ordersQuery = ordersQuery.gte("created_at", since);
        if (gclid) ordersQuery = ordersQuery.eq("gclid", gclid);
        if (utmSource) ordersQuery = ordersQuery.eq("utm_source", utmSource);
        if (utmCampaign) ordersQuery = ordersQuery.eq("utm_campaign", utmCampaign);
        if (state) ordersQuery = ordersQuery.eq("state", state);
        if (zip) ordersQuery = ordersQuery.eq("zip", zip);

        const { data: ordersData, error: ordersError } = await ordersQuery;
        if (ordersError) throw ordersError;
        orders = ordersData || [];
      }

      return jsonResponse({
        leads: leads || [],
        orders,
        meta: { limit, offset, leads_count: leads?.length || 0, orders_count: orders.length },
      });
    }

    // ─── GET /leads-api/history?lead_id=xxx ───
    if (req.method === "GET" && resource === "history") {
      const leadId = url.searchParams.get("lead_id");
      if (!leadId) {
        return jsonResponse({ error: "lead_id query parameter is required" }, 400);
      }

      const { data, error } = await supabase
        .from("lead_status_history")
        .select("*")
        .eq("lead_id", leadId)
        .order("changed_at", { ascending: true });

      if (error) throw error;
      return jsonResponse({ history: data || [] });
    }

    // ─── PATCH /leads-api/leads/<id> ───
    if (req.method === "PATCH" && resource === "leads" && resourceId) {
      const body = await req.json();
      const { status: newStatus, lead_type, changed_by } = body;

      if (!newStatus) {
        return jsonResponse({ error: "status field is required" }, 400);
      }

      const table = lead_type === "order" ? "orders" : "abandoned_checkouts";

      // Get current status for history
      const { data: current, error: fetchError } = await supabase
        .from(table)
        .select("status")
        .eq("id", resourceId)
        .single();

      if (fetchError) throw fetchError;

      // Update status
      const { error: updateError } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq("id", resourceId);

      if (updateError) throw updateError;

      // The trigger will auto-log to lead_status_history, but if changed_by != 'system':
      if (changed_by && changed_by !== "system") {
        await supabase.from("lead_status_history").insert({
          lead_id: resourceId,
          lead_type: lead_type || "abandoned_checkout",
          old_status: current?.status || null,
          new_status: newStatus,
          changed_by: changed_by || "api",
        });
      }

      return jsonResponse({ success: true, id: resourceId, old_status: current?.status, new_status: newStatus });
    }

    // ─── GET /leads-api/stats ───
    if (req.method === "GET" && resource === "stats") {
      const since = url.searchParams.get("since") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: leads } = await supabase
        .from("abandoned_checkouts")
        .select("status, state, zip, utm_source, utm_campaign, utm_term, gclid, created_at")
        .gte("created_at", since);

      const { data: orders } = await supabase
        .from("orders")
        .select("status, state, zip, utm_source, utm_campaign, utm_term, gclid, created_at")
        .gte("created_at", since);

      // Aggregate by utm_source
      const bySource: Record<string, { leads: number; orders: number }> = {};
      for (const lead of leads || []) {
        const src = lead.utm_source || "(direct)";
        if (!bySource[src]) bySource[src] = { leads: 0, orders: 0 };
        bySource[src].leads++;
      }
      for (const order of orders || []) {
        const src = order.utm_source || "(direct)";
        if (!bySource[src]) bySource[src] = { leads: 0, orders: 0 };
        bySource[src].orders++;
      }

      // Aggregate by state
      const byState: Record<string, { leads: number; orders: number }> = {};
      for (const lead of leads || []) {
        const st = lead.state || "(unknown)";
        if (!byState[st]) byState[st] = { leads: 0, orders: 0 };
        byState[st].leads++;
      }
      for (const order of orders || []) {
        const st = order.state || "(unknown)";
        if (!byState[st]) byState[st] = { leads: 0, orders: 0 };
        byState[st].orders++;
      }

      // Aggregate by campaign
      const byCampaign: Record<string, { leads: number; orders: number }> = {};
      for (const lead of leads || []) {
        const c = lead.utm_campaign || "(none)";
        if (!byCampaign[c]) byCampaign[c] = { leads: 0, orders: 0 };
        byCampaign[c].leads++;
      }
      for (const order of orders || []) {
        const c = order.utm_campaign || "(none)";
        if (!byCampaign[c]) byCampaign[c] = { leads: 0, orders: 0 };
        byCampaign[c].orders++;
      }

      return jsonResponse({
        period_since: since,
        totals: {
          leads: leads?.length || 0,
          orders: orders?.length || 0,
          paid_leads: (leads || []).filter(l => l.gclid).length,
        },
        by_source: bySource,
        by_state: byState,
        by_campaign: byCampaign,
      });
    }

    return jsonResponse({ error: `Unknown route: ${req.method} /${resource}/${resourceId}` }, 404);
  } catch (error: any) {
    console.error("Leads API error:", error);
    return jsonResponse({ error: error.message || "Internal server error" }, 500);
  }
});

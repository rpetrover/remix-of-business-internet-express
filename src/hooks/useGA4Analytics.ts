import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReportType =
  | "overview"
  | "traffic_over_time"
  | "top_pages"
  | "traffic_sources"
  | "geography"
  | "devices"
  | "campaigns"
  | "conversions";

interface GA4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

interface GA4Response {
  rows?: GA4Row[];
  totals?: GA4Row[];
  metricHeaders?: { name: string }[];
  dimensionHeaders?: { name: string }[];
}

export interface AnalyticsData {
  rows: Record<string, string | number>[];
  headers: string[];
  metricHeaders: string[];
  dimensionHeaders: string[];
}

function parseGA4Response(data: GA4Response): AnalyticsData {
  const dimensionHeaders = (data.dimensionHeaders || []).map((h) => h.name);
  const metricHeaders = (data.metricHeaders || []).map((h) => h.name);
  const headers = [...dimensionHeaders, ...metricHeaders];

  const rows = (data.rows || []).map((row) => {
    const record: Record<string, string | number> = {};
    (row.dimensionValues || []).forEach((v, i) => {
      record[dimensionHeaders[i]] = v.value;
    });
    (row.metricValues || []).forEach((v, i) => {
      const num = parseFloat(v.value);
      record[metricHeaders[i]] = isNaN(num) ? v.value : num;
    });
    return record;
  });

  return { rows, headers, metricHeaders, dimensionHeaders };
}

export function useGA4Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchReport = useCallback(
    async (
      report: ReportType,
      startDate?: string,
      endDate?: string
    ): Promise<AnalyticsData | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: invokeError } = await supabase.functions.invoke("ga4-analytics", {
          body: { report, startDate, endDate },
        });

        if (invokeError) throw invokeError;

        if (data?.needs_setup) {
          setNeedsSetup(true);
          return null;
        }

        if (!data?.success) {
          throw new Error(data?.error || "Unknown error");
        }

        return parseGA4Response(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchReport, loading, error, needsSetup };
}

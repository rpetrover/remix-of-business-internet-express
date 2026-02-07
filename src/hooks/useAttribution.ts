/**
 * Attribution capture and persistence.
 * Captures gclid, gbraid, wbraid, and UTM parameters from the URL on first visit.
 * Persists them in localStorage for the duration of the session/funnel (90-day TTL).
 */

const STORAGE_KEY = 'bie-attribution';
const TTL_DAYS = 90;

export interface AttributionData {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_adgroup?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  captured_at?: string;
}

const PARAM_KEYS: (keyof AttributionData)[] = [
  'gclid', 'gbraid', 'wbraid',
  'utm_source', 'utm_medium', 'utm_campaign',
  'utm_adgroup', 'utm_term', 'utm_content',
];

/**
 * Capture attribution params from the current URL and persist in localStorage.
 * Only overwrites if new params are found (first-touch attribution).
 * Call this once on app load.
 */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const newData: Partial<AttributionData> = {};
    let hasNew = false;

    for (const key of PARAM_KEYS) {
      const value = params.get(key);
      if (value) {
        newData[key] = value;
        hasNew = true;
      }
    }

    if (hasNew) {
      // First-touch: only overwrite if we have new click IDs or no existing data
      const existing = getAttribution();
      const hasExistingClickId = existing.gclid || existing.gbraid || existing.wbraid;
      const hasNewClickId = newData.gclid || newData.gbraid || newData.wbraid;

      // If new click ID arrived, overwrite everything. Otherwise merge.
      const merged = hasNewClickId
        ? { ...newData, landing_page: window.location.pathname, captured_at: new Date().toISOString() }
        : { ...existing, ...newData, landing_page: existing.landing_page || window.location.pathname, captured_at: existing.captured_at || new Date().toISOString() };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } else if (!localStorage.getItem(STORAGE_KEY)) {
      // No params and no stored data — store landing page only
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        landing_page: window.location.pathname,
        captured_at: new Date().toISOString(),
      }));
    }
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get stored attribution data.
 */
export function getAttribution(): AttributionData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const data = JSON.parse(stored) as AttributionData;

    // Check TTL
    if (data.captured_at) {
      const capturedAt = new Date(data.captured_at).getTime();
      const now = Date.now();
      if (now - capturedAt > TTL_DAYS * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }
    }

    return data;
  } catch {
    return {};
  }
}

/**
 * Get attribution data formatted for database insertion.
 * Returns only non-empty fields.
 */
export function getAttributionForDb(): Record<string, string> {
  const data = getAttribution();
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value && key !== 'captured_at') {
      result[key] = value;
    }
  }

  return result;
}

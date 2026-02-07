import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Base64url encode
function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Create JWT for Google service account auth
async function createServiceAccountJWT(credentials: any): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const claimsB64 = base64url(encoder.encode(JSON.stringify(claims)));
  const unsignedToken = `${headerB64}.${claimsB64}`;

  // Import the private key
  const pemContent = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsignedToken));
  const signatureB64 = base64url(new Uint8Array(signature));

  return `${unsignedToken}.${signatureB64}`;
}

// Get access token from Google OAuth
async function getAccessToken(credentials: any): Promise<string> {
  const jwt = await createServiceAccountJWT(credentials);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// Run a GA4 Data API report
async function runReport(accessToken: string, propertyId: string, body: any) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`GA4 API error: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const credentialsJson = Deno.env.get("GA4_SERVICE_ACCOUNT_KEY");
    const propertyId = Deno.env.get("GA4_PROPERTY_ID");

    if (!credentialsJson || !propertyId) {
      return new Response(
        JSON.stringify({
          error: "GA4 not configured",
          needs_setup: true,
          message: "GA4_SERVICE_ACCOUNT_KEY and GA4_PROPERTY_ID secrets must be configured.",
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const credentials = JSON.parse(credentialsJson);
    const accessToken = await getAccessToken(credentials);

    const { report, startDate, endDate } = await req.json();

    const dateRange = {
      startDate: startDate || "30daysAgo",
      endDate: endDate || "today",
    };

    let result: any;

    switch (report) {
      case "overview": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "newUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
            { name: "engagementRate" },
            { name: "conversions" },
          ],
        });
        break;
      }

      case "traffic_over_time": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        });
        break;
      }

      case "top_pages": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "pagePath" }],
          metrics: [
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
          ],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 20,
        });
        break;
      }

      case "traffic_sources": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "conversions" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 20,
        });
        break;
      }

      case "geography": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "region" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 20,
        });
        break;
      }

      case "devices": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "bounceRate" },
          ],
        });
        break;
      }

      case "campaigns": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [
            { name: "sessionCampaignName" },
            { name: "sessionSource" },
            { name: "sessionMedium" },
          ],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "conversions" },
            { name: "engagementRate" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 20,
        });
        break;
      }

      case "conversions": {
        result = await runReport(accessToken, propertyId, {
          dateRanges: [dateRange],
          dimensions: [{ name: "eventName" }],
          metrics: [
            { name: "eventCount" },
            { name: "totalUsers" },
          ],
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              inListFilter: {
                values: [
                  "generate_lead",
                  "purchase",
                  "contact_form_submit",
                  "check_availability",
                  "add_to_cart",
                  "begin_checkout",
                ],
              },
            },
          },
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown report type: ${report}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("GA4 analytics error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

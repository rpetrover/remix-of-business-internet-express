import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing reCAPTCHA token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      // Fail open in dev, but log the error
      return new Response(
        JSON.stringify({ success: true, score: 1.0, warning: "Secret key not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      body: params,
    });

    const data = await verifyRes.json();

    console.log("reCAPTCHA verify response:", JSON.stringify(data));

    if (!data.success) {
      return new Response(
        JSON.stringify({ success: false, error: "reCAPTCHA verification failed", details: data["error-codes"] }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check action matches if provided
    if (action && data.action !== action) {
      return new Response(
        JSON.stringify({ success: false, error: "Action mismatch" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Score threshold: 0.5 is Google's recommended threshold
    const score = data.score || 0;
    if (score < 0.5) {
      return new Response(
        JSON.stringify({ success: false, error: "Low reCAPTCHA score", score }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, score }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("reCAPTCHA verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

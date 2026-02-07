import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, code } = await req.json();

    // === SEND OTP ===
    if (action === "send") {
      if (!email || typeof email !== "string") {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Verify this email belongs to an existing user with admin role
      const { data: users } = await supabase.auth.admin.listUsers();
      const matchedUser = users?.users?.find(
        (u: any) => u.email?.toLowerCase() === normalizedEmail
      );

      if (!matchedUser) {
        // Don't reveal whether the email exists
        return new Response(
          JSON.stringify({ success: true, message: "If this email is registered, a code has been sent." }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if user has admin role
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: matchedUser.id,
        _role: "admin",
      });

      if (!isAdmin) {
        // Don't reveal role status
        return new Response(
          JSON.stringify({ success: true, message: "If this email is registered, a code has been sent." }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Rate limit: max 1 OTP per email per 60 seconds
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const { data: recentCodes } = await supabase
        .from("admin_otp_codes")
        .select("id")
        .eq("email", normalizedEmail)
        .gte("created_at", oneMinuteAgo)
        .limit(1);

      if (recentCodes && recentCodes.length > 0) {
        return new Response(
          JSON.stringify({ error: "Please wait 60 seconds before requesting another code." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Invalidate any existing unused codes for this email
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("email", normalizedEmail)
        .eq("used", false);

      // Generate and store new OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

      await supabase.from("admin_otp_codes").insert({
        email: normalizedEmail,
        code: otp,
        expires_at: expiresAt,
      });

      // Send OTP via Resend
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      await resend.emails.send({
        from: "Business Internet Express <service@businessinternetexpress.com>",
        to: [normalizedEmail],
        subject: "Your Admin Access Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a1a; margin-bottom: 8px;">Admin Access Code</h2>
            <p style="color: #666; margin-bottom: 24px;">Use the code below to sign in to the admin dashboard:</p>
            <div style="background: #f0f4ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">Business Internet Express</p>
          </div>
        `,
      });

      console.log("Admin OTP sent to:", normalizedEmail);

      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // === VERIFY OTP ===
    if (action === "verify") {
      if (!email || !code) {
        return new Response(
          JSON.stringify({ error: "Email and code are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find valid OTP
      const { data: otpRecord } = await supabase
        .from("admin_otp_codes")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("code", code)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code. Please request a new one." }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark OTP as used
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      // Generate a magic link token for this user (server-side, not emailed)
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (linkError || !linkData) {
        console.error("Failed to generate auth link:", linkError);
        return new Response(
          JSON.stringify({ error: "Authentication failed. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Return the hashed token so the client can establish a session
      const tokenHash = linkData.properties?.hashed_token;

      return new Response(
        JSON.stringify({ success: true, token_hash: tokenHash }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Admin OTP error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

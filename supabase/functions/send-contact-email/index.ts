import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  email: string;
  serviceAddress: string;
  speedRequirements: string;
  comments: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ContactFormData = await req.json();

    // Validate required fields
    const { firstName, lastName, businessName, phone, email } = body;
    if (!firstName?.trim() || !lastName?.trim() || !businessName?.trim() || !phone?.trim() || !email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Business Internet Express <noreply@businessinternetexpress.com>",
      to: ["service@businessinternetexpress.com"],
      replyTo: email,
      subject: `New Quote Request from ${firstName} ${lastName} - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0066cc; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Business Quote Request</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">From businessinternetexpress.com</p>
          </div>
          
          <div style="padding: 24px; background: #f9f9f9; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Business:</strong></td>
                <td style="padding: 8px 0; color: #333;">${businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #333;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ${body.serviceAddress ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Service Address:</strong></td>
                <td style="padding: 8px 0; color: #333;">${body.serviceAddress}</td>
              </tr>` : ""}
              ${body.speedRequirements && body.speedRequirements !== "Select your speed needs" ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Speed Needs:</strong></td>
                <td style="padding: 8px 0; color: #333;">${body.speedRequirements}</td>
              </tr>` : ""}
            </table>

            ${body.comments ? `
            <h2 style="color: #333; margin-top: 20px;">Additional Comments</h2>
            <p style="color: #333; background: white; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0;">${body.comments}</p>
            ` : ""}
          </div>

          <div style="padding: 16px; background: #e8e8e8; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
            This email was sent from the Business Internet Express website contact form.
          </div>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

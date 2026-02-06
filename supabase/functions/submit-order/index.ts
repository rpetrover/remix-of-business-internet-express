import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderData {
  customer_name: string;
  service_address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  contact_phone: string;
  contact_email: string;
  service_type?: string;
  preferred_provider?: string;
  selected_plan?: string;
  speed?: string;
  monthly_price?: number;
  channel?: string;
  notes?: string;
}

function formatOrderEmail(order: OrderData): string {
  const lines: string[] = [];

  lines.push("Dear Team,");
  lines.push("");
  lines.push("I hope you are doing well.");
  lines.push("");
  lines.push("We are requesting available options and pricing to start internet service at the location listed below. No order has been placed yet. This request is for evaluation and to proceed with the most cost-effective option.");
  lines.push("");
  lines.push(`Customer Name: ${order.customer_name}`);
  lines.push("Service Address:");
  lines.push(order.service_address);
  lines.push(`${order.city}, ${order.state} ${order.zip}`);
  lines.push(order.country || "United States");
  lines.push("");
  lines.push(`Contact Phone: ${order.contact_phone}`);
  lines.push(`Email: ${order.contact_email}`);
  lines.push("");
  lines.push("Service Requested:");
  lines.push(`• ${order.service_type || "Business internet service only"}`);

  if (order.preferred_provider) {
    lines.push(`• Preferred provider: ${order.preferred_provider}`);
  }

  if (order.selected_plan) {
    lines.push(`• Selected plan: ${order.selected_plan}`);
  }

  if (order.speed) {
    lines.push(`• Speed: ${order.speed}`);
  }

  if (order.monthly_price) {
    lines.push(`• Estimated monthly price: $${order.monthly_price}/month`);
  }

  lines.push("• Most cost-effective available option");
  lines.push("");
  lines.push("Requested Information:");

  if (order.preferred_provider) {
    lines.push(`• ${order.preferred_provider} business internet availability`);
  } else {
    lines.push("• Business internet availability");
  }

  lines.push("• Pricing and bandwidth options");
  lines.push("• Installation details and timeline");
  lines.push("• Any one-time or recurring charges");
  lines.push("");
  lines.push("Please let us know if you need any additional information to move forward.");

  if (order.notes) {
    lines.push("");
    lines.push(`Additional Notes: ${order.notes}`);
  }

  lines.push("");
  lines.push("");
  lines.push("Best,");
  lines.push("Business Internet Express");
  lines.push("Sales Team");
  lines.push("www.businessinternetexpress.com");

  return lines.join("\n");
}

function formatOrderHtml(order: OrderData): string {
  const text = formatOrderEmail(order);
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">${text.replace(/\n/g, "<br/>")}</div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();

    // Validate required fields
    const required = ["customer_name", "service_address", "city", "state", "zip", "contact_phone", "contact_email"];
    for (const field of required) {
      if (!orderData[field as keyof OrderData]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.contact_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Format the order email
    const emailText = formatOrderEmail(orderData);
    const emailHtml = formatOrderHtml(orderData);
    const subject = `[Business Internet Express] Internet Service Request – ${orderData.customer_name}`;

    // Send to Intelisys
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "Business Internet Express <orders@businessinternetexpress.com>",
      to: ["intelisys_orders@scansource.com"],
      cc: ["service@businessinternetexpress.com"],
      subject,
      text: emailText,
      html: emailHtml,
    });

    console.log("Order email sent to Intelisys:", emailResponse);

    // Store the order in the database
    const { data: orderRecord, error: insertError } = await supabase.from("orders").insert({
      customer_name: String(orderData.customer_name).slice(0, 200),
      service_address: String(orderData.service_address).slice(0, 500),
      city: String(orderData.city).slice(0, 100),
      state: String(orderData.state).slice(0, 50),
      zip: String(orderData.zip).slice(0, 20),
      country: String(orderData.country || "United States").slice(0, 100),
      contact_phone: String(orderData.contact_phone).slice(0, 50),
      contact_email: String(orderData.contact_email).slice(0, 320),
      service_type: String(orderData.service_type || "Business internet service only").slice(0, 200),
      preferred_provider: orderData.preferred_provider ? String(orderData.preferred_provider).slice(0, 200) : null,
      selected_plan: orderData.selected_plan ? String(orderData.selected_plan).slice(0, 200) : null,
      speed: orderData.speed ? String(orderData.speed).slice(0, 100) : null,
      monthly_price: orderData.monthly_price || null,
      status: "submitted",
      channel: orderData.channel || "chat",
      intelisys_email_sent: true,
      intelisys_sent_at: new Date().toISOString(),
      resend_id: emailResponse.data?.id || null,
      notes: orderData.notes ? String(orderData.notes).slice(0, 2000) : null,
    }).select().single();

    if (insertError) {
      console.error("Error storing order:", insertError);
    }

    // Also log as outbound email
    await supabase.from("emails").insert({
      direction: "outbound",
      from_email: "orders@businessinternetexpress.com",
      from_name: "Business Internet Express",
      to_email: "intelisys_orders@scansource.com",
      to_name: "Intelisys Orders",
      subject,
      body_html: emailHtml,
      body_text: emailText,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: "Business Internet Express <noreply@businessinternetexpress.com>",
      to: [orderData.contact_email],
      subject: `Order Confirmation – Business Internet Express`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 24px;">
            <h2 style="color: #1a365d;">Thank You for Your Order!</h2>
            <p>Hi ${orderData.customer_name},</p>
            <p>We've received your internet service request and have submitted it to our provider network for processing. Here's a summary:</p>
            <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Service Address:</strong> ${orderData.service_address}, ${orderData.city}, ${orderData.state} ${orderData.zip}</p>
              ${orderData.preferred_provider ? `<p><strong>Preferred Provider:</strong> ${orderData.preferred_provider}</p>` : ""}
              ${orderData.selected_plan ? `<p><strong>Selected Plan:</strong> ${orderData.selected_plan}</p>` : ""}
              ${orderData.speed ? `<p><strong>Speed:</strong> ${orderData.speed}</p>` : ""}
              ${orderData.monthly_price ? `<p><strong>Estimated Price:</strong> $${orderData.monthly_price}/month</p>` : ""}
            </div>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will verify availability and pricing with the provider</li>
              <li>You'll receive a confirmation with final pricing within 1-2 business days</li>
              <li>Once confirmed, installation will be scheduled (often same-day or next-day for broadband)</li>
            </ul>
            <p>If you have any questions, reply to this email or chat with us at <a href="https://businessinternetexpress.com">businessinternetexpress.com</a>.</p>
          </div>
          <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            Business Internet Express | businessinternetexpress.com
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: orderRecord?.id,
        message: "Order submitted successfully to Intelisys" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error submitting order:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to submit order" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

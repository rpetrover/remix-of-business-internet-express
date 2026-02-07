import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItem {
  product_name: string;
  price: number;
  speed?: string;
  is_bundle?: boolean;
}

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
  cart_items?: CartItem[];
  business_name?: string;
  porting_bill_url?: string;
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

function formatCustomerConfirmationHtml(order: OrderData, orderId: string): string {
  const confirmationNumber = orderId ? orderId.slice(0, 8).toUpperCase() : `BIE-${Date.now().toString(36).toUpperCase()}`;

  const cartItemsHtml = (order.cart_items || []).map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.product_name}</strong>
        ${item.speed ? `<br/><span style="color: #6b7280; font-size: 13px;">${item.speed}</span>` : ""}
        ${item.is_bundle ? `<br/><span style="background: #dbeafe; color: #1e40af; font-size: 11px; padding: 2px 8px; border-radius: 4px;">Bundle Discount</span>` : ""}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$${item.price.toFixed(2)}/mo</td>
    </tr>
  `).join("");

  const totalPrice = order.monthly_price || (order.cart_items || []).reduce((sum, i) => sum + i.price, 0);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0066cc, #004a99); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 28px;">🎉 Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you for choosing Business Internet Express</p>
      </div>

      <!-- Confirmation Number -->
      <div style="background: #eff6ff; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Confirmation Number</p>
        <p style="color: #0066cc; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 3px; margin: 0;">${confirmationNumber}</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p style="color: #333; font-size: 15px;">Hi ${order.customer_name},</p>
        <p style="color: #333; font-size: 15px;">Your business internet service order has been successfully submitted. Here's your complete order summary:</p>

        <!-- Order Items -->
        <h2 style="color: #1a365d; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          ${cartItemsHtml || `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                <strong>${order.selected_plan || order.service_type || "Business Internet Service"}</strong>
                ${order.speed ? `<br/><span style="color: #6b7280; font-size: 13px;">${order.speed}</span>` : ""}
              </td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
                ${order.monthly_price ? `$${order.monthly_price.toFixed(2)}/mo` : "TBD"}
              </td>
            </tr>
          `}
          <tr style="background: #f9fafb;">
            <td style="padding: 14px 16px; font-weight: bold; font-size: 16px;">Monthly Total</td>
            <td style="padding: 14px 16px; text-align: right; font-weight: bold; font-size: 18px; color: #0066cc;">$${totalPrice.toFixed(2)}/mo</td>
          </tr>
        </table>

        <!-- Service Details -->
        <h2 style="color: #1a365d; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">Service Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%;"><strong>Service Address:</strong></td>
            <td style="padding: 8px 0; color: #333;">${order.service_address}<br/>${order.city}, ${order.state} ${order.zip}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Contact Email:</strong></td>
            <td style="padding: 8px 0; color: #333;">${order.contact_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Contact Phone:</strong></td>
            <td style="padding: 8px 0; color: #333;">${order.contact_phone}</td>
          </tr>
          ${order.business_name ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Business Name:</strong></td>
            <td style="padding: 8px 0; color: #333;">${order.business_name}</td>
          </tr>` : ""}
        </table>

        <!-- What Happens Next -->
        <h2 style="color: #1a365d; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">What Happens Next</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; vertical-align: top; width: 40px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; text-align: center; line-height: 28px; color: #0066cc; font-weight: bold; font-size: 13px;">1</div>
            </td>
            <td style="padding: 10px 0;">
              <strong style="color: #333;">Order Confirmation</strong><br/>
              <span style="color: #6b7280; font-size: 13px;">You'll receive this confirmation email within minutes.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; vertical-align: top;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; text-align: center; line-height: 28px; color: #0066cc; font-weight: bold; font-size: 13px;">2</div>
            </td>
            <td style="padding: 10px 0;">
              <strong style="color: #333;">Account Specialist Call</strong><br/>
              <span style="color: #6b7280; font-size: 13px;">A dedicated specialist will call you within 1-2 business days to confirm details.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; vertical-align: top;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; text-align: center; line-height: 28px; color: #0066cc; font-weight: bold; font-size: 13px;">3</div>
            </td>
            <td style="padding: 10px 0;">
              <strong style="color: #333;">Installation Scheduled</strong><br/>
              <span style="color: #6b7280; font-size: 13px;">We'll schedule a convenient installation date within 3-5 business days.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; vertical-align: top;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; text-align: center; line-height: 28px; color: #0066cc; font-weight: bold; font-size: 13px;">4</div>
            </td>
            <td style="padding: 10px 0;">
              <strong style="color: #333;">You're Connected!</strong><br/>
              <span style="color: #6b7280; font-size: 13px;">Your high-speed business internet goes live. 24/7 support available.</span>
            </td>
          </tr>
        </table>

        <!-- Trust Signals -->
        <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; text-align: center;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; text-align: center; width: 33%;">
                <strong style="font-size: 13px; color: #333;">🛡️ 30-Day Guarantee</strong>
              </td>
              <td style="padding: 8px; text-align: center; width: 33%;">
                <strong style="font-size: 13px; color: #333;">⭐ 99.9% Uptime</strong>
              </td>
              <td style="padding: 8px; text-align: center; width: 33%;">
                <strong style="font-size: 13px; color: #333;">📞 24/7 Support</strong>
              </td>
            </tr>
          </table>
        </div>

        <p style="color: #333; font-size: 15px; margin-top: 24px;">
          Need help? Reply to this email, call us at <a href="tel:+18882303278" style="color: #0066cc;">1-888-230-FAST</a>, or chat with us at <a href="https://businessinternetexpress.com" style="color: #0066cc;">businessinternetexpress.com</a>.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 16px 24px; background: #f5f5f5; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        Business Internet Express | businessinternetexpress.com<br/>
        <span style="font-size: 11px;">This is an automated order confirmation. Please do not reply directly to this email.</span>
      </div>
    </div>
  `;
}

function formatAdminNotificationHtml(order: OrderData, orderId: string): string {
  const confirmationNumber = orderId ? orderId.slice(0, 8).toUpperCase() : "N/A";
  const totalPrice = order.monthly_price || (order.cart_items || []).reduce((sum, i) => sum + i.price, 0);

  const cartItemsHtml = (order.cart_items || []).map(item => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.speed || "—"}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}/mo</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a365d; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">🆕 New Order Received</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Confirmation: ${confirmationNumber} | Channel: ${order.channel || "web"}</p>
      </div>

      <div style="padding: 24px; border: 1px solid #e0e0e0;">
        <h2 style="color: #1a365d; font-size: 16px; margin: 0 0 12px;">Customer Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 35%;"><strong>Name:</strong></td>
            <td style="padding: 6px 0; color: #333;">${order.customer_name}</td>
          </tr>
          ${order.business_name ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Business:</strong></td>
            <td style="padding: 6px 0; color: #333;">${order.business_name}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td>
            <td style="padding: 6px 0; color: #333;"><a href="mailto:${order.contact_email}">${order.contact_email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td>
            <td style="padding: 6px 0; color: #333;">${order.contact_phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Address:</strong></td>
            <td style="padding: 6px 0; color: #333;">${order.service_address}<br/>${order.city}, ${order.state} ${order.zip}</td>
          </tr>
        </table>

        <h2 style="color: #1a365d; font-size: 16px; margin: 0 0 12px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #475569;">Product</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #475569;">Speed</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #475569;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartItemsHtml || `
              <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${order.selected_plan || order.service_type || "Internet Service"}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${order.speed || "—"}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${order.monthly_price ? `$${order.monthly_price.toFixed(2)}/mo` : "TBD"}</td>
              </tr>
            `}
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb;">
              <td colspan="2" style="padding: 10px 12px; font-weight: bold;">Monthly Total</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #0066cc;">$${totalPrice.toFixed(2)}/mo</td>
            </tr>
          </tfoot>
        </table>

        ${order.notes ? `
        <h2 style="color: #1a365d; font-size: 16px; margin: 16px 0 8px;">Notes</h2>
        <p style="color: #333; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px;">${order.notes}</p>
        ` : ""}

        ${order.porting_bill_url ? `
        <h2 style="color: #1a365d; font-size: 16px; margin: 16px 0 8px;">📎 Porting Bill Attached</h2>
        <p style="color: #333; background: #fff7ed; padding: 12px; border-radius: 6px; border: 1px solid #fed7aa; font-size: 14px;">
          A phone bill has been uploaded for number porting. View it in the admin panel under the order details.
        </p>
        ` : ""}
      </div>

      <div style="padding: 12px 24px; background: #f5f5f5; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
        Business Internet Express — Admin Order Notification
      </div>
    </div>
  `;
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

    // Intelisys email is no longer sent automatically.
    // Admins submit to Intelisys manually from the admin panel using their local email client.
    // Admins submit to Intelisys manually from the admin panel using their local email client.
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      channel: orderData.channel || "web",
      intelisys_email_sent: false,
      intelisys_sent_at: null,
      resend_id: null,
      notes: orderData.notes ? String(orderData.notes).slice(0, 2000) : null,
      porting_bill_url: orderData.porting_bill_url ? String(orderData.porting_bill_url).slice(0, 500) : null,
    }).select().single();

    if (insertError) {
      console.error("Error storing order:", insertError);
    }

    const orderId = orderRecord?.id || "";

    // (Intelisys email log removed — admin submits manually now)

    // Send detailed customer confirmation email
    const customerHtml = formatCustomerConfirmationHtml(orderData, orderId);
    const customerEmailRes = await resend.emails.send({
      from: "Business Internet Express <service@businessinternetexpress.com>",
      to: [orderData.contact_email],
      subject: `Order Confirmed – Business Internet Express`,
      html: customerHtml,
    });

    console.log("Customer confirmation email sent:", customerEmailRes);

    // Send admin notification email
    const adminHtml = formatAdminNotificationHtml(orderData, orderId);
    const adminEmailRes = await resend.emails.send({
      from: "Business Internet Express <service@businessinternetexpress.com>",
      to: ["rich@scotchtowntechnology.com"],
      subject: `🆕 New Order: ${orderData.customer_name} – $${(orderData.monthly_price || 0).toFixed(2)}/mo`,
      html: adminHtml,
    });

    console.log("Admin notification email sent:", adminEmailRes);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: orderId,
        message: "Order submitted successfully" 
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

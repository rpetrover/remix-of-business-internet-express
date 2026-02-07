import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

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
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Missing session_id" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const metadata = session.metadata || {};

    // Reconstruct the order data from chunked metadata
    let orderDataStr = "";
    let chunkIndex = 0;
    while (metadata[`order_data_${chunkIndex}`]) {
      orderDataStr += metadata[`order_data_${chunkIndex}`];
      chunkIndex++;
    }

    if (!orderDataStr) {
      return new Response(
        JSON.stringify({ error: "No order data found in session" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderData = JSON.parse(orderDataStr);

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store the order in the database (including attribution data)
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
      notes: [
        orderData.notes || "",
        `Activation Fee: $29.99 (Stripe Session: ${session_id})`,
        `Stripe Payment Intent: ${session.payment_intent}`,
      ].filter(Boolean).join(" | "),
      porting_bill_url: orderData.porting_bill_url ? String(orderData.porting_bill_url).slice(0, 500) : null,
      // Attribution data
      gclid: orderData.gclid || null,
      gbraid: orderData.gbraid || null,
      wbraid: orderData.wbraid || null,
      utm_source: orderData.utm_source || null,
      utm_medium: orderData.utm_medium || null,
      utm_campaign: orderData.utm_campaign || null,
      utm_adgroup: orderData.utm_adgroup || null,
      utm_term: orderData.utm_term || null,
      utm_content: orderData.utm_content || null,
      landing_page: orderData.landing_page || null,
    }).select().single();

    if (insertError) {
      console.error("Error storing order:", insertError);
    }

    const orderId = orderRecord?.id || "";

    // Send emails
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Customer confirmation email
    const totalPrice = orderData.monthly_price || (orderData.cart_items || []).reduce((sum: number, i: any) => sum + i.price, 0);
    const confirmationNumber = orderId ? orderId.slice(0, 8).toUpperCase() : `BIE-${Date.now().toString(36).toUpperCase()}`;

    const cartItemsHtml = (orderData.cart_items || []).map((item: any) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product_name}</strong>
          ${item.speed ? `<br/><span style="color: #6b7280; font-size: 13px;">${item.speed}</span>` : ""}
          ${item.is_bundle ? `<br/><span style="background: #dbeafe; color: #1e40af; font-size: 11px; padding: 2px 8px; border-radius: 4px;">Bundle Discount</span>` : ""}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$${item.price.toFixed(2)}/mo</td>
      </tr>
    `).join("");

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0066cc, #004a99); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you for choosing Business Internet Express</p>
        </div>
        <div style="background: #eff6ff; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Confirmation Number</p>
          <p style="color: #0066cc; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 3px; margin: 0;">${confirmationNumber}</p>
        </div>
        <div style="padding: 24px;">
          <p style="color: #333; font-size: 15px;">Hi ${orderData.customer_name},</p>
          <p style="color: #333; font-size: 15px;">Your business internet service order has been successfully submitted and your $29.99 activation fee has been processed.</p>
          
          <h2 style="color: #1a365d; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${cartItemsHtml || `
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                  <strong>${orderData.selected_plan || orderData.service_type || "Business Internet Service"}</strong>
                  ${orderData.speed ? `<br/><span style="color: #6b7280; font-size: 13px;">${orderData.speed}</span>` : ""}
                </td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
                  ${orderData.monthly_price ? `$${orderData.monthly_price.toFixed(2)}/mo` : "TBD"}
                </td>
              </tr>
            `}
            <tr style="background: #f0fdf4;">
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                <strong>Account Activation Fee</strong> (one-time)
                <br/><span style="color: #6b7280; font-size: 12px;">Refundable within 24 hours</span>
              </td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$29.99</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 14px 16px; font-weight: bold; font-size: 16px;">Monthly Total</td>
              <td style="padding: 14px 16px; text-align: right; font-weight: bold; font-size: 18px; color: #0066cc;">$${totalPrice.toFixed(2)}/mo</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.6;">
              <strong>Broker Disclosure:</strong> Business Internet Express operates as an independent internet circuit broker. 
              The $29.99 activation fee is a one-time brokerage service fee and is separate from your monthly internet service charges. 
              This fee is refundable within 24 hours of payment. To request a refund, contact us at service@businessinternetexpress.com 
              or call 1-888-230-FAST.
            </p>
          </div>

          <h2 style="color: #1a365d; font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #0066cc; padding-bottom: 8px;">Service Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 40%;"><strong>Service Address:</strong></td>
              <td style="padding: 8px 0; color: #333;">${orderData.service_address}<br/>${orderData.city}, ${orderData.state} ${orderData.zip}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Contact Email:</strong></td>
              <td style="padding: 8px 0; color: #333;">${orderData.contact_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Contact Phone:</strong></td>
              <td style="padding: 8px 0; color: #333;">${orderData.contact_phone}</td>
            </tr>
            ${orderData.business_name ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Business Name:</strong></td>
              <td style="padding: 8px 0; color: #333;">${orderData.business_name}</td>
            </tr>` : ""}
          </table>

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
        <div style="padding: 16px 24px; background: #f5f5f5; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
          Business Internet Express | businessinternetexpress.com<br/>
          <span style="font-size: 11px;">This is an automated order confirmation. Please do not reply directly to this email.</span>
        </div>
      </div>
    `;

    // Admin notification
    const adminCartHtml = (orderData.cart_items || []).map((item: any) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.speed || "—"}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}/mo</td>
      </tr>
    `).join("");

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a365d; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">🆕 New Order Received (PAID)</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Confirmation: ${confirmationNumber} | Channel: ${orderData.channel || "web"} | Activation Fee: ✅ Paid</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e0e0e0;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <strong style="color: #166534;">💳 Activation Fee Paid:</strong> $29.99 via Stripe
            <br/><span style="color: #6b7280; font-size: 12px;">Session: ${session_id} | Payment Intent: ${session.payment_intent}</span>
          </div>
          <h2 style="color: #1a365d; font-size: 16px; margin: 0 0 12px;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; width: 35%;"><strong>Name:</strong></td>
              <td style="padding: 6px 0; color: #333;">${orderData.customer_name}</td>
            </tr>
            ${orderData.business_name ? `
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Business:</strong></td>
              <td style="padding: 6px 0; color: #333;">${orderData.business_name}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td>
              <td style="padding: 6px 0; color: #333;"><a href="mailto:${orderData.contact_email}">${orderData.contact_email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td>
              <td style="padding: 6px 0; color: #333;">${orderData.contact_phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;"><strong>Address:</strong></td>
              <td style="padding: 6px 0; color: #333;">${orderData.service_address}<br/>${orderData.city}, ${orderData.state} ${orderData.zip}</td>
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
              ${adminCartHtml || `
                <tr>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${orderData.selected_plan || orderData.service_type || "Internet Service"}</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${orderData.speed || "—"}</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${orderData.monthly_price ? `$${orderData.monthly_price.toFixed(2)}/mo` : "TBD"}</td>
                </tr>
              `}
              <tr style="background: #f0fdf4;">
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;" colspan="2">Account Activation Fee (one-time, paid)</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">$29.99</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background: #f9fafb;">
                <td colspan="2" style="padding: 10px 12px; font-weight: bold;">Monthly Total</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #0066cc;">$${totalPrice.toFixed(2)}/mo</td>
              </tr>
            </tfoot>
          </table>
          ${orderData.notes ? `
          <h2 style="color: #1a365d; font-size: 16px; margin: 16px 0 8px;">Notes</h2>
          <p style="color: #333; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 14px;">${orderData.notes}</p>
          ` : ""}
          ${orderData.porting_bill_url ? `
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

    await resend.emails.send({
      from: "Business Internet Express <service@businessinternetexpress.com>",
      to: [orderData.contact_email],
      subject: "Order Confirmed – Business Internet Express",
      html: customerHtml,
    });

    await resend.emails.send({
      from: "Business Internet Express <service@businessinternetexpress.com>",
      to: ["rich@scotchtowntechnology.com"],
      subject: `🆕 New Order (PAID): ${orderData.customer_name} – $${totalPrice.toFixed(2)}/mo`,
      html: adminHtml,
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        payment_status: session.payment_status,
        order_data: {
          customerName: orderData.customer_name,
          email: orderData.contact_email,
          phone: orderData.contact_phone,
          address: orderData.service_address,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.zip,
          items: orderData.cart_items || [],
          totalPrice,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify payment" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

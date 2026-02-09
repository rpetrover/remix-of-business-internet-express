import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This webhook is called by the ElevenLabs AI sales agent when a customer
// agrees to place an order during an outbound call.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Phone order submission received:", JSON.stringify(body));

    const {
      customer_name,
      contact_email,
      contact_phone,
      service_address,
      city,
      state,
      zip,
      selected_plan,
      speed,
      preferred_provider,
      lead_id,
      notes,
    } = body;

    // Validate required fields
    if (!customer_name || !service_address || !city || !state || !zip || !contact_phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields. Need: customer_name, service_address, city, state, zip, contact_phone",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name,
        contact_email: contact_email || "collected-by-phone@businessinternetexpress.com",
        contact_phone,
        service_address,
        city,
        state,
        zip,
        selected_plan: selected_plan || "Business Internet",
        speed: speed || "Up to 1 Gbps",
        preferred_provider: preferred_provider || "Spectrum",
        channel: "outbound_call",
        status: "pending",
        notes: notes || "Order placed via AI sales call",
        service_type: "Business internet service only",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("Order created:", order.id);

    // Update the outbound lead if lead_id was provided
    if (lead_id) {
      const { error: leadError } = await supabase
        .from("outbound_leads")
        .update({
          campaign_status: "converted",
          converted_order_id: order.id,
          call_outcome: "sale",
        })
        .eq("id", lead_id);

      if (leadError) {
        console.error("Lead update error:", leadError);
      }
    }

    // Send notification emails
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        // Admin notification
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Business Internet Express <service@businessinternetexpress.com>",
            to: ["rich@scotchtowntechnology.com"],
            subject: `🎉 New Phone Order: ${customer_name} in ${city}, ${state}`,
            html: `
              <h2>New Order from AI Sales Call!</h2>
              <p><strong>Customer:</strong> ${customer_name}</p>
              <p><strong>Phone:</strong> ${contact_phone}</p>
              <p><strong>Email:</strong> ${contact_email || "Not provided"}</p>
              <p><strong>Address:</strong> ${service_address}, ${city}, ${state} ${zip}</p>
              <p><strong>Plan:</strong> ${selected_plan || "Business Internet"}</p>
              <p><strong>Speed:</strong> ${speed || "Up to 1 Gbps"}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Channel:</strong> Outbound AI Sales Call</p>
              ${lead_id ? `<p><strong>Lead ID:</strong> ${lead_id}</p>` : ""}
              <hr>
              <p>This order was placed by the customer directly on the phone with our AI sales agent.</p>
            `,
          }),
        });

        // Customer confirmation (if email provided)
        if (contact_email && !contact_email.includes("collected-by-phone")) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Business Internet Express <service@businessinternetexpress.com>",
              to: [contact_email],
              subject: "Your Business Internet Order Confirmation",
              html: `
                <h2>Thank you for your order, ${customer_name}!</h2>
                <p>We're excited to get you connected with high-speed fiber internet.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                  <li><strong>Service Address:</strong> ${service_address}, ${city}, ${state} ${zip}</li>
                  <li><strong>Plan:</strong> ${selected_plan || "Business Internet"}</li>
                  <li><strong>Speed:</strong> ${speed || "Up to 1 Gbps"}</li>
                </ul>
                <p>Our team will be in touch shortly to schedule your installation.</p>
                <p>If you have any questions, call us at <a href="tel:+18882303278">1-888-230-FAST</a> or visit 
                <a href="https://businessinternetexpress.com">businessinternetexpress.com</a>.</p>
                <p>Best regards,<br>Business Internet Express Team</p>
              `,
            }),
          });
        }
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
        // Don't fail the order if email fails
      }
    }

    // Return success to ElevenLabs agent
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        message: `Order successfully placed for ${customer_name}. Order reference number is ${order.id.substring(0, 8).toUpperCase()}.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Phone order error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "I'm sorry, there was an issue processing the order. Please try again or visit businessinternetexpress.com.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

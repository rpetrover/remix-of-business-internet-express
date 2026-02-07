import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACTIVATION_FEE_PRICE_ID = "price_1SyIcgEXWZU3Xm5VTuCJKta9";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customer_name,
      contact_email,
      contact_phone,
      service_address,
      city,
      state,
      zip,
      order_data,
    } = await req.json();

    if (!contact_email || !customer_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: customer_name, contact_email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer already exists for this email
    const customers = await stripe.customers.list({ email: contact_email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build the origin URL for redirect
    const origin = req.headers.get("origin") || "https://businessinternetexpress.lovable.app";

    // Serialize order data into metadata (Stripe metadata values must be strings, max 500 chars each)
    // We'll store essential fields in metadata and the full order payload in a single JSON key
    const orderDataJson = JSON.stringify(order_data);

    // Stripe metadata has a 500-char limit per value, so we chunk if needed
    const metadataChunks: Record<string, string> = {};
    const chunkSize = 490;
    for (let i = 0; i < orderDataJson.length; i += chunkSize) {
      metadataChunks[`order_data_${Math.floor(i / chunkSize)}`] = orderDataJson.slice(i, i + chunkSize);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : contact_email,
      line_items: [
        {
          price: ACTIVATION_FEE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order-completion`,
      metadata: {
        customer_name,
        contact_email,
        contact_phone: contact_phone || "",
        service_address: (service_address || "").slice(0, 500),
        city: city || "",
        state: state || "",
        zip: zip || "",
        ...metadataChunks,
      },
      payment_intent_data: {
        description: `Business Internet Express - Account Activation Fee for ${customer_name}`,
        metadata: {
          customer_name,
          contact_email,
        },
      },
      custom_text: {
        submit: {
          message: "By completing this payment, you acknowledge that Business Internet Express is an independent internet circuit broker and that this $29.99 activation fee is for brokerage services. This fee is refundable within 24 hours of payment.",
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

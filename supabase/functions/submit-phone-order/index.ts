import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This webhook is called by the ElevenLabs AI sales agent for:
// - Order submissions (Close A)
// - Comparison requests (Close B/C) via ?action=comparison
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const body = await req.json();
    console.log(`Phone order webhook (action=${action || "order"}):`, JSON.stringify(body));

    // ========== GATEKEEPER LOG ==========
    if (action === "gatekeeper") {
      const { lead_id, gatekeeper_encountered, decision_maker_reached, decision_maker_name, decision_maker_title, callback_time, notes } = body;

      if (!lead_id) {
        return new Response(
          JSON.stringify({ success: false, error: "lead_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("outbound_leads")
        .update({
          gatekeeper_encountered: gatekeeper_encountered ?? true,
          decision_maker_reached: decision_maker_reached ?? false,
          decision_maker_name: decision_maker_name || undefined,
          decision_maker_title: decision_maker_title || undefined,
          callback_time: callback_time || undefined,
          notes: [
            decision_maker_name ? `DM: ${decision_maker_name}` : null,
            decision_maker_title ? `Title: ${decision_maker_title}` : null,
            callback_time ? `Callback: ${callback_time}` : null,
            notes,
          ].filter(Boolean).join(" | ") || undefined,
        })
        .eq("id", lead_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: decision_maker_reached
            ? "Great — you've been connected to the decision-maker. Proceed with the conversation."
            : callback_time
              ? `Got it — call back ${callback_time}. Info saved.`
              : "Gatekeeper interaction logged. Try again later.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== COMPARISON REQUEST (Close B / Close C) ==========
    if (action === "comparison") {
      const {
        lead_id, contact_email, contact_phone, sms_consent,
        service_address, city, state, zip,
        current_provider, current_monthly_total, current_speed,
        contract_end_date, primary_use_case, pain_points,
        followup_datetime, notes,
      } = body;

      if (!contact_email || !service_address || !city || !state || !zip) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: contact_email, service_address, city, state, zip" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update the lead with discovery data
      if (lead_id) {
        await supabase
          .from("outbound_leads")
          .update({
            email: contact_email,
            phone: contact_phone || undefined,
            address: service_address,
            city, state, zip,
            campaign_status: contract_end_date ? "contract_end_scheduled" : "comparison_sent",
            call_outcome: "comparison_requested",
            notes: [
              current_provider ? `Provider: ${current_provider}` : null,
              current_monthly_total ? `Bill: ${current_monthly_total}/mo` : null,
              current_speed ? `Speed: ${current_speed}` : null,
              contract_end_date ? `Contract ends: ${contract_end_date}` : null,
              primary_use_case ? `Uses: ${primary_use_case}` : null,
              pain_points ? `Pain: ${pain_points}` : null,
              followup_datetime ? `Follow-up: ${followup_datetime}` : null,
              sms_consent ? "SMS consent: YES" : null,
              notes,
            ].filter(Boolean).join(" | "),
          })
          .eq("id", lead_id);
      }

      // Send comparison email to prospect
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        try {
          // Comparison email to prospect
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Business Internet Express <service@businessinternetexpress.com>",
              to: [contact_email],
              subject: "Your Business Internet Options — Quick Comparison",
              html: `
                <h2>Hi there!</h2>
                <p>Thanks for chatting with us! As promised, here's a quick overview of the internet options we can typically place at your address.</p>
                
                <h3>Our Typical Tiers (pending address eligibility):</h3>
                <table style="border-collapse:collapse;width:100%;max-width:500px;">
                  <tr style="background:#0066cc;color:#fff;">
                    <th style="padding:10px;text-align:left;">Speed</th>
                    <th style="padding:10px;text-align:left;">Starting Around</th>
                  </tr>
                  <tr style="border-bottom:1px solid #ddd;">
                    <td style="padding:10px;">300 Mbps</td>
                    <td style="padding:10px;">$49.99/mo</td>
                  </tr>
                  <tr style="border-bottom:1px solid #ddd;background:#f9f9f9;">
                    <td style="padding:10px;">600 Mbps</td>
                    <td style="padding:10px;">$69.99/mo</td>
                  </tr>
                  <tr style="border-bottom:1px solid #ddd;">
                    <td style="padding:10px;">1 Gbps</td>
                    <td style="padding:10px;">$89.99/mo</td>
                  </tr>
                  <tr style="background:#f9f9f9;">
                    <td style="padding:10px;">2 Gbps</td>
                    <td style="padding:10px;">$149.99/mo</td>
                  </tr>
                </table>

                ${current_monthly_total ? `<p>You mentioned you're currently paying around <strong>${current_monthly_total}/mo</strong>${current_speed ? ` for ${current_speed}` : ""}${current_provider ? ` with ${current_provider}` : ""}. We'll confirm exact carrier availability and pricing at your address.</p>` : ""}

                ${contract_end_date ? `<p>📅 We noted your contract ends around <strong>${contract_end_date}</strong>. We'll reach out before then to lock in the best option and coordinate a seamless switch.</p>` : ""}

                <p><strong>What happens next?</strong></p>
                <ol>
                  <li>We verify which carriers and speeds are available at your exact address</li>
                  <li>We send you a personalized comparison with confirmed pricing</li>
                  <li>You choose — no pressure, no obligation</li>
                </ol>

                ${followup_datetime ? `<p>We'll follow up <strong>${followup_datetime}</strong> as discussed.</p>` : ""}

                <p>Questions? Call us at <a href="tel:+18882303278">1-888-230-FAST</a> or reply to this email.</p>
                <p>Best,<br>Sarah &amp; the Business Internet Express Team</p>
              `,
            }),
          });

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
              subject: `📊 Comparison Requested: ${service_address}, ${city} ${state}`,
              html: `
                <h2>Comparison Request from AI Sales Call</h2>
                <p><strong>Email:</strong> ${contact_email}</p>
                <p><strong>Phone:</strong> ${contact_phone || "Not provided"}</p>
                <p><strong>Address:</strong> ${service_address}, ${city}, ${state} ${zip}</p>
                <hr>
                <p><strong>Current Provider:</strong> ${current_provider || "Unknown"}</p>
                <p><strong>Current Bill:</strong> ${current_monthly_total || "Unknown"}/mo</p>
                <p><strong>Current Speed:</strong> ${current_speed || "Unknown"}</p>
                <p><strong>Contract End:</strong> ${contract_end_date || "None/Unknown"}</p>
                <p><strong>Primary Use:</strong> ${primary_use_case || "Not specified"}</p>
                <p><strong>Pain Points:</strong> ${pain_points || "None mentioned"}</p>
                <p><strong>SMS Consent:</strong> ${sms_consent ? "YES" : "NO"}</p>
                <p><strong>Follow-up:</strong> ${followup_datetime || "Not scheduled"}</p>
                ${lead_id ? `<p><strong>Lead ID:</strong> ${lead_id}</p>` : ""}
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
              `,
            }),
          });
        } catch (emailErr) {
          console.error("Comparison email error:", emailErr);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Comparison email sent to ${contact_email}. ${followup_datetime ? `Follow-up scheduled for ${followup_datetime}.` : "We'll follow up soon."}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== ORDER SUBMISSION (Close A) ==========
    const {
      customer_name, contact_email, contact_phone,
      service_address, city, state, zip,
      selected_plan, speed, preferred_provider, lead_id,
      current_provider, current_monthly_total, current_speed,
      contract_end_date, primary_use_case, pain_points,
      notes, installation_date, installation_date2,
    } = body;

    if (!customer_name || !service_address || !city || !state || !zip || !contact_phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields. Need: customer_name, service_address, city, state, zip, contact_phone",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build enriched notes from discovery data
    const enrichedNotes = [
      notes || "Order placed via AI sales call",
      current_provider ? `Previous provider: ${current_provider}` : null,
      current_monthly_total ? `Was paying: ${current_monthly_total}/mo` : null,
      current_speed ? `Previous speed: ${current_speed}` : null,
      contract_end_date ? `Contract end: ${contract_end_date}` : null,
      primary_use_case ? `Uses: ${primary_use_case}` : null,
      pain_points ? `Pain points: ${pain_points}` : null,
      installation_date ? `Preferred install 1: ${installation_date}` : null,
      installation_date2 ? `Preferred install 2: ${installation_date2}` : null,
    ].filter(Boolean).join(" | ");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name,
        contact_email: contact_email || "collected-by-phone@businessinternetexpress.com",
        contact_phone,
        service_address,
        city, state, zip,
        selected_plan: selected_plan || "Business Internet",
        speed: speed || "Up to 1 Gbps",
        preferred_provider: preferred_provider || current_provider || "Best Available",
        channel: "outbound_call",
        status: "pending",
        notes: enrichedNotes,
        service_type: "Business internet service only",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("Order created:", order.id);

    if (lead_id) {
      await supabase
        .from("outbound_leads")
        .update({
          campaign_status: "converted",
          converted_order_id: order.id,
          call_outcome: "sale",
        })
        .eq("id", lead_id);
    }

    // Send notification emails
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
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
              <hr>
              <p><strong>Discovery Data:</strong></p>
              <p>Previous: ${current_provider || "?"} at ${current_monthly_total || "?"}/mo (${current_speed || "?"})</p>
              <p>Contract End: ${contract_end_date || "N/A"}</p>
              <p>Uses: ${primary_use_case || "Not specified"}</p>
              <p>Pain: ${pain_points || "None mentioned"}</p>
              ${lead_id ? `<p><strong>Lead ID:</strong> ${lead_id}</p>` : ""}
            `,
          }),
        });

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
                <p>We're excited to get you connected with high-speed business internet.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                  <li><strong>Service Address:</strong> ${service_address}, ${city}, ${state} ${zip}</li>
                  <li><strong>Plan:</strong> ${selected_plan || "Business Internet"}</li>
                  <li><strong>Speed:</strong> ${speed || "Up to 1 Gbps"}</li>
                </ul>
                <p>Our team will be in touch shortly to confirm your installation window.</p>
                <p>If you have any questions, call us at <a href="tel:+18882303278">1-888-230-FAST</a> or visit 
                <a href="https://businessinternetexpress.com">businessinternetexpress.com</a>.</p>
                <p>Best regards,<br>Business Internet Express Team</p>
              `,
            }),
          });
        }
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        message: `Order successfully placed for ${customer_name}. Order reference number is ${order.id.substring(0, 6).toUpperCase()}.`,
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

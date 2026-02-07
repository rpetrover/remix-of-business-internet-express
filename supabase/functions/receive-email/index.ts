import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KNOWLEDGE_BASE_SUMMARY = `You are the AI sales and support agent for Business Internet Express — a technology advisor and authorized partner for 28+ leading internet, fiber, and connectivity providers. We help businesses find the best internet solutions at the best price. Our service is FREE to the customer. We offer broadband (25 Mbps to 5 Gbps), dedicated fiber, SD-WAN, voice/UCaaS, managed WiFi, and more. Key providers: Spectrum (300M $49.99, 1G $69.99), AT&T, Comcast, Verizon Fios, Frontier, Cox, Optimum, and enterprise providers like Lumen, Zayo, Crown Castle. Same-day/next-day install common for broadband.`;

const ADMIN_EMAIL = "rich@scotchtowntechnology.com";
const INTELISYS_DOMAIN = "scansource.com";
const FROM_ADDRESS = "Business Internet Express <service@businessinternetexpress.com>";

// ─── Webhook Signature Verification ───
async function verifyWebhookSignature(
  payload: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  try {
    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) return false;

    const timestampSeconds = parseInt(svixTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampSeconds) > 300) {
      console.error("Webhook timestamp too old or in the future");
      return false;
    }

    const secretBytes = Uint8Array.from(
      atob(secret.startsWith("whsec_") ? secret.slice(6) : secret),
      (c) => c.charCodeAt(0)
    );

    const signContent = `${svixId}.${svixTimestamp}.${payload}`;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signContent));
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const [version, sigValue] = sig.split(",");
      if (version === "v1" && sigValue === expectedSignature) return true;
    }

    return false;
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

// ─── Loop Prevention ───
const OWN_DOMAIN = "businessinternetexpress.com";
const NO_REPLY_ADDRESSES = ["noreply@", "no-reply@", "mailer-daemon@", "postmaster@", "bounce@", "notifications@"];

function shouldSkipAutoReply(fromEmail: string, subject: string): { skip: boolean; reason: string } {
  const lowerFrom = fromEmail.toLowerCase().trim();
  const lowerSubject = subject.toLowerCase();

  if (lowerFrom.endsWith(`@${OWN_DOMAIN}`)) {
    return { skip: true, reason: `Sender is from own domain: ${lowerFrom}` };
  }

  for (const addr of NO_REPLY_ADDRESSES) {
    if (lowerFrom.startsWith(addr) || lowerFrom.includes(addr)) {
      return { skip: true, reason: `Sender is a no-reply address: ${lowerFrom}` };
    }
  }

  const reCount = (subject.match(/\bRe:/gi) || []).length;
  if (reCount > 3) {
    return { skip: true, reason: `Reply loop detected: ${reCount} Re: prefixes` };
  }

  return { skip: false, reason: "" };
}

// ─── Detect Intelisys Email ───
function isIntelisysEmail(fromEmail: string): boolean {
  return fromEmail.toLowerCase().trim().endsWith(`@${INTELISYS_DOMAIN}`);
}

// ─── AI Helper ───
async function callAI(messages: any[], tools?: any[]): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const body: any = { messages, model: "openai/gpt-5-mini" };
  if (tools) body.tools = tools;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  return response.json();
}

// ─── Send & Log Email ───
async function sendEmail(
  supabase: any,
  to: string,
  toName: string | null,
  subject: string,
  htmlBody: string,
  logDirection: string = "outbound",
  aiAutoReplied: boolean = false
): Promise<string | null> {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  const emailResponse = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [to],
    subject,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 24px;">${htmlBody}</div>
      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        Business Internet Express | businessinternetexpress.com | 1-888-230-FAST
      </div>
    </div>`,
  });

  const { data: emailRecord } = await supabase.from("emails").insert({
    direction: logDirection,
    from_email: "service@businessinternetexpress.com",
    from_name: "Business Internet Express",
    to_email: to,
    to_name: toName,
    subject,
    body_html: htmlBody,
    body_text: htmlBody.replace(/<[^>]*>/g, ""),
    status: "sent",
    ai_auto_replied: aiAutoReplied,
    resend_id: emailResponse.data?.id || null,
  }).select("id").single();

  console.log(`Email sent to ${to}: ${subject}`);
  return emailRecord?.id || null;
}

// ─── Handle Intelisys Email ───
async function handleIntelisysEmail(
  supabase: any,
  emailId: string,
  fromEmail: string,
  fromName: string | null,
  emailSubject: string,
  emailContent: string
): Promise<void> {
  console.log("Processing Intelisys email:", emailSubject);

  // Step 1: Use AI to classify the request and extract order matching info
  const classifyResponse = await callAI([
    {
      role: "system",
      content: `You are an intelligent email routing agent for Business Internet Express, an authorized internet service dealer.

You received an email from Intelisys/ScanSource, our master agent who processes our orders with carriers.

Analyze the email and determine:
1. What information is being requested?
2. Is this a "customer_info" request (something only the end customer would know — e.g., preferred install date, additional contact person, site access instructions, confirm service address details) or a "dealer_info" request (something the dealer/admin should handle — e.g., pricing overrides, contract terms, commission questions, technical configurations, LOA signatures)?
3. Try to identify which order this relates to by extracting: customer name, service address, or any reference/order numbers.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "request_type": "customer_info" or "dealer_info",
  "summary": "Brief 1-2 sentence summary of what Intelisys needs",
  "customer_question": "The specific question to ask the customer, written in a friendly professional tone (only if customer_info)",
  "admin_question": "The specific question/info to present to the admin (only if dealer_info)",
  "order_hints": {
    "customer_name": "extracted customer name or null",
    "service_address": "extracted address or null",
    "reference_number": "any order/reference number or null"
  }
}`,
    },
    {
      role: "user",
      content: `From: ${fromName || fromEmail}\nSubject: ${emailSubject}\n\n${emailContent}`,
    },
  ]);

  const classifyText = classifyResponse.choices?.[0]?.message?.content || "";
  let classification;
  try {
    // Strip markdown code fences if present
    const cleaned = classifyText.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    classification = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI classification:", classifyText);
    // Default to dealer_info and forward to admin
    classification = {
      request_type: "dealer_info",
      summary: "Intelisys sent a request that needs admin review.",
      admin_question: `Intelisys sent the following email that needs your attention:\n\nSubject: ${emailSubject}\n\n${emailContent}`,
      order_hints: {},
    };
  }

  console.log("Classification:", JSON.stringify(classification));

  // Step 2: Try to match to an existing order
  let matchedOrder: any = null;
  const hints = classification.order_hints || {};

  if (hints.customer_name) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .ilike("customer_name", `%${hints.customer_name}%`)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data?.length) matchedOrder = data[0];
  }

  if (!matchedOrder && hints.service_address) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .ilike("service_address", `%${hints.service_address}%`)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data?.length) matchedOrder = data[0];
  }

  if (!matchedOrder && hints.reference_number) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .or(`id.eq.${hints.reference_number}`)
      .limit(1);
    if (data?.length) matchedOrder = data[0];
  }

  const customerEmail = matchedOrder?.contact_email || null;
  const customerName = matchedOrder?.customer_name || "Customer";

  // Step 3: Create thread record
  const threadData: any = {
    order_id: matchedOrder?.id || null,
    intelisys_email_id: emailId,
    request_type: classification.request_type,
    request_summary: classification.summary,
    customer_email: customerEmail,
    admin_email: ADMIN_EMAIL,
    intelisys_from_email: fromEmail,
  };

  if (classification.request_type === "customer_info" && customerEmail) {
    // Route to customer
    threadData.status = "pending_customer";

    const customerSubject = matchedOrder
      ? `Information Needed — Your Business Internet Order`
      : `Follow-Up on Your Business Internet Service`;

    const customerBody = `
      <p>Hi ${customerName.split(" ")[0]},</p>
      <p>We're processing your business internet service order and our provider partner needs a bit more information to move forward.</p>
      <p><strong>${classification.customer_question || classification.summary}</strong></p>
      <p>Please reply to this email with the requested information and we'll get everything taken care of right away.</p>
      ${matchedOrder ? `<p style="color: #666; font-size: 13px;">Order Reference: ${matchedOrder.id.slice(0, 8).toUpperCase()}</p>` : ""}
      <p>Thank you for choosing Business Internet Express!<br/>
      <em>Your dedicated business connectivity team</em></p>
    `;

    const outboundId = await sendEmail(supabase, customerEmail, customerName, customerSubject, customerBody, "outbound", true);
    threadData.outbound_email_id = outboundId;

    console.log(`Intelisys request routed to customer: ${customerEmail}`);
  } else if (classification.request_type === "customer_info" && !customerEmail) {
    // Can't find customer — route to admin instead
    threadData.status = "pending_admin";
    threadData.request_type = "dealer_info"; // Escalate

    const adminBody = `
      <p>Hi,</p>
      <p><strong>Intelisys Information Request — Customer Not Found</strong></p>
      <p>Intelisys sent a request that appears to be for a customer, but we couldn't match it to an existing order.</p>
      <hr style="border: none; border-top: 1px solid #ddd;"/>
      <p><strong>Intelisys Request:</strong></p>
      <p>${classification.summary}</p>
      <hr style="border: none; border-top: 1px solid #ddd;"/>
      <p><strong>Original Email Subject:</strong> ${emailSubject}</p>
      <p><strong>From:</strong> ${fromEmail}</p>
      <div style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin-top: 8px;">
        ${emailContent.replace(/\n/g, "<br/>")}
      </div>
      <p style="margin-top: 16px;">Please reply with the information needed and we'll forward it to Intelisys.</p>
    `;

    const outboundId = await sendEmail(supabase, ADMIN_EMAIL, "Admin", `[Action Required] Intelisys Request — ${emailSubject}`, adminBody, "outbound", true);
    threadData.outbound_email_id = outboundId;

    console.log("Intelisys request escalated to admin (customer not found)");
  } else {
    // Dealer/admin question
    threadData.status = "pending_admin";

    const adminBody = `
      <p>Hi,</p>
      <p><strong>Intelisys Dealer Request</strong></p>
      ${matchedOrder ? `<p><strong>Order:</strong> ${matchedOrder.customer_name} — ${matchedOrder.service_address}, ${matchedOrder.city}, ${matchedOrder.state} ${matchedOrder.zip}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #ddd;"/>
      <p><strong>What they need:</strong></p>
      <p>${classification.admin_question || classification.summary}</p>
      <hr style="border: none; border-top: 1px solid #ddd;"/>
      <p><strong>Original Email Subject:</strong> ${emailSubject}</p>
      <p><strong>From:</strong> ${fromEmail}</p>
      <div style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin-top: 8px;">
        ${emailContent.replace(/\n/g, "<br/>")}
      </div>
      <p style="margin-top: 16px;">Please reply with the requested information and we'll draft a response to Intelisys for your review.</p>
    `;

    const outboundId = await sendEmail(supabase, ADMIN_EMAIL, "Admin", `[Intelisys Request] ${emailSubject}`, adminBody, "outbound", true);
    threadData.outbound_email_id = outboundId;

    console.log("Intelisys request routed to admin");
  }

  // Save thread
  const { error: threadError } = await supabase.from("intelisys_threads").insert(threadData);
  if (threadError) {
    console.error("Error creating intelisys thread:", threadError);
  }

  // Mark original Intelisys email as processed
  await supabase.from("emails").update({ status: "processed" }).eq("id", emailId);
}

// ─── Handle Reply to a Pending Thread ───
async function handleThreadReply(
  supabase: any,
  thread: any,
  emailId: string,
  fromEmail: string,
  fromName: string | null,
  emailSubject: string,
  replyContent: string
): Promise<void> {
  console.log(`Processing thread reply from ${fromEmail} for thread ${thread.id}`);

  // Fetch the original Intelisys email content for context
  let intelisysEmailContent = "";
  if (thread.intelisys_email_id) {
    const { data: intelisysEmail } = await supabase
      .from("emails")
      .select("subject, body_text, body_html")
      .eq("id", thread.intelisys_email_id)
      .single();
    if (intelisysEmail) {
      intelisysEmailContent = intelisysEmail.body_text || intelisysEmail.body_html || "";
    }
  }

  // Fetch the matched order for context
  let orderContext = "";
  if (thread.order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", thread.order_id)
      .single();
    if (order) {
      orderContext = `\nOrder Details: ${order.customer_name}, ${order.service_address}, ${order.city}, ${order.state} ${order.zip}. Service: ${order.service_type}. Provider: ${order.preferred_provider || "TBD"}. Phone: ${order.contact_phone}. Email: ${order.contact_email}.`;
    }
  }

  // Use AI to draft a reply to Intelisys
  const draftResponse = await callAI([
    {
      role: "system",
      content: `You are a professional business internet service dealer agent. You need to draft a reply to Intelisys (our master agent at ScanSource) with information they requested about an order.

Context:
- Intelisys originally asked: ${thread.request_summary}
- The ${thread.request_type === "customer_info" ? "customer" : "admin/dealer"} has now provided their response.${orderContext}

Draft a professional, concise email reply to Intelisys that:
1. References the original request
2. Provides the information they asked for based on the reply received
3. Uses a professional business tone
4. Is ready to send (no placeholders)

Write ONLY the email body text, no subject line.`,
    },
    {
      role: "user",
      content: `Original Intelisys request:\n${intelisysEmailContent}\n\n---\n\nReply received from ${thread.request_type === "customer_info" ? "customer" : "admin"}:\nFrom: ${fromName || fromEmail}\nSubject: ${emailSubject}\n\n${replyContent}`,
    },
  ]);

  const draftText = draftResponse.choices?.[0]?.message?.content || "";

  if (!draftText) {
    console.error("AI failed to generate Intelisys reply draft");
    return;
  }

  // Save the draft as an email record for admin review
  const intelisysTo = thread.intelisys_from_email || `intelisys_orders@${INTELISYS_DOMAIN}`;
  const draftSubject = `Re: ${emailSubject.replace(/^(Re:\s*)+/i, "")}`;

  const { data: draftEmail } = await supabase.from("emails").insert({
    direction: "outbound",
    from_email: "service@businessinternetexpress.com",
    from_name: "Business Internet Express",
    to_email: intelisysTo,
    to_name: "Intelisys Orders",
    subject: draftSubject,
    body_html: draftText.replace(/\n/g, "<br/>"),
    body_text: draftText,
    status: "draft",
    ai_draft: draftText,
    ai_auto_replied: false,
  }).select("id").single();

  // Update thread
  await supabase
    .from("intelisys_threads")
    .update({
      status: "draft_ready",
      reply_email_id: emailId,
      intelisys_reply_draft: draftText,
    })
    .eq("id", thread.id);

  // Notify admin that a draft reply to Intelisys is ready for review
  const notifyBody = `
    <p>Hi,</p>
    <p><strong>Intelisys Reply Draft Ready for Review</strong></p>
    <p>A reply to Intelisys has been drafted based on the ${thread.request_type === "customer_info" ? "customer's" : "your"} response. Please review it in the admin email inbox and send when ready.</p>
    <hr style="border: none; border-top: 1px solid #ddd;"/>
    <p><strong>Draft reply to:</strong> ${intelisysTo}</p>
    <p><strong>Subject:</strong> ${draftSubject}</p>
    <div style="background: #f0f7ff; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 12px 0;">
      ${draftText.replace(/\n/g, "<br/>")}
    </div>
    <p>Log in to the admin panel to review, edit, and send this reply.</p>
  `;

  await sendEmail(supabase, ADMIN_EMAIL, "Admin", `[Draft Ready] Reply to Intelisys — ${draftSubject}`, notifyBody, "outbound", true);

  console.log(`Intelisys reply draft ready for thread ${thread.id}`);
}

// ─── Send & Log Auto-Reply (existing flow) ───
async function sendAndLogReply(
  supabase: any,
  fromEmail: string,
  fromName: string | null,
  emailSubject: string,
  aiReply: string,
  emailId: string,
  mode: string
) {
  if (mode === "auto") {
    await sendEmail(supabase, fromEmail, fromName, `Re: ${emailSubject}`, aiReply.replace(/\n/g, "<br/>"), "outbound", true);

    await supabase.from("emails").update({
      status: "replied",
      ai_auto_replied: true,
    }).eq("id", emailId);

    console.log("AI auto-reply sent to:", fromEmail);
  } else {
    await supabase.from("emails").update({
      ai_draft: aiReply,
    }).eq("id", emailId);

    console.log("AI draft saved for email:", emailId);
  }
}

// ─── Handle Bounce/Delivery Events ───
async function handleBounceEvent(
  supabase: any,
  eventType: string,
  eventData: any
): Promise<Response> {
  const toEmail = eventData.to?.[0] || eventData.email || "";
  const resendId = eventData.email_id || eventData.id || "";
  const reason = eventData.bounce?.message || eventData.reason || eventData.response || "Unknown reason";
  const subject = eventData.subject || "";

  console.log(`Bounce/delivery event: ${eventType} for ${toEmail}, reason: ${reason}`);

  // Update the email record status if we have a resend_id
  if (resendId) {
    await supabase
      .from("emails")
      .update({ status: eventType === "email.bounced" ? "bounced" : "failed" })
      .eq("resend_id", resendId);
  }

  // Check if this was an Intelisys email
  const isIntelisysBounce = toEmail.toLowerCase().includes(INTELISYS_DOMAIN);

  if (isIntelisysBounce) {
    // Try to find the matching order
    let orderContext = "";
    if (resendId) {
      const { data: bouncedEmail } = await supabase
        .from("emails")
        .select("subject, body_text")
        .eq("resend_id", resendId)
        .single();

      if (bouncedEmail) {
        // Try to match order by looking at recent orders
        const { data: recentOrders } = await supabase
          .from("orders")
          .select("id, customer_name, service_address, city, state, zip, contact_email, contact_phone, selected_plan, speed, monthly_price")
          .eq("intelisys_email_sent", true)
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentOrders?.length) {
          orderContext = `<h3 style="margin-top: 16px;">Recent Orders (match manually):</h3><table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #f1f5f9;"><th style="padding: 6px 8px; text-align: left;">Customer</th><th style="padding: 6px 8px; text-align: left;">Address</th><th style="padding: 6px 8px; text-align: left;">Plan</th></tr>
            ${recentOrders.map((o: any) => `<tr><td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${o.customer_name}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${o.service_address}, ${o.city}, ${o.state} ${o.zip}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${o.selected_plan || o.speed || "N/A"}</td></tr>`).join("")}
          </table>`;
        }
      }
    }

    // Alert admin
    const alertBody = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <h2 style="color: #dc2626; margin: 0 0 8px;">⚠️ Intelisys Email Bounced</h2>
        <p style="color: #991b1b; margin: 0;">An order email to Intelisys was rejected and NOT delivered.</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr><td style="padding: 6px 0; color: #6b7280; width: 30%;"><strong>To:</strong></td><td style="padding: 6px 0;">${toEmail}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Subject:</strong></td><td style="padding: 6px 0;">${subject}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Event:</strong></td><td style="padding: 6px 0;">${eventType}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Reason:</strong></td><td style="padding: 6px 0; color: #dc2626;">${reason}</td></tr>
      </table>
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
        <h3 style="color: #92400e; margin: 0 0 8px;">🔧 Action Required</h3>
        <ol style="color: #78350f; margin: 0; padding-left: 20px;">
          <li>Find the order in the admin panel under <strong>Orders</strong> tab</li>
          <li>Manually forward the order details to <strong>intelisys_orders@scansource.com</strong> from your email client</li>
          <li>Contact Intelisys/ScanSource to whitelist <strong>businessinternetexpress.com</strong> in Mimecast</li>
          <li>Update DNS: set DMARC to <code>p=quarantine</code> with strict alignment</li>
        </ol>
      </div>
      ${orderContext}
    `;

    await sendEmail(
      supabase,
      ADMIN_EMAIL,
      "Admin",
      `🚨 BOUNCE ALERT: Intelisys order email failed — ${subject || "Action Required"}`,
      alertBody,
      "outbound",
      true
    );

    console.log("Admin notified of Intelisys bounce");
  }

  return new Response(JSON.stringify({ success: true, handler: "bounce", event: eventType }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

// ─── Main Handler ───
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    // Verify webhook signature
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (webhookSecret) {
      const isValid = await verifyWebhookSignature(rawBody, req.headers, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      console.warn("RESEND_WEBHOOK_SECRET not configured");
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook event received:", JSON.stringify(payload).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ═══ Handle Resend delivery/bounce events ═══
    const eventType = payload.type || "";
    if (["email.bounced", "email.delivery_delayed", "email.complained"].includes(eventType)) {
      return await handleBounceEvent(supabase, eventType, payload.data || payload);
    }

    // If this is a delivery success event, just acknowledge
    if (["email.delivered", "email.sent", "email.opened", "email.clicked"].includes(eventType)) {
      console.log(`Delivery event: ${eventType}`);
      // Optionally update email status to 'delivered'
      if (eventType === "email.delivered" && (payload.data?.email_id || payload.email_id)) {
        const deliveredResendId = payload.data?.email_id || payload.email_id;
        await supabase
          .from("emails")
          .update({ status: "delivered" })
          .eq("resend_id", deliveredResendId)
          .eq("status", "sent"); // Only update if still "sent"
      }
      return new Response(JSON.stringify({ success: true, handler: "delivery_event", event: eventType }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ═══ Inbound email processing ═══
    // Extract email data
    const fromEmail = payload.from || payload.data?.from || "";
    const fromName = payload.from_name || payload.data?.from_name || null;
    const toEmail = payload.to || payload.data?.to || "service@businessinternetexpress.com";
    const emailSubject = payload.subject || payload.data?.subject || "(No subject)";
    const bodyHtml = payload.html || payload.data?.html || null;
    const bodyText = payload.text || payload.data?.text || null;

    if (!fromEmail || typeof fromEmail !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid payload: missing from email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Loop prevention
    const loopCheck = shouldSkipAutoReply(fromEmail, emailSubject);
    if (loopCheck.skip) {
      console.log(`Skipping email (loop prevention): ${loopCheck.reason}`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: loopCheck.reason }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Store the inbound email
    const { data: emailData, error: insertError } = await supabase.from("emails").insert({
      direction: "inbound",
      from_email: fromEmail.slice(0, 320),
      from_name: fromName ? String(fromName).slice(0, 200) : null,
      to_email: typeof toEmail === "string" ? toEmail.slice(0, 320) : "service@businessinternetexpress.com",
      subject: typeof emailSubject === "string" ? emailSubject.slice(0, 500) : "(No subject)",
      body_html: bodyHtml ? String(bodyHtml).slice(0, 100000) : null,
      body_text: bodyText ? String(bodyText).slice(0, 100000) : null,
      status: "received",
    }).select().single();

    if (insertError) {
      console.error("Error storing inbound email:", insertError);
      throw insertError;
    }

    const emailContent = bodyText || bodyHtml || "";

    // ═══ PRIORITY 1: Intelisys Email ═══
    if (isIntelisysEmail(fromEmail)) {
      try {
        await handleIntelisysEmail(supabase, emailData.id, fromEmail, fromName, emailSubject, emailContent);
      } catch (err) {
        console.error("Error handling Intelisys email:", err);
        // Forward to admin as fallback
        await sendEmail(
          supabase,
          ADMIN_EMAIL,
          "Admin",
          `[Intelisys — Needs Attention] ${emailSubject}`,
          `<p>An email from Intelisys could not be automatically processed. Please review:</p>
           <p><strong>From:</strong> ${fromEmail}</p>
           <p><strong>Subject:</strong> ${emailSubject}</p>
           <div style="background: #f9f9f9; padding: 12px; border-radius: 4px;">${emailContent.replace(/\n/g, "<br/>")}</div>`,
          "outbound",
          true
        );
      }
      return new Response(JSON.stringify({ success: true, handler: "intelisys" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ═══ PRIORITY 2: Reply to a Pending Intelisys Thread ═══
    const senderLower = fromEmail.toLowerCase().trim();
    const { data: pendingThreads } = await supabase
      .from("intelisys_threads")
      .select("*")
      .in("status", ["pending_customer", "pending_admin"])
      .or(`customer_email.eq.${senderLower},admin_email.eq.${senderLower}`)
      .order("created_at", { ascending: false });

    if (pendingThreads && pendingThreads.length > 0) {
      // Find the most relevant thread for this sender
      const thread = pendingThreads.find((t: any) => {
        if (t.status === "pending_customer" && t.customer_email?.toLowerCase() === senderLower) return true;
        if (t.status === "pending_admin" && t.admin_email?.toLowerCase() === senderLower) return true;
        return false;
      });

      if (thread) {
        try {
          await handleThreadReply(supabase, thread, emailData.id, fromEmail, fromName, emailSubject, emailContent);
        } catch (err) {
          console.error("Error handling thread reply:", err);
        }
        return new Response(JSON.stringify({ success: true, handler: "thread_reply", thread_id: thread.id }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // ═══ PRIORITY 3: Normal AI Auto-Reply Flow ═══
    // Rate limit check
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentReplies } = await supabase
      .from("emails")
      .select("id")
      .eq("direction", "outbound")
      .eq("to_email", fromEmail)
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    if (recentReplies && recentReplies.length > 0) {
      console.log(`Rate limited: already replied to ${fromEmail} in the last 5 minutes`);
      return new Response(JSON.stringify({ success: true, stored: true, auto_reply_skipped: "rate_limited" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check AI config
    const { data: aiConfig } = await supabase
      .from("email_ai_config")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (aiConfig && emailData) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

      if (LOVABLE_API_KEY) {
        let trainingContext = "";
        const examples = (aiConfig.training_examples as any[]) || [];
        if (examples.length > 0) {
          trainingContext = "\n\nHere are examples of how to respond:\n" +
            examples.map((ex: any, i: number) =>
              `Example ${i + 1}:\nInbound: ${ex.inbound}\nResponse: ${ex.response}`
            ).join("\n\n");
        }

        const aiResponse = await callAI(
          [
            {
              role: "system",
              content: `${aiConfig.system_prompt}\n\n${KNOWLEDGE_BASE_SUMMARY}${trainingContext}\n\nYou are responding to emails for Business Internet Express. Our phone number is 1-888-230-FAST (1-888-230-3278). Be professional, helpful, and knowledgeable about our services and providers. If the email is asking about internet service for a specific address, help them and offer to check availability. If they want to proceed with an order and provide their details (name, address, phone, email, provider preference), use the submit_order tool to process it. Always respond warmly and include relevant pricing/speed info from our provider portfolio. When mentioning our phone number, always use 1-888-230-FAST.`,
            },
            {
              role: "user",
              content: `From: ${fromName || fromEmail}\nSubject: ${emailSubject}\n\n${emailContent}`,
            },
          ],
          [
            {
              type: "function",
              function: {
                name: "submit_order",
                description: "Submit an internet service order when the email contains enough information: customer name, address, phone, email, and service preferences.",
                parameters: {
                  type: "object",
                  properties: {
                    customer_name: { type: "string" },
                    service_address: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zip: { type: "string" },
                    contact_phone: { type: "string" },
                    contact_email: { type: "string" },
                    preferred_provider: { type: "string" },
                    selected_plan: { type: "string" },
                    speed: { type: "string" },
                    service_type: { type: "string" },
                    notes: { type: "string" },
                  },
                  required: ["customer_name", "service_address", "city", "state", "zip", "contact_phone", "contact_email"],
                  additionalProperties: false,
                },
              },
            },
          ]
        );

        const choice = aiResponse.choices?.[0];
        let orderSubmitted = false;

        if (choice?.message?.tool_calls?.length > 0) {
          const toolCall = choice.message.tool_calls[0];
          if (toolCall.function?.name === "submit_order") {
            let orderArgs;
            try {
              orderArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              orderArgs = toolCall.function.arguments;
            }

            console.log("Email order detected, submitting:", JSON.stringify(orderArgs));

            const orderResponse = await fetch(`${supabaseUrl}/functions/v1/submit-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...orderArgs, channel: "email" }),
            });

            const orderResult = await orderResponse.json();
            orderSubmitted = orderResult?.success === true;
            console.log("Email order result:", JSON.stringify(orderResult));

            const followUpData = await callAI([
              {
                role: "system",
                content: `${aiConfig.system_prompt}\n\n${KNOWLEDGE_BASE_SUMMARY}${trainingContext}\n\nYou just submitted an order for a customer. Write a warm, professional confirmation email reply.`,
              },
              {
                role: "user",
                content: `From: ${fromName || fromEmail}\nSubject: ${emailSubject}\n\n${emailContent}`,
              },
              choice.message,
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: orderSubmitted
                  ? `Order submitted successfully! Order ID: ${orderResult.order_id}`
                  : `Order submission failed: ${orderResult.error}`,
              },
            ]);

            const aiReply = followUpData.choices?.[0]?.message?.content;
            if (aiReply) {
              await sendAndLogReply(supabase, fromEmail, fromName, emailSubject, aiReply, emailData.id, aiConfig.mode);
            }
          }
        }

        if (!orderSubmitted) {
          const aiReply = choice?.message?.content;
          if (aiReply) {
            await sendAndLogReply(supabase, fromEmail, fromName, emailSubject, aiReply, emailData.id, aiConfig.mode);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing inbound email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

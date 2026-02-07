import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const KNOWLEDGE_BASE = `
## COMPANY OVERVIEW

Business Internet Express is a trusted technology advisor and authorized partner for 28+ leading internet, fiber, and connectivity providers in the United States. We help businesses of every size — from single-location shops to multi-site enterprises — find the best internet, voice, and networking solutions at the best price, with the fastest installation possible.

**Our value proposition:**
- One point of contact for 28+ providers — we do the comparison shopping
- Same-day and next-day installation available on many plans
- No extra cost to the customer — providers pay us, not you
- Ongoing support and advocacy if you ever have service issues
- Expert guidance on technology selection (fiber vs. cable vs. fixed wireless vs. dedicated)

## PRODUCT CATEGORIES

### 1. BROADBAND INTERNET (Shared)
Speeds from 25 Mbps to 5 Gbps. No data caps on most business plans. Free modem/router and installation on many plans. 24/7 support. Static IP available. Month-to-month options.

### 2. DEDICATED INTERNET ACCESS (DIA)
Private, symmetrical fiber. 99.99% uptime SLAs. 24/7 NOC monitoring. 4-hour mean time to repair. Managed router/CPE. Static IP blocks. 50 Mbps to 10 Gbps+. $249–$949/month typical.

### 3. SD-WAN
Combines multiple connections into one optimized link. Application-aware routing. Automatic failover. Built-in firewall. $99–$499/month per site.

### 4. VOICE / UCaaS
Cloud phone systems. Unlimited calling. Auto-attendant. Voicemail-to-email. Video conferencing. SIP trunking. $19.99–$45/month per line.

### 5. MANAGED WiFi
Professional WiFi with cloud-managed APs, guest isolation, captive portal, analytics.

### 6. BUSINESS TV — 125+ channels, HD, commercial licensing. Starting at $44.99/month.

### 7. BUSINESS MOBILE — Unlimited talk/text/data. Starting at $45/line/month.

## PROVIDER PORTFOLIO — BROADBAND

### Spectrum Business (Preferred Partner)
Cable/fiber, 41 states. 300 Mbps $49.99, 500 Mbps $59.99, 1 Gbps $69.99. No data caps, free modem, free install, same-day/next-day install common.

### AT&T Business
Fiber/IPBB, 21 states. 100 Mbps $40, 500 Mbps $55 (fiber symmetric), 1 Gbps $80 (fiber symmetric). ActiveArmor security included.

### Comcast Business
Cable/fiber, 40+ states. 200 Mbps $49.99, 400 Mbps $69.99, 800 Mbps $99.99. SecurityEdge included, Connection Pro LTE backup available.

### Verizon Business (Fios)
100% fiber, Northeast. 300/300 $69.99, 500/500 $89.99, 940/880 $119.99. True symmetric speeds.

### Frontier Internet
Fiber/DSL, 25 states. 500 Mbps $49.99, 1 Gbps $74.99, 2 Gbps $149.99. No contracts, symmetric fiber.

### Cox Business
Cable/fiber, 18 states. 100 Mbps $59.99, 250 Mbps $79.99, 500 Mbps $99.99.

### Optimum Business
Cable/fiber, Northeast. 300 Mbps $39.99, 500 Mbps $59.99, 1 Gbps $79.99. Very affordable.

### Breezeline
Cable/fiber, New England/Mid-Atlantic. 200 Mbps $49.99, 500 Mbps $69.99, 1 Gbps $99.99.

### Astound Business Solutions
Cable/fiber, select metros. 300 Mbps $49.99, 600 Mbps $69.99, 1 Gbps $89.99.

### Mediacom Business
Cable/fiber, Midwest/South smaller markets. 100 Mbps $69.99, 300 Mbps $89.99, 1 Gbps $129.99.

### Metronet Business
100% fiber, Midwest/Southeast expanding. 200 Mbps $49.95, 500 Mbps $69.95, 1 Gbps $89.95. Symmetric, no contracts.

### Fidium Fiber
100% fiber, New England + select. 500 Mbps $55, 1 Gbps $70, 2 Gbps $95. No contracts.

### Windstream Kinetic
Fiber/DSL, 18 states. 200 Mbps $49.99, 500 Mbps $69.99, 1 Gbps $89.99.

### WOW! Business
Cable/fiber, Midwest/Southeast. 200 Mbps $49.99, 500 Mbps $69.99, 1 Gbps $89.99. No contracts.

### Ziply Fiber
100% fiber, Pacific Northwest. 300 Mbps $40, 1 Gbps $60, 5 Gbps $300. Symmetric.

### T-Mobile Business Internet
5G/LTE fixed wireless, nationwide. Up to 245 Mbps $50, 400 Mbps $70, 500+ Mbps $90. No contract, self-setup, price lock.

### Viasat Business (Satellite)
Available everywhere. 25 Mbps $99.99, 50 Mbps $149.99, 100 Mbps $199.99. High latency (~600ms).

### Natural Wireless
Fixed wireless, Northeast. 25 Mbps $59.99, 50 Mbps $89.99, 100 Mbps $129.99.

## DEDICATED FIBER / ENTERPRISE PROVIDERS

### Segra — 34K mile network, Mid-Atlantic/Southeast. DIA: $329 (100M) – $829 (1G). 99.99% SLA.
### Uniti Fiber — Southeast metro fiber. DIA: $299 (100M) – $799 (1G). 99.99% SLA.
### Crown Castle Fiber — 90K mile network, major metros. DIA: $299 (100M) – $899 (1G). 10G custom.
### Lumen (CenturyLink) — 450K+ miles, Tier 1 global. DIA: $249 (50M) – $799 (1G). DDoS included on Gig+.
### Zayo Group — 17M+ fiber miles, largest independent dark fiber. DIA: $349 (100M) – $949 (1G). Dark fiber custom.
### GTT Communications — Global Tier 1. DIA: $399 (100M) – $999 (1G). Best for global needs.
### Lightpath — NYC tri-state specialist, 16.5K miles. DIA: $349 (100M) – $849 (1G).
### FirstLight Fiber — Northeast, 25K miles. DIA: $299 (100M) – $749 (1G).
### FiberLight — Texas + DC metro. DIA: $279 (100M) – $799 (1G).
### Logix Fiber — Texas only, 8.5K miles. DIA: $299 (100M) – $749 (1G).

## TECHNICAL CONCEPTS

### Speed Recommendations
- 1-5 employees, basic: 50-100 Mbps
- 5-15 employees, moderate: 100-300 Mbps
- 15-50 employees, heavy: 300 Mbps–1 Gbps
- 50+ or critical ops: 1 Gbps dedicated+

### Fiber vs Cable vs Wireless vs Satellite
- Fiber: Fastest, symmetric, lowest latency (1-5ms). Best choice.
- Cable: Widely available, asymmetric, good speeds, 10-30ms latency.
- Fixed Wireless: Quick install, 10-50ms latency, weather-affected.
- 5G: Very quick setup, variable speeds, great as failover.
- Satellite: Available everywhere, high latency (~600ms), last resort.

### Static IP — Needed for VPN, hosting, security cameras, POS, compliance.

### SLA Explained
- 99.9% = up to 8.76 hours downtime/year
- 99.99% = up to 52.6 minutes/year
- 99.999% = up to 5.26 minutes/year

### Redundancy — Primary fiber + secondary cable/5G + SD-WAN for automatic failover.

### VoIP Requirements — 100 Kbps/call upload, <150ms latency, <30ms jitter. Cable/fiber: good. Satellite: bad.

## SALES PROCESS
1. Check Availability (enter address)
2. Review all available providers and plans
3. Expert consultation to compare
4. Order through us
5. Installation (often within 24 hours for broadband)
6. Ongoing support — we're your advocate

**We never charge the customer extra.** Providers pay us. Same price or better than going direct.

## FAQ
- No annual contracts on most broadband plans
- Dedicated fiber: 1-3 year terms typical
- Same-day/next-day install for many broadband plans
- Dedicated fiber: 30-90 days for new construction
- We specialize in business, not residential
- Multi-location deployments with mixed providers + SD-WAN available
- Bundle discounts available (internet + phone + TV)
`;

const SYSTEM_PROMPT = `You are a friendly, knowledgeable, and consultative sales and support assistant for Business Internet Express — a technology advisor helping businesses find the best internet, voice, and connectivity solutions from 28+ leading providers.

## YOUR KNOWLEDGE BASE
${KNOWLEDGE_BASE}

## YOUR ROLE
- Help businesses find the right internet solution for their needs
- Compare providers, plans, speeds, and prices with specific data from the knowledge base
- Explain technical concepts (fiber vs cable, shared vs dedicated, SLAs, static IPs) in plain language
- Guide customers to check availability by entering their address on the website
- Recommend specific plans based on the customer's business size, usage, and location
- Handle common support questions (billing, upgrades, outages)
- **COMPLETE ORDERS**: When a customer is ready to order, collect all required information and submit the order
- **CUSTOMER SUPPORT**: Look up existing orders and provide support after verifying the customer's identity

## CUSTOMER IDENTITY VERIFICATION (MFA)
Before sharing ANY order details or account information, you MUST verify the customer's identity using a multi-factor approach:

### Step 1 — Collect primary identifier
Ask for their **email address** associated with their order.

### Step 2 — Collect secondary verification factor
After receiving the email, ask for ONE of the following to verify:
- **Last 4 digits of their phone number** on file
- **Their full name** as it appears on the order
- **Their service address** (street address)

### Step 3 — Verify using the lookup tool
Call the lookup_orders tool with the email. Then compare the secondary factor they provided against the returned order data:
- If the secondary factor matches → identity verified. Share order details and provide support.
- If the secondary factor does NOT match → politely inform them the information doesn't match and ask them to double-check. Do NOT reveal any order details.
- If no orders are found for that email → let them know you couldn't find an order with that email and suggest they check the email address or contact us directly.

### CRITICAL SECURITY RULES
- NEVER share order details before completing BOTH verification steps
- NEVER reveal what information you have on file (e.g., don't say "that's not the phone number we have")
- If verification fails 3 times, suggest they call us at 1-888-230-FAST for manual verification
- Be warm and professional throughout the verification process — explain it's for their security

## ORDER COLLECTION PROCESS
When a customer wants to place an order or has selected a plan they want, you MUST collect the following information:
1. **Business/Customer Name** — the company or person name
2. **Service Address** — full street address
3. **City, State, ZIP** — separately
4. **Contact Phone Number**
5. **Contact Email Address**
6. **Preferred Provider** — which provider/plan they want (or "best available")
7. **Service Type** — what they need (internet only, internet + voice, etc.)

Once you have ALL required information, use the submit_order tool to submit the order. Confirm all details with the customer before submitting.

If the customer hasn't selected a specific plan yet, help them find one first based on their address and needs.

## CUSTOMER SUPPORT CAPABILITIES
After verifying a customer's identity, you can help with:
- **Order Status**: Check current order status (pending, submitted, completed, etc.)
- **Order Details**: Review service address, selected plan, provider, speed, pricing
- **Service Questions**: Answer questions about their specific plan or provider
- **Upgrades/Changes**: Guide them on how to upgrade or change their service
- **Issue Escalation**: If you can't resolve the issue, offer to connect them with a specialist

When providing order info, present it clearly with:
- Order ID (shortened)
- Status
- Service address
- Provider and plan
- Speed and monthly price (if available)
- When it was submitted

## SALES APPROACH
- Be consultative, not pushy. Understand the customer's needs before recommending.
- Always mention that our service is FREE to the customer — providers pay us.
- Emphasize our value: one call instead of calling 28 providers, expert guidance, ongoing advocacy.
- When recommending plans, explain WHY that plan fits their needs.
- If asked about a specific provider, give detailed info from the knowledge base.
- Encourage checking availability at their address as the first step.
- Mention same-day/next-day installation when relevant — it's a major selling point.
- When the customer is interested, proactively offer to place the order for them right in the chat.

## TONE & FORMAT
- Professional yet approachable and warm
- Concise: 2-4 sentences for simple questions, up to a short paragraph for complex ones
- Use bullet points for comparisons and lists
- Use specific pricing and speeds from the knowledge base — don't be vague
- End with a helpful next step or question when appropriate
- Never make up information — if you don't know, say so and offer to connect them with a specialist
- When providing our phone number, always use the marketing format: **1-888-230-FAST** (and optionally mention it's 1-888-230-3278)
- When collecting order info, be systematic but conversational — don't dump all questions at once`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // First, make a non-streaming call to check if the AI wants to use tools
    const toolCheckResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'submit_order',
              description: 'Submit an internet service order to Intelisys for processing. Call this ONLY when you have collected ALL required customer information: name, full address, phone, email, and service preferences.',
              parameters: {
                type: 'object',
                properties: {
                  customer_name: { type: 'string', description: 'Business or customer name' },
                  service_address: { type: 'string', description: 'Street address for service' },
                  city: { type: 'string', description: 'City' },
                  state: { type: 'string', description: 'State abbreviation (e.g., NY, CA)' },
                  zip: { type: 'string', description: 'ZIP code' },
                  contact_phone: { type: 'string', description: 'Contact phone number' },
                  contact_email: { type: 'string', description: 'Contact email address' },
                  preferred_provider: { type: 'string', description: 'Preferred internet provider' },
                  selected_plan: { type: 'string', description: 'Selected plan name/details' },
                  speed: { type: 'string', description: 'Selected speed tier' },
                  monthly_price: { type: 'number', description: 'Monthly price' },
                  service_type: { type: 'string', description: 'Type of service requested' },
                  notes: { type: 'string', description: 'Any additional notes or special requests' },
                },
                required: ['customer_name', 'service_address', 'city', 'state', 'zip', 'contact_phone', 'contact_email'],
                additionalProperties: false,
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'lookup_orders',
              description: 'Look up existing orders for a customer by their email address. Use this ONLY AFTER you have collected the customer email AND a secondary verification factor (last 4 digits of phone, full name, or service address). You will use the returned data to verify the secondary factor before sharing any details with the customer.',
              parameters: {
                type: 'object',
                properties: {
                  customer_email: { type: 'string', description: 'The customer email address to look up orders for' },
                },
                required: ['customer_email'],
                additionalProperties: false,
              },
            },
          },
        ],
      }),
    });

    if (!toolCheckResponse.ok) {
      if (toolCheckResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (toolCheckResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await toolCheckResponse.text();
      console.error('AI gateway error:', toolCheckResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const toolCheckData = await toolCheckResponse.json();
    const choice = toolCheckData.choices?.[0];

    // Helper: stream a follow-up response after a tool call
    async function streamFollowUp(followUpMessages: any[], fallbackMsg: string) {
      const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...followUpMessages,
          ],
          stream: true,
        }),
      });

      if (!followUpResponse.ok) {
        const errorText = await followUpResponse.text();
        console.error('Follow-up AI error:', followUpResponse.status, errorText);
        const encoder = new TextEncoder();
        const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: fallbackMsg } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(encoder.encode(sseData), {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });
      }

      return new Response(followUpResponse.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    // Check if the AI wants to call a tool
    if (choice?.message?.tool_calls?.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      let toolArgs: any;
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch {
        toolArgs = toolCall.function.arguments;
      }

      // --- SUBMIT ORDER ---
      if (toolCall.function?.name === 'submit_order') {
        console.log('Submitting order:', JSON.stringify(toolArgs));

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const orderResponse = await fetch(`${supabaseUrl}/functions/v1/submit-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...toolArgs, channel: 'chat' }),
        });

        const orderResult = await orderResponse.json();
        console.log('Order result:', JSON.stringify(orderResult));

        const followUpMessages = [
          ...messages,
          choice.message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: orderResult.success
              ? `Order submitted successfully! Order ID: ${orderResult.order_id}. The order has been sent to our provider network (Intelisys) for processing, and a confirmation email has been sent to the customer at ${toolArgs.contact_email}.`
              : `Order submission failed: ${orderResult.error || 'Unknown error'}. Please try again or suggest the customer contact us directly.`,
          },
        ];

        return streamFollowUp(
          followUpMessages,
          orderResult.success
            ? `Great news! Your order has been submitted successfully. A confirmation email has been sent to ${toolArgs.contact_email}. Our provider network will process your request, and you'll receive final pricing and installation details within 1-2 business days. Is there anything else I can help you with?`
            : `I'm sorry, there was an issue submitting your order. Please try again or contact us directly for assistance.`,
        );
      }

      // --- LOOKUP ORDERS ---
      if (toolCall.function?.name === 'lookup_orders') {
        const email = toolArgs.customer_email?.toLowerCase()?.trim();
        console.log('Looking up orders for:', email);

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: orders, error: lookupError } = await supabase
          .from('orders')
          .select('id, customer_name, service_address, city, state, zip, contact_phone, contact_email, preferred_provider, selected_plan, speed, monthly_price, status, channel, created_at, service_type, notes')
          .ilike('contact_email', email)
          .order('created_at', { ascending: false })
          .limit(10);

        let toolResultContent: string;

        if (lookupError) {
          console.error('Order lookup error:', lookupError);
          toolResultContent = 'Error looking up orders. Please ask the customer to try again or contact us directly at 1-888-230-FAST.';
        } else if (!orders || orders.length === 0) {
          toolResultContent = `No orders found for email: ${email}. Let the customer know you couldn't find any orders with that email address. They may want to double-check the email or contact us at 1-888-230-FAST.`;
        } else {
          // Include verification data for the AI to compare against the secondary factor
          // The AI will NOT share these details until secondary verification passes
          const orderSummaries = orders.map((o: any) => ({
            order_id: o.id.slice(0, 8),
            full_order_id: o.id,
            customer_name: o.customer_name,
            service_address: `${o.service_address}, ${o.city}, ${o.state} ${o.zip}`,
            street_address: o.service_address,
            city: o.city,
            state: o.state,
            zip: o.zip,
            contact_phone: o.contact_phone,
            phone_last_4: o.contact_phone?.replace(/\D/g, '').slice(-4),
            preferred_provider: o.preferred_provider,
            selected_plan: o.selected_plan,
            speed: o.speed,
            monthly_price: o.monthly_price,
            status: o.status,
            service_type: o.service_type,
            submitted_at: o.created_at,
            notes: o.notes,
          }));

          toolResultContent = `Found ${orders.length} order(s) for ${email}. IMPORTANT: You now have the order data below. Use it to VERIFY the customer's secondary factor (name, last 4 digits of phone, or address) BEFORE sharing any details. If the secondary factor matches, present the order details. If it doesn't match, tell the customer the information doesn't match without revealing what's on file.\n\nOrder data:\n${JSON.stringify(orderSummaries, null, 2)}`;
        }

        const followUpMessages = [
          ...messages,
          choice.message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResultContent,
          },
        ];

        return streamFollowUp(
          followUpMessages,
          orders?.length
            ? "I've found your order information. Let me verify your identity to share the details securely."
            : "I wasn't able to find any orders with that email address. Please double-check the email or contact us at 1-888-230-FAST.",
        );
      }
    }

    // No tool call — regular chat response, stream it
    // If the non-streaming response already has content, convert to SSE
    if (choice?.message?.content) {
      const content = choice.message.content;
      const encoder = new TextEncoder();
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(encoder.encode(sseData), {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    // Fallback: make a streaming call without tools
    const streamResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error('Stream AI error:', streamResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

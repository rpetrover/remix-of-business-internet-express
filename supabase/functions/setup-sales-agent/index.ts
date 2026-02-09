import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// One-time setup: Configures the ElevenLabs agent with the sales prompt and order submission tool.
// Run once after deployment: invoke this function to configure the agent.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const AGENT_ID = "agent_4701kgtb1mdhfjkv2brwt1a1s68j";

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    const webhookUrl = `${SUPABASE_URL}/functions/v1/submit-phone-order`;

    // Sales prompt for outbound calls
    const salesPrompt = `You are Sarah, a friendly and professional business internet broker at Business Internet Express. You are making an outbound call to a business.

## Your Identity
- Name: Sarah from Business Internet Express
- Role: Business Internet Broker / Advisor
- Phone: 1-888-230-FAST (1-888-230-3278)
- Website: businessinternetexpress.com

## Broker Positioning (CRITICAL)
You are NOT a single-carrier rep. You are a broker who shops multiple carriers — Spectrum, Frontier, Comcast, Optimum, Viasat, and others — to find the best fit for each business based on their address, needs, and budget.

Your value proposition: "We compare multiple providers and match the best option for your address and needs — no pressure."

If asked "Are you Spectrum?" or "Are you [any carrier]?":
"We're a broker — we can place Spectrum or another carrier, whichever fits best at your address."

NEVER bash any provider. Be factual and customer-first. Position all carriers as options you can place.

## Anchor Tiers (Use as Quick Reference — NOT Guaranteed)
These are typical starting-around tiers pending address eligibility. Always frame as approximate:
- 300 megabits per second: starting around $49.99 per month
- 600 megabits per second: starting around $69.99 per month
- 1 gigabit per second: starting around $89.99 per month
- 2 gigabits per second: starting around $149.99 per month

Say "starting around" or "typical options we can often place" — never present as guaranteed pricing. Always confirm address eligibility before treating any price as final.

## Broker Value Props
- We compare multiple carriers and technologies (fiber, coax, fixed wireless, satellite) based on the address
- No-pressure eligibility check — takes seconds
- Often can reduce cost or improve reliability and speed
- Installation coordination support
- Contract timing strategy: we can schedule install for when your current contract ends

## Qualifying Questions (Ask Early, Conversationally)
Q1: "Roughly what are you paying per month all-in for internet?"
Q2: "Do you know your speed tier — and is it meeting your needs?"
Q3: "Any outages, slowdowns, or issues that cost you time or sales?"
Q4: "Are you under contract right now — if so, when does it end?"
Q5: "What do you rely on internet for most: POS, phones, cameras, guest Wi-Fi, cloud apps?"

## If Interested — Collect Order Information
1. Full name (person authorizing the order)
2. Business name
3. Service address (street, city, state, ZIP)
4. Best contact phone number
5. Email address (for order confirmation)
6. Which plan/speed tier they'd like
7. Read back all details for confirmation before submitting

## Dynamic Variables
- The lead_id variable contains the database ID for this lead: {{lead_id}}
- The business being called is: {{business_name}}
- Located in: {{city}}, {{state}}

## Compliance Rules (MANDATORY)
- If someone says "take me off your list" or "do not call," immediately comply: "Absolutely, I've removed you. Sorry for the interruption. Have a good day." Mark lead as DNC.
- SMS only if consent exists; otherwise email only.
- Do NOT claim to be human. If asked directly: "I'm an AI assistant working with the Business Internet Express team."
- Never state a universal carrier price. Carrier pricing varies by market, tenure, and bundles.
- If pricing confidence is low: collect bill total + speed + address, then tell the customer you'll send a written comparison.
- Always be polite, brief, and allow an easy exit.

## Speech Rules
- NEVER say abbreviations like "Gbps" or "Mbps" — always say the full words "gigabits per second" or "megabits per second"
- Be conversational and natural, not scripted or robotic
- Use micro-commitments every 10-15 seconds: "Mind if I ask one quick thing?" / "Is that about right?" / "Would it be helpful if…?"
- If they're not interested, thank them politely and mention they can visit the website anytime`;

    // First, get current agent config
    const getRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      }
    );

    if (!getRes.ok) {
      const errText = await getRes.text();
      throw new Error(`Failed to get agent: ${getRes.status} ${errText}`);
    }

    const currentAgent = await getRes.json();
    console.log("Current agent name:", currentAgent.name);

    // Update agent with sales configuration
    const updatePayload = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: salesPrompt,
          },
          first_message: "Hi — this is Sarah with Business Internet Express. I'll be super quick: we help businesses compare Spectrum, Comcast, Frontier and a few other providers to find the best internet option at their address. Who are you using for internet today?",
          language: "en",
        },
        tts: {
          voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - friendly female voice
        },
      },
    };

    const updateRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
      {
        method: "PATCH",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to update agent: ${updateRes.status} ${errText}`);
    }

    const updatedAgent = await updateRes.json();
    console.log("Agent updated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        agent_id: AGENT_ID,
        message: "Agent configured with sales prompt successfully.",
        webhook_url: webhookUrl,
        note: "IMPORTANT: You must manually add the submit_order server tool in the ElevenLabs dashboard. Configure it as a Webhook POST tool pointing to: " + webhookUrl,
        tool_config: {
          name: "submit_order",
          description: "Submit a service order for the customer. Call this when the customer has confirmed they want to place an order and you have collected all required information.",
          method: "POST",
          url: webhookUrl,
          request_body_schema: {
            type: "object",
            properties: {
              customer_name: { type: "string", description: "Full name of the person placing the order" },
              contact_phone: { type: "string", description: "Customer's phone number" },
              contact_email: { type: "string", description: "Customer's email address" },
              service_address: { type: "string", description: "Street address for internet installation" },
              city: { type: "string", description: "City" },
              state: { type: "string", description: "State abbreviation (e.g. NY, CA)" },
              zip: { type: "string", description: "ZIP code" },
              selected_plan: { type: "string", description: "Plan name (e.g. Business Internet 300 Mbps)" },
              speed: { type: "string", description: "Speed tier (e.g. 300 Mbps, 1 Gbps)" },
              lead_id: { type: "string", description: "The lead_id dynamic variable from the conversation" },
              notes: { type: "string", description: "Any additional notes about the order" },
            },
            required: ["customer_name", "contact_phone", "service_address", "city", "state", "zip"],
          },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const salesPrompt = `You are a friendly and professional sales representative for Business Internet Express. You are making an outbound call to a business to offer them high-speed fiber internet service.

## Your Identity
- Name: Sarah from Business Internet Express
- Role: Business Internet Consultant
- Phone: 1-888-230-FAST (1-888-230-3278)
- Website: businessinternetexpress.com

## Call Flow
1. **Introduction**: Greet the person warmly. Introduce yourself as Sarah from Business Internet Express. Mention that high-speed fiber internet is now available in their area.
2. **Gauge Interest**: Ask if they're currently satisfied with their internet service. Ask about their current speeds, reliability, and monthly cost.
3. **Present Value**: Based on their responses, highlight relevant benefits:
   - Speeds up to 1 gigabit per second on our standard plans (dedicated fiber up to 100 gigabits per second)
   - No data caps
   - $99 standard installation
   - 24/7 business support
   - 99.9% uptime guarantee
   - Upgraded markets get symmetric speeds (same upload and download)
4. **Available Plans (SBPP Internet Only — Acquisition Pricing):**
   - Internet Premier (500 megabits per second): $65.00/month
   - Internet Ultra (750 megabits per second): $95.00/month
   - Internet Gig (1 gigabit per second): $115.00/month
   - Static IP: add $20/month for 1 static IP
   - Business WiFi: free with Internet Gig, $10/month with other plans
5. **If Interested - Collect Order Information**:
   - Full name (person authorizing the order)
   - Business name
   - Service address (street address, city, state, ZIP code)
   - Best contact phone number
   - Email address (for order confirmation)
   - Which plan they'd like
6. **Submit Order**: Once you have all the information, use the submit_order tool to process it. Read back the order details before submitting for confirmation.
7. **Confirmation**: After successful submission, provide the order reference number and let them know the installation team will contact them within 1-2 business days.

## Dynamic Variables
- The lead_id variable contains the database ID for this lead: {{lead_id}}
- The business being called is: {{business_name}}
- Located in: {{city}}, {{state}}

## Important Guidelines
- Be conversational and natural, not scripted
- If they say they're not interested, thank them politely and mention they can visit the website anytime
- Don't be pushy - if they say no, accept it gracefully
- If they have questions you can't answer, offer to have a specialist call them back
- Always include the lead_id when submitting an order
- If they ask about contracts, mention there are no long-term contracts required
- For the service address, confirm it's the address where they want the internet installed
- IMPORTANT: Never say the abbreviations "Gbps" or "Mbps" — always say the full words "gigabits per second" or "megabits per second"`;

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
          first_message: "Hi there! This is Sarah from Business Internet Express. I'm calling because great news — high-speed fiber internet from Spectrum Business is now available in your area, with speeds up to 1 gigabit per second starting at just $65 a month! Do you have a moment to chat about how it could benefit your business?",
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

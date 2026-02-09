import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Spectrum serviceable 3-digit ZIP prefixes (same as discover-leads)
const SPECTRUM_ZIP_PREFIXES = [
  "100","101","102","103","104","105","106","107","108","109",
  "110","111","112","113","114","115","116","117","118","119",
  "120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149",
  "282","283","284","285","286","287","288","289",
  "290","291","292","293","294","295","296","297","298","299",
  "430","431","432","433","434","435","436","437","438","439",
  "440","441","442","443","444","445","446","447","448","449",
  "450","451","452","453","454","455","456","457","458","459",
  "530","531","532","534","535","537","538","539",
  "540","541","542","543","544","545","546","547","548","549",
  "550","551","553","554","555","556","557","558","559",
  "600","601","602","603","604","605","606","607","608","609",
  "610","611","612","613","614","615","616","617","618","619",
  "750","751","752","753","754","755","756","757","758","759",
  "760","761","762","763","764","765","766","767","768","769",
  "770","771","772","773","774","775","776","777","778","779",
  "900","901","902","903","904","905","906","907","908","909",
  "910","911","912","913","914","915","916","917","918","919",
  "920","921","922","923","924","925","926","927","928",
  "930","931","932","933","934","935",
  "200","201","202","203","204","205",
  "206","207","208","209","210","211","212","213","214","215","216","217","218","219",
  "220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236",
  "270","271","272","273","274","275","276","277","278","279","280","281",
  "300","301","302","303","304","305","306","307","308","309","310","311","312","313","314","315","316","317","318","319",
  "320","321","322","323","324","325","326","327","328","329","330","331","332","333","334","335","336","337","338","339",
  "340","341","342","343","344","345","346","347","348","349",
  "370","371","372","373","374","376","377","378","379","380","381","382","383","384","385",
  "386","387","388","389","390","391","392","393","394","395","396","397",
  "400","401","402","403","404","405","406","407","408","409","410","411","412","413","414","415","416","417","418",
  "460","461","462","463","464","465","466","467","468","469","470","471","472","473","474","475","476","477","478","479",
  "480","481","482","483","484","485","486","487","488","489",
];

// ZIP prefix to US timezone mapping (approximate)
const ZIP_TIMEZONES: Record<string, string> = {
  // Eastern: NY, NJ, CT, PA, MA, MD, VA, NC, SC, GA, FL (east), OH, MI, IN (east), WV, ME, NH, VT, RI, DE, DC, KY (east), TN (east)
  // Central: IL, WI, MN, IA, MO, AR, LA, MS, AL, TX, OK, KS, NE, SD, ND, TN (west), KY (west), IN (west)
  // Mountain: MT, WY, CO, NM, AZ, UT, ID
  // Pacific: WA, OR, CA, NV
};

// Determine timezone from ZIP code prefix
function getTimezoneForZip(zip: string): string {
  const prefix = zip.substring(0, 3);
  const num = parseInt(prefix);

  // Pacific Time: CA (900-961), OR (970-979), WA (980-994), NV (889-898)
  if ((num >= 900 && num <= 961) || (num >= 970 && num <= 994) || (num >= 889 && num <= 898)) {
    return "America/Los_Angeles";
  }
  // Mountain Time: AZ (850-865), CO (800-816), ID (832-838), MT (590-599), NM (870-884), UT (840-847), WY (820-831)
  if ((num >= 850 && num <= 865) || (num >= 800 && num <= 816) || (num >= 832 && num <= 838) ||
      (num >= 590 && num <= 599) || (num >= 870 && num <= 884) || (num >= 840 && num <= 847) ||
      (num >= 820 && num <= 831)) {
    return "America/Denver";
  }
  // Central Time: TX (750-799), IL (600-629), WI (530-549), MN (550-567), IA (500-528), MO (630-658),
  // AR (716-729), LA (700-714), MS (386-397), AL (350-369), OK (730-749), KS (660-679),
  // NE (680-693), SD (570-577), ND (580-588), TN west (380-385)
  if ((num >= 750 && num <= 799) || (num >= 600 && num <= 629) || (num >= 530 && num <= 549) ||
      (num >= 550 && num <= 567) || (num >= 500 && num <= 528) || (num >= 630 && num <= 658) ||
      (num >= 716 && num <= 729) || (num >= 700 && num <= 714) || (num >= 386 && num <= 397) ||
      (num >= 350 && num <= 369) || (num >= 730 && num <= 749) || (num >= 660 && num <= 679) ||
      (num >= 680 && num <= 693) || (num >= 570 && num <= 577) || (num >= 580 && num <= 588) ||
      (num >= 380 && num <= 385)) {
    return "America/Chicago";
  }
  // Default: Eastern Time (everything else - NY, NJ, PA, MA, CT, MD, VA, NC, SC, GA, FL, OH, MI, etc.)
  return "America/New_York";
}

// Check if it's within business calling hours (8AM-10PM) in the lead's local timezone
function isWithinCallingHours(zip: string): boolean {
  const tz = getTimezoneForZip(zip);
  const now = new Date();
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const hour = localTime.getHours();
  return hour >= 8 && hour < 22; // 8AM to 10PM
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_AGENT_ID = "agent_4701kgtb1mdhfjkv2brwt1a1s68j";

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    // Fetch leads that are eligible for calling:
    // - Have a phone number
    // - Haven't been called yet OR were called > 3 days ago with no answer
    // - Not converted, not_interested, or do_not_contact
    // - Prioritize fiber launch areas first
    const { data: leads, error: fetchError } = await supabase
      .from("outbound_leads")
      .select("*")
      .not("phone", "is", null)
      .not("campaign_status", "in", '("converted","not_interested","do_not_contact")')
      .or("last_call_at.is.null,last_call_at.lt." + new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .order("is_fiber_launch_area", { ascending: false, nullsFirst: false })
      .order("last_call_at", { ascending: true, nullsFirst: true })
      .limit(20);

    if (fetchError) throw fetchError;
    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ success: true, called: 0, message: "No eligible leads to call" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to only leads within calling hours in their timezone
    const callableLeads = leads.filter((lead: any) => {
      if (!lead.zip) return false;
      return isWithinCallingHours(lead.zip);
    });

    if (callableLeads.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          called: 0, 
          message: "No leads within calling hours (8AM-10PM local time)",
          totalEligible: leads.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let called = 0;
    let failed = 0;
    const maxCallsPerRun = 5; // Limit concurrent calls per cron run

    for (const lead of callableLeads.slice(0, maxCallsPerRun)) {
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/outbound-sales-call`;
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">
    Hi, this is a call from Business Internet Express for ${lead.business_name}.
    Great news! High-speed fiber internet is now available in ${lead.city || "your area"}.
    You can get speeds up to 30 gigabits per second starting at just $49.99 per month,
    with free installation and no data caps.
    Visit businessinternetexpress.com or call 1-888-230-FAST. That's 1-888-230-3278.
    Thank you!
  </Say>
</Response>`;

        // Format phone number
        let phoneNumber = lead.phone.replace(/[^0-9+]/g, "");
        if (!phoneNumber.startsWith("+")) {
          if (phoneNumber.startsWith("1") && phoneNumber.length === 11) {
            phoneNumber = "+" + phoneNumber;
          } else {
            phoneNumber = "+1" + phoneNumber;
          }
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
        const callParams = new URLSearchParams({
          To: phoneNumber,
          From: TWILIO_PHONE_NUMBER,
          Twiml: twiml,
          StatusCallback: `${functionUrl}?action=status&lead_id=${lead.id}`,
          StatusCallbackEvent: "completed",
          Record: "true",
          RecordingStatusCallback: `${functionUrl}?action=recording&lead_id=${lead.id}`,
        });

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: callParams.toString(),
        });

        const twilioData = await twilioRes.json();

        if (!twilioRes.ok) {
          console.error(`Twilio error for ${lead.business_name}:`, twilioData);
          failed++;
          continue;
        }

        // Update lead
        await supabase
          .from("outbound_leads")
          .update({
            campaign_status: "called",
            last_call_at: new Date().toISOString(),
            call_sid: twilioData.sid,
          })
          .eq("id", lead.id);

        // Log call record
        await supabase.from("call_records").insert({
          direction: "outbound",
          caller_phone: TWILIO_PHONE_NUMBER,
          callee_phone: phoneNumber,
          customer_name: lead.business_name,
          customer_email: lead.email,
          status: "initiated",
          call_sid: twilioData.sid,
        });

        called++;
        console.log(`✅ Called ${lead.business_name} (${lead.city}, ${lead.state}) - ${twilioData.sid}`);

        // Delay between calls to avoid rate limits
        await new Promise((r) => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to call ${lead.business_name}:`, e);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        called,
        failed,
        totalEligible: leads.length,
        withinCallingHours: callableLeads.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-caller error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

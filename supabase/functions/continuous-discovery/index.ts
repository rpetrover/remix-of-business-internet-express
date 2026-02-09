import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Full Spectrum ZIP prefix list
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

// Generate actual 5-digit ZIPs from a 3-digit prefix batch
function generateZipsFromPrefixes(prefixes: string[]): string[] {
  const zips: string[] = [];
  for (const prefix of prefixes) {
    // Generate a sampling of ZIPs in this prefix (00, 10, 20, ..., 90 + 01, 50)
    for (const suffix of ["01", "10", "20", "30", "50", "70", "99"]) {
      zips.push(prefix + suffix);
    }
  }
  return zips;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const GOOGLE_MAPS_API_KEY = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    // Track which prefix batch we're on using a simple counter in the DB
    // We cycle through all prefixes over time
    const { data: lastScan } = await supabase
      .from("spectrum_newsroom_scans")
      .select("id")
      .eq("article_url", "__discovery_cursor__")
      .maybeSingle();

    let cursorIndex = 0;
    if (lastScan) {
      // Get the current cursor position from the locations_found field
      const { data: cursor } = await supabase
        .from("spectrum_newsroom_scans")
        .select("locations_found")
        .eq("article_url", "__discovery_cursor__")
        .single();
      cursorIndex = (cursor?.locations_found as any)?.index || 0;
    }

    // First prioritize fiber launch area ZIPs
    const { data: fiberLaunchScans } = await supabase
      .from("spectrum_newsroom_scans")
      .select("zip_codes_extracted")
      .not("zip_codes_extracted", "eq", "{}");

    const fiberLaunchZips = new Set<string>();
    for (const scan of fiberLaunchScans || []) {
      for (const zip of scan.zip_codes_extracted || []) {
        fiberLaunchZips.add(zip);
      }
    }

    // Pick the next batch of prefixes to process
    const batchSize = 5; // 5 prefixes per run = ~35 ZIP codes
    const startIdx = cursorIndex % SPECTRUM_ZIP_PREFIXES.length;
    const prefixBatch = SPECTRUM_ZIP_PREFIXES.slice(startIdx, startIdx + batchSize);
    const nextCursor = (startIdx + batchSize) % SPECTRUM_ZIP_PREFIXES.length;

    // Generate ZIPs — fiber launch ZIPs go first
    const fiberZipsArray = Array.from(fiberLaunchZips).slice(0, 10);
    const regularZips = generateZipsFromPrefixes(prefixBatch);
    const allZips = [...new Set([...fiberZipsArray, ...regularZips])];

    // Business types to rotate through
    const businessTypes = [
      "business", "restaurant", "office", "retail store", "medical office",
      "law firm", "dental office", "real estate", "accounting firm", "salon",
    ];
    const businessType = businessTypes[Math.floor(cursorIndex / SPECTRUM_ZIP_PREFIXES.length) % businessTypes.length];

    let totalFound = 0;
    let totalInserted = 0;
    let totalEmailsFound = 0;

    for (const zip of allZips) {
      try {
        const isFiberLaunch = fiberLaunchZips.has(zip);
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(businessType + " in " + zip)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

        const results = data.results || [];
        totalFound += results.length;

        for (const place of results) {
          let phone = null;
          let website = null;

          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&key=${GOOGLE_MAPS_API_KEY}`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();
            if (detailsData.result) {
              phone = detailsData.result.formatted_phone_number || null;
              website = detailsData.result.website || null;
            }
          } catch (e) {
            console.error(`Details failed for ${place.name}:`, e);
          }

          // Scrape email from website via Firecrawl
          let email: string | null = null;
          if (website && FIRECRAWL_API_KEY) {
            try {
              const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: website, formats: ["markdown"], onlyMainContent: false }),
              });
              const scrapeData = await scrapeRes.json();
              const content = scrapeData?.data?.markdown || "";
              if (content) {
                const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
                const emails = content.match(emailRegex) || [];
                const filtered = emails.filter((e: string) => {
                  const l = e.toLowerCase();
                  return !l.includes("noreply") && !l.includes("no-reply") && !l.includes("example.com") &&
                         !l.includes("sentry") && !l.includes("wordpress") && !l.includes("wixpress");
                });
                if (filtered.length > 0) {
                  email = filtered[0];
                  totalEmailsFound++;
                }
              }
            } catch (e) {
              // Skip email scraping errors
            }
          }

          const address = place.formatted_address || "";
          const addressParts = address.split(",").map((p: string) => p.trim());
          const city = addressParts.length >= 3 ? addressParts[addressParts.length - 3] || "" : "";
          const stateZip = addressParts.length >= 2 ? addressParts[addressParts.length - 2] || "" : "";
          const stateMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})?/);
          const state = stateMatch ? stateMatch[1] : "";
          const extractedZip = stateMatch ? stateMatch[2] || zip : zip;

          const { error: insertError } = await supabase
            .from("outbound_leads")
            .upsert(
              {
                business_name: place.name,
                address,
                city,
                state,
                zip: extractedZip,
                phone,
                email,
                website,
                google_place_id: place.place_id,
                business_type: businessType,
                latitude: place.geometry?.location?.lat || null,
                longitude: place.geometry?.location?.lng || null,
                is_fiber_launch_area: isFiberLaunch,
                fiber_launch_source: isFiberLaunch ? "Newsroom fiber launch area" : null,
              },
              { onConflict: "google_place_id", ignoreDuplicates: true }
            );

          if (!insertError) totalInserted++;
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`Error processing ZIP ${zip}:`, err);
      }
    }

    // Update cursor position
    await supabase.from("spectrum_newsroom_scans").upsert(
      {
        article_url: "__discovery_cursor__",
        article_title: "Discovery Cursor",
        locations_found: { index: nextCursor, lastRun: new Date().toISOString(), businessType },
        zip_codes_extracted: [],
        leads_discovered: totalInserted,
      },
      { onConflict: "article_url" }
    );

    console.log(`Continuous discovery: ${totalFound} found, ${totalInserted} inserted, ${totalEmailsFound} emails. Cursor: ${startIdx}->${nextCursor}, type: ${businessType}`);

    return new Response(
      JSON.stringify({
        success: true,
        prefixesSearched: prefixBatch.length,
        zipsSearched: allZips.length,
        totalFound,
        totalInserted,
        totalEmailsFound,
        cursorPosition: nextCursor,
        businessType,
        fiberLaunchZipsIncluded: fiberZipsArray.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Continuous discovery error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

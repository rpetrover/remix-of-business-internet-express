import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Spectrum serviceable 3-digit ZIP prefixes (must match frontend list)
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

function isSpectrumZip(zip: string): boolean {
  return SPECTRUM_ZIP_PREFIXES.includes(zip.substring(0, 3));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { zipCodes, businessType, campaignRunId } = await req.json();

    if (!zipCodes || !Array.isArray(zipCodes) || zipCodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "zipCodes array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter to only Spectrum-serviceable ZIPs
    const spectrumZips = zipCodes.filter((z: string) => isSpectrumZip(z));
    if (spectrumZips.length === 0) {
      return new Response(
        JSON.stringify({ error: "None of the provided ZIP codes are in Spectrum fiber service areas", validZips: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const query = businessType || "business";
    let totalFound = 0;
    let totalInserted = 0;
    const errors: string[] = [];

    for (const zip of spectrumZips) {
      try {
        // Use Google Places Text Search to find businesses in this ZIP
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " in " + zip)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          errors.push(`ZIP ${zip}: Google API error - ${data.status}`);
          continue;
        }

        const results = data.results || [];
        totalFound += results.length;

        for (const place of results) {
          // Get place details for phone, website, etc
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
            console.error(`Failed to get details for ${place.name}:`, e);
          }

          // Extract address components
          const address = place.formatted_address || "";
          const addressParts = address.split(",").map((p: string) => p.trim());
          const city = addressParts.length >= 2 ? addressParts[addressParts.length - 3] || "" : "";
          const stateZip = addressParts.length >= 1 ? addressParts[addressParts.length - 2] || "" : "";
          const stateMatch = stateZip.match(/([A-Z]{2})\s*(\d{5})?/);
          const state = stateMatch ? stateMatch[1] : "";
          const extractedZip = stateMatch ? stateMatch[2] || zip : zip;

          // Upsert lead (skip if place_id already exists)
          const { error: insertError } = await supabase
            .from("outbound_leads")
            .upsert(
              {
                business_name: place.name,
                address: address,
                city: city,
                state: state,
                zip: extractedZip,
                phone: phone,
                website: website,
                google_place_id: place.place_id,
                business_type: query,
                latitude: place.geometry?.location?.lat || null,
                longitude: place.geometry?.location?.lng || null,
                discovery_batch: campaignRunId || null,
              },
              { onConflict: "google_place_id", ignoreDuplicates: true }
            );

          if (!insertError) {
            totalInserted++;
          }
        }

        // Rate limit: small delay between ZIP searches
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`Error processing ZIP ${zip}:`, err);
        errors.push(`ZIP ${zip}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Update campaign run stats if provided
    if (campaignRunId) {
      await supabase
        .from("outbound_campaign_runs")
        .update({
          total_leads_found: totalFound,
          status: "discovered",
        })
        .eq("id", campaignRunId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        spectrumZipsSearched: spectrumZips.length,
        totalFound,
        totalInserted,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Discover leads error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

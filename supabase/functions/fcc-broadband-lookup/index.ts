const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CENSUS_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder";

interface GeocodedAddress {
  matchedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string;
  countyFips: string;
  stateFips: string;
  tractCode: string;
  blockCode: string;
}

async function geocodeAddress(
  street: string,
  city?: string,
  state?: string,
  zip?: string
): Promise<GeocodedAddress | null> {
  // Try one-line address first, then structured
  let url: string;
  const fullAddress = [street, city, state, zip].filter(Boolean).join(", ");

  // Use geographies endpoint to get census tract/block info
  url = `${CENSUS_GEOCODER_URL}/geographies/onelineaddress?address=${encodeURIComponent(fullAddress)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

  console.log("Geocoding address:", fullAddress);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Census geocoder failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data?.result;

    if (!result?.addressMatches || result.addressMatches.length === 0) {
      console.log("No geocoding matches found");
      return null;
    }

    const match = result.addressMatches[0];
    const coords = match.coordinates;
    const components = match.addressComponents;
    const geographies = match.geographies;

    // Extract census geography info
    const censusBlock = geographies?.["Census Blocks"]?.[0] || {};
    const countySubdiv = geographies?.["County Subdivisions"]?.[0] || {};

    return {
      matchedAddress: match.matchedAddress || fullAddress,
      latitude: coords?.y || 0,
      longitude: coords?.x || 0,
      city: components?.city || city || "",
      state: components?.state || state || "",
      zip: components?.zip || zip || "",
      countyFips: censusBlock?.COUNTY || countySubdiv?.COUNTY || "",
      stateFips: censusBlock?.STATE || countySubdiv?.STATE || "",
      tractCode: censusBlock?.TRACT || "",
      blockCode: censusBlock?.BLOCK || "",
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

function buildFCCMapUrl(address: string): string {
  return `https://broadbandmap.fcc.gov/location-summary/fixed?search_text=${encodeURIComponent(address)}&speed=25&tech=3`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { address, city, state, zip } = body;

    if (!address || typeof address !== "string" || address.trim().length < 3) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid street address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitized = {
      address: address.trim().slice(0, 200),
      city: (city || "").trim().slice(0, 100),
      state: (state || "").trim().slice(0, 2),
      zip: (zip || "").trim().slice(0, 5),
    };

    // Step 1: Geocode the address using US Census Bureau
    const geocoded = await geocodeAddress(
      sanitized.address,
      sanitized.city,
      sanitized.state,
      sanitized.zip
    );

    if (!geocoded) {
      return new Response(
        JSON.stringify({
          success: true,
          found: false,
          message: "Address could not be verified. Please check the address and try again.",
          fccMapUrl: buildFCCMapUrl([sanitized.address, sanitized.city, sanitized.state, sanitized.zip].filter(Boolean).join(", ")),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Return geocoded data with FCC map link
    // The zip from the geocoded address is used by the frontend
    // to match against our local provider database
    const fccMapUrl = buildFCCMapUrl(geocoded.matchedAddress);

    return new Response(
      JSON.stringify({
        success: true,
        found: true,
        location: {
          matchedAddress: geocoded.matchedAddress,
          city: geocoded.city,
          state: geocoded.state,
          zip: geocoded.zip,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
        },
        census: {
          stateFips: geocoded.stateFips,
          countyFips: geocoded.countyFips,
          tractCode: geocoded.tractCode,
          blockCode: geocoded.blockCode,
        },
        fccMapUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in broadband lookup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

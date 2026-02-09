import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Use Firecrawl to search for recent Spectrum fiber expansion articles
async function findNewsroomArticles(firecrawlApiKey: string): Promise<string[]> {
  console.log("Searching for Spectrum fiber expansion articles...");
  
  // Use Firecrawl search to find recent articles
  const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "site:corporate.charter.com/newsroom Spectrum fiber broadband expansion",
      limit: 20,
    }),
  });

  const searchData = await searchRes.json();
  const results = searchData?.data || [];
  
  const articleUrls: string[] = [];
  for (const result of results) {
    const url = result.url || "";
    if (
      url.includes("corporate.charter.com/newsroom") &&
      (url.includes("fiber") || url.includes("broadband") || url.includes("expan"))
    ) {
      articleUrls.push(url);
    }
  }

  // Also try mapping the newsroom directly
  try {
    const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://corporate.charter.com/newsroom",
        search: "fiber broadband expansion",
        limit: 30,
        includeSubdomains: false,
      }),
    });
    const mapData = await mapRes.json();
    const links: string[] = mapData?.links || mapData?.data?.links || [];
    
    for (const link of links) {
      if (
        link.includes("/newsroom/") &&
        (link.includes("fiber") || link.includes("broadband") || link.includes("expan")) &&
        !articleUrls.includes(link)
      ) {
        articleUrls.push(link);
      }
    }
  } catch (e) {
    console.log("Map failed, using search results only:", e);
  }

  console.log(`Found ${articleUrls.length} fiber expansion article URLs`);
  return articleUrls;
}

// Scrape an article and extract location information
async function scrapeArticle(
  url: string,
  firecrawlApiKey: string
): Promise<{
  title: string;
  publishDate: string;
  locations: { county: string; state: string; stateAbbr: string }[];
  zipCodes: string[];
  content: string;
} | null> {
  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    const data = await scrapeRes.json();
    const content = data?.data?.markdown || data?.markdown || "";
    const metadata = data?.data?.metadata || data?.metadata || {};

    if (!content) return null;

    const title = metadata.title || extractTitle(content);
    const publishDate = metadata.publishedTime || extractDate(content);

    // Extract locations from article content
    const locations = extractLocations(content);
    const zipCodes = extractZipCodes(content);

    return { title, publishDate, locations, zipCodes, content };
  } catch (e) {
    console.error(`Failed to scrape ${url}:`, e);
    return null;
  }
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : "Unknown Article";
}

function extractDate(content: string): string {
  // Look for date patterns like "December 10, 2025" or "November 17, 2025"
  const dateMatch = content.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
  );
  return dateMatch ? dateMatch[0] : "";
}

// US state name to abbreviation map
const STATE_ABBRS: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY",
};

function extractLocations(content: string): { county: string; state: string; stateAbbr: string }[] {
  const locations: { county: string; state: string; stateAbbr: string }[] = [];
  
  // Pattern: "County Name County, State" or "in County Name, State"
  const countyStatePattern = /(\w[\w\s]*?)\s+County,?\s+(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)/gi;
  
  let match;
  const seen = new Set<string>();
  while ((match = countyStatePattern.exec(content)) !== null) {
    const county = match[1].trim();
    const state = match[2].trim();
    const key = `${county}|${state}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      locations.push({
        county,
        state,
        stateAbbr: STATE_ABBRS[state.toLowerCase()] || state,
      });
    }
  }

  // Also look for city/town patterns: "CITY, STATE —" (common in press releases)
  const cityStatePattern =
    /\*\*([A-Z][A-Za-z\s]+(?:COUNTY)?),?\s+(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\s*[—–-]/gi;

  while ((match = cityStatePattern.exec(content)) !== null) {
    const loc = match[1].trim();
    const state = match[2].trim();
    const key = `${loc}|${state}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      locations.push({
        county: loc,
        state,
        stateAbbr: STATE_ABBRS[state.toLowerCase()] || state,
      });
    }
  }

  return locations;
}

function extractZipCodes(content: string): string[] {
  const zipPattern = /\b(\d{5})(?:\s|,|\.|\)|\]|$)/g;
  const zips = new Set<string>();
  let match;
  while ((match = zipPattern.exec(content)) !== null) {
    const zip = match[1];
    // Filter out unlikely ZIP codes (years, round numbers)
    const num = parseInt(zip);
    if (num >= 501 && num <= 99950 && !zip.match(/^(2024|2025|2026|2027|10000|00000)$/)) {
      zips.add(zip);
    }
  }
  return Array.from(zips);
}

// Use Google Maps Geocoding to find ZIP codes for a county/state
async function getZipCodesForLocation(
  county: string,
  state: string,
  googleApiKey: string
): Promise<string[]> {
  try {
    const query = `${county} County, ${state}`;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`;
    const res = await fetch(geocodeUrl);
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) return [];

    const result = data.results[0];
    const lat = result.geometry.location.lat;
    const lng = result.geometry.location.lng;

    // Search for businesses near the county center to discover ZIP codes
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=20000&type=establishment&key=${googleApiKey}`;
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    const zips = new Set<string>();
    for (const place of placesData.results || []) {
      const addr = place.vicinity || "";
      const zipMatch = addr.match(/\b(\d{5})\b/);
      if (zipMatch) zips.add(zipMatch[1]);
    }

    // Also extract ZIP from the geocode result itself
    for (const comp of result.address_components || []) {
      if (comp.types.includes("postal_code")) {
        zips.add(comp.long_name);
      }
    }

    return Array.from(zips);
  } catch (e) {
    console.error(`Failed to geocode ${county}, ${state}:`, e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("Firecrawl API key not configured");
    }

    const GOOGLE_MAPS_API_KEY = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Find newsroom articles about fiber expansion
    const articleUrls = await findNewsroomArticles(FIRECRAWL_API_KEY);

    // Step 2: Filter out already-scanned articles
    const { data: existingScans } = await supabase
      .from("spectrum_newsroom_scans")
      .select("article_url");
    const scannedUrls = new Set((existingScans || []).map((s: any) => s.article_url));
    const newArticles = articleUrls.filter((url) => !scannedUrls.has(url));

    console.log(`${newArticles.length} new articles to scan (${scannedUrls.size} already scanned)`);

    const results: any[] = [];
    let totalZipsFound = 0;

    for (const url of newArticles.slice(0, 10)) {
      // Limit to 10 articles per scan
      console.log(`Scraping: ${url}`);
      const article = await scrapeArticle(url, FIRECRAWL_API_KEY);
      if (!article) continue;

      // Collect ZIP codes from article content + geocoding locations
      const allZips = new Set(article.zipCodes);

      for (const loc of article.locations) {
        const locZips = await getZipCodesForLocation(
          loc.county,
          loc.state,
          GOOGLE_MAPS_API_KEY
        );
        locZips.forEach((z) => allZips.add(z));
      }

      const zipArray = Array.from(allZips);
      totalZipsFound += zipArray.length;

      // Save scan record
      await supabase.from("spectrum_newsroom_scans").upsert(
        {
          article_url: url,
          article_title: article.title,
          publish_date: article.publishDate,
          locations_found: article.locations,
          zip_codes_extracted: zipArray,
        },
        { onConflict: "article_url" }
      );

      // Mark any existing leads in these ZIPs as fiber launch priority
      if (zipArray.length > 0) {
        await supabase
          .from("outbound_leads")
          .update({
            is_fiber_launch_area: true,
            fiber_launch_source: article.title,
          })
          .in("zip", zipArray);
      }

      results.push({
        url,
        title: article.title,
        date: article.publishDate,
        locations: article.locations,
        zipCodes: zipArray,
      });

      // Rate limit between articles
      await new Promise((r) => setTimeout(r, 500));
    }

    return new Response(
      JSON.stringify({
        success: true,
        articlesFound: articleUrls.length,
        newArticlesScanned: results.length,
        alreadyScanned: scannedUrls.size,
        totalZipCodesFound: totalZipsFound,
        articles: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Newsroom scan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

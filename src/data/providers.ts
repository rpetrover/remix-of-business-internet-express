export interface InternetPlan {
  name: string;
  speed: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface InternetProvider {
  id: string;
  name: string;
  logo?: string;
  description: string;
  technology: string;
  plans: InternetPlan[];
  /** If true, available everywhere (e.g. satellite) */
  nationwide?: boolean;
  serviceableZipPrefixes?: string[];
  /** Whether this is a dedicated/enterprise fiber provider */
  dedicatedFiber?: boolean;
}

export const spectrumPlans: InternetPlan[] = [
  {
    name: "Business Internet",
    speed: "300 Mbps",
    price: "$49.99",
    features: [
      "No data caps",
      "Free modem",
      "Free installation",
      "24/7 U.S.-based support",
    ],
  },
  {
    name: "Business Internet Ultra",
    speed: "500 Mbps",
    price: "$59.99",
    features: [
      "No data caps",
      "Free modem",
      "Free installation",
      "24/7 U.S.-based support",
      "Static IP available",
    ],
    recommended: true,
  },
  {
    name: "Business Internet Gig",
    speed: "1 Gbps",
    price: "$69.99",
    features: [
      "No data caps",
      "Free modem",
      "Free installation",
      "24/7 U.S.-based support",
      "Static IP included",
      "WiFi 6 router included",
    ],
  },
];

export const alternativeProviders: InternetProvider[] = [
  {
    id: "viasat",
    name: "Viasat",
    description: "Satellite internet available virtually everywhere — ideal for rural and remote business locations.",
    technology: "Satellite",
    nationwide: true,
    plans: [
      {
        name: "Viasat Business 25",
        speed: "25 Mbps",
        price: "$99.99",
        features: ["Available nationwide", "No hard data caps", "Built-in WiFi", "Business-grade priority"],
      },
      {
        name: "Viasat Business 50",
        speed: "50 Mbps",
        price: "$149.99",
        features: ["Available nationwide", "Priority data", "Built-in WiFi", "24/7 support"],
        recommended: true,
      },
      {
        name: "Viasat Business 100",
        speed: "100 Mbps",
        price: "$199.99",
        features: ["Available nationwide", "Highest priority data", "Built-in WiFi", "Dedicated support"],
      },
    ],
  },
  {
    id: "frontier",
    name: "Frontier Internet",
    description: "Fiber and DSL internet options for businesses with competitive pricing.",
    technology: "Fiber / DSL",
    // Frontier serves: CT, WV, IN, IL, OH, WI, MN, CA, FL, TX, AZ, NV, NM, UT and others
    serviceableZipPrefixes: [
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // West Virginia
      "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
      "257", "258", "259", "260", "261", "262", "263", "264", "265", "266",
      // Indiana
      "460", "461", "462", "463", "464", "465", "466", "467", "468", "469",
      "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
      // Illinois
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614", "615", "616", "617", "618", "619",
      // Ohio
      "430", "431", "432", "433", "434", "435", "436", "437", "438", "439",
      "440", "441", "442", "443", "444", "445", "446", "447", "448", "449",
      // Wisconsin
      "530", "531", "532", "534", "535", "537", "538", "539",
      // Minnesota
      "550", "551", "553", "554", "556", "557", "558", "559",
      // California (partial — mainly inland/rural areas)
      "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
      "950", "951", "952", "953", "954", "955", "956", "957", "958", "959",
      // Florida (partial)
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "340", "341", "342", "344",
      // Texas (partial — Dallas, Fort Worth, parts of East TX)
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765", "766", "767", "768", "769",
      // Arizona
      "850", "851", "852", "853", "855", "856", "857",
      // Nevada
      "889", "890", "891", "893", "894", "895",
      // New Mexico
      "870", "871", "872", "873", "874", "875", "877",
      // Utah
      "840", "841", "842", "843", "844", "845", "846", "847",
      // New York (upstate — Rochester, Buffalo, etc.)
      "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
      // Pennsylvania (partial)
      "150", "151", "152", "153", "154", "155", "156", "157", "158", "159",
    ],
    plans: [
      {
        name: "Business Fiber 500",
        speed: "500 Mbps",
        price: "$49.99",
        features: ["Symmetrical speeds", "No data caps", "No contract required", "Free installation"],
      },
      {
        name: "Business Fiber 1 Gig",
        speed: "1 Gbps",
        price: "$74.99",
        features: ["Symmetrical speeds", "No data caps", "No contract required", "Free installation", "Static IP"],
        recommended: true,
      },
      {
        name: "Business Fiber 2 Gig",
        speed: "2 Gbps",
        price: "$149.99",
        features: ["Symmetrical speeds", "No data caps", "No contract required", "Premium support"],
      },
    ],
  },
  {
    id: "natural-wireless",
    name: "Natural Wireless",
    description: "Fixed wireless broadband for businesses in underserved areas with reliable connectivity.",
    technology: "Fixed Wireless",
    // Natural Wireless operates regionally — primarily in parts of NY, NJ, PA, and surrounding areas
    serviceableZipPrefixes: [
      // New York metro & Hudson Valley
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "120", "121", "122", "123", "124", "125", "126", "127", "128", "129",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Pennsylvania (eastern)
      "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
      "190", "191", "192", "193", "194", "195", "196",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
    ],
    plans: [
      {
        name: "Business Basic",
        speed: "25 Mbps",
        price: "$59.99",
        features: ["Low latency", "No data caps", "Quick installation", "Local support"],
      },
      {
        name: "Business Pro",
        speed: "50 Mbps",
        price: "$89.99",
        features: ["Low latency", "No data caps", "Quick installation", "Priority support"],
        recommended: true,
      },
      {
        name: "Business Premium",
        speed: "100 Mbps",
        price: "$129.99",
        features: ["Low latency", "No data caps", "Quick installation", "Dedicated account manager"],
      },
    ],
  },
  {
    id: "comcast",
    name: "Comcast Business",
    description: "Xfinity Business internet with a range of speeds and business-grade features.",
    technology: "Cable / Fiber",
    // Comcast/Xfinity serves large parts of: CA, CO, CT, DE, FL, GA, IL, IN, KS, KY, MA, MD, ME, MI, MN, MO, MS, NH, NJ, NM, OR, PA, SC, TN, TX, UT, VA, VT, WA, WI
    serviceableZipPrefixes: [
      // California (Bay Area, Sacramento, Central Coast)
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "920", "921", "922", "923", "924", "925", "926", "927", "928",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      // Colorado
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // Delaware
      "197", "198", "199",
      // Florida (parts)
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
      // Georgia
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Illinois
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614", "615", "616",
      // Indiana (partial)
      "460", "461", "462", "463", "464", "465", "466", "467",
      // Massachusetts
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024", "025", "026", "027",
      // Maryland
      "206", "207", "208", "209", "210", "211", "212", "214", "215", "216",
      // Michigan (partial — Detroit metro)
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      // Minnesota (Twin Cities)
      "550", "551", "553", "554", "555",
      // New Hampshire
      "030", "031", "032", "033", "034", "035", "036", "037", "038",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // New Mexico (Albuquerque)
      "870", "871",
      // Oregon
      "970", "971", "972", "973", "974",
      // Pennsylvania
      "150", "151", "152", "153", "154", "155", "156", "157", "158", "159",
      "160", "161", "162", "163", "164", "165", "166", "167", "168", "169",
      "170", "171", "172", "173", "174", "175", "176", "177", "178", "179",
      "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
      "190", "191", "192", "193", "194", "195", "196",
      // South Carolina (partial)
      "290", "291", "292", "293", "294",
      // Tennessee (partial)
      "370", "371", "372", "373",
      // Texas (Houston metro)
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      // Utah
      "840", "841", "842", "843", "844", "845",
      // Virginia (partial)
      "220", "221", "222", "223", "224", "225", "226", "227",
      // Vermont
      "050", "051", "052", "053", "054", "056", "057",
      // Washington state
      "980", "981", "982", "983", "984", "985", "986",
      // Wisconsin (partial)
      "530", "531", "532", "534", "535",
    ],
    plans: [
      {
        name: "Business Internet Starter",
        speed: "200 Mbps",
        price: "$49.99",
        features: ["Business-grade WiFi", "Security Edge included", "24/7 support", "No data caps"],
      },
      {
        name: "Business Internet Standard",
        speed: "400 Mbps",
        price: "$69.99",
        features: ["Business-grade WiFi", "Security Edge included", "24/7 support", "No data caps", "Static IP"],
        recommended: true,
      },
      {
        name: "Business Internet Premium",
        speed: "800 Mbps",
        price: "$99.99",
        features: ["Business-grade WiFi", "Security Edge included", "24/7 support", "No data caps", "Static IP", "Advanced cybersecurity"],
      },
    ],
  },
  {
    id: "optimum",
    name: "Optimum Business",
    description: "Business internet with competitive speeds and bundling options in the Northeast.",
    technology: "Cable / Fiber",
    // Optimum (Altice USA) serves: NY (tristate), NJ, CT, PA (limited), and parts of NC, WV
    serviceableZipPrefixes: [
      // New York — Long Island, Westchester, Hudson Valley, NYC boroughs
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // Pennsylvania (NE — Scranton/Wilkes-Barre area)
      "180", "181", "182", "183", "184", "185", "186", "187", "188",
      // North Carolina (parts — Raleigh/Durham)
      "270", "271", "272", "273", "274", "275", "276", "277",
      // West Virginia (eastern panhandle)
      "254", "255", "256", "257", "258",
    ],
    plans: [
      {
        name: "Business Internet 300",
        speed: "300 Mbps",
        price: "$39.99",
        features: ["No data caps", "Free installation", "Smart WiFi", "24/7 support"],
      },
      {
        name: "Business Internet 500",
        speed: "500 Mbps",
        price: "$59.99",
        features: ["No data caps", "Free installation", "Smart WiFi", "24/7 support", "Static IP available"],
        recommended: true,
      },
      {
        name: "Business Internet 1 Gig",
        speed: "1 Gbps",
        price: "$79.99",
        features: ["No data caps", "Free installation", "Smart WiFi Pro", "Priority support", "Static IP included"],
      },
    ],
  },
  {
    id: "verizon",
    name: "Verizon Business",
    description: "Fios business internet with symmetrical upload and download speeds on a 100% fiber network.",
    technology: "Fiber",
    // Verizon Fios serves: parts of NY, NJ, CT, PA, MD, DC, VA, MA, RI, DE
    serviceableZipPrefixes: [
      // New York City & suburbs
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117",
      // New Jersey (extensive coverage)
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Connecticut (partial — Fairfield County)
      "060", "061", "068", "069",
      // Pennsylvania (Philly metro)
      "190", "191", "192", "193", "194", "195", "196",
      // Maryland
      "206", "207", "208", "209", "210", "211", "212", "214",
      // DC
      "200", "201", "202", "203", "204", "205",
      // Virginia (Northern VA, Hampton Roads)
      "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
      "230", "231", "232", "233", "234", "235", "236",
      // Massachusetts (Boston metro)
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      // Rhode Island
      "028", "029",
      // Delaware
      "197", "198", "199",
    ],
    plans: [
      {
        name: "Fios Business 300",
        speed: "300/300 Mbps",
        price: "$69.99",
        features: ["Symmetrical speeds", "No data caps", "Business-grade router", "24/7 tech support"],
      },
      {
        name: "Fios Business 500",
        speed: "500/500 Mbps",
        price: "$89.99",
        features: ["Symmetrical speeds", "No data caps", "Business-grade router", "24/7 tech support", "Static IP"],
        recommended: true,
      },
      {
        name: "Fios Business Gig",
        speed: "940/880 Mbps",
        price: "$119.99",
        features: ["Near-symmetrical speeds", "No data caps", "Premium router", "Priority support", "Static IP included"],
      },
    ],
  },
  {
    id: "crown-castle",
    name: "Crown Castle Fiber",
    description: "Enterprise-class dedicated fiber internet access with guaranteed bandwidth, low latency, and scalable speeds for mission-critical business applications.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    // Crown Castle fiber footprint covers major metros across ~40 states — focusing on top metro areas
    serviceableZipPrefixes: [
      // New York metro
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Los Angeles / Southern CA
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      // San Francisco / Bay Area
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      // Houston
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      // Dallas / Fort Worth
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763",
      // Chicago
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      // Philadelphia
      "190", "191", "192", "193", "194", "195", "196",
      // Washington DC / Northern VA / MD
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      "220", "221", "222", "223", "224", "225",
      // Atlanta
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Boston
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      // Denver
      "800", "801", "802", "803", "804", "805",
      // Charlotte
      "280", "281", "282", "283", "284",
      // Minneapolis
      "550", "551", "553", "554", "555",
      // Phoenix
      "850", "851", "852", "853",
      // Seattle
      "980", "981", "982", "983", "984",
      // Detroit
      "480", "481", "482", "483", "484", "485",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$299",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router included",
        ],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$599",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router included",
          "Static IP block",
        ],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$899",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router included",
          "Static IP block",
          "Proactive fault detection",
        ],
      },
      {
        name: "DIA 10 Gig",
        speed: "10 Gbps",
        price: "Custom",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Fully managed service",
          "Large IP block",
          "Dedicated account team",
        ],
      },
    ],
  },
  {
    id: "lumen",
    name: "Lumen (CenturyLink)",
    description: "Enterprise-grade dedicated internet access on one of the world's largest fiber networks, with 450,000+ route miles and connections to 6,500+ third-party data centers.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    // Lumen has one of the largest fiber footprints in the US — legacy CenturyLink + Level 3
    serviceableZipPrefixes: [
      // New York metro
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Los Angeles / Southern CA
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "920", "921", "922", "923", "924", "925",
      // San Francisco / Bay Area
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      // Houston
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      // Dallas / Fort Worth
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765",
      // Chicago
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614",
      // Philadelphia
      "190", "191", "192", "193", "194", "195", "196",
      // Washington DC / Northern VA / MD
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212", "214",
      "220", "221", "222", "223", "224", "225", "226", "227",
      // Atlanta
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Boston
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      // Denver / Colorado
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      // Phoenix / Arizona
      "850", "851", "852", "853", "855", "856", "857",
      // Seattle / Washington
      "980", "981", "982", "983", "984", "985", "986",
      // Minneapolis / Minnesota
      "550", "551", "553", "554", "555", "556", "557",
      // Detroit / Michigan
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      // Portland / Oregon
      "970", "971", "972", "973", "974",
      // Charlotte / NC
      "280", "281", "282", "283", "284", "285",
      // Tampa / Florida
      "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
      // Ohio — Columbus, Cleveland, Cincinnati
      "430", "431", "432", "433", "434", "435",
      "440", "441", "442", "443", "444", "445",
      "450", "451", "452", "453",
      // Missouri — St. Louis, Kansas City
      "630", "631", "633", "634", "635", "636",
      "640", "641", "644", "645",
      // Indiana — Indianapolis
      "460", "461", "462", "463", "464", "465", "466", "467",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // Utah — Salt Lake City
      "840", "841", "842", "843", "844",
      // Nevada — Las Vegas
      "889", "890", "891", "893",
      // Tennessee — Nashville
      "370", "371", "372", "373",
      // Louisiana — New Orleans, Baton Rouge
      "700", "701", "703", "704", "705", "706", "707", "708",
      // Wisconsin — Milwaukee
      "530", "531", "532",
      // Alabama — Birmingham
      "350", "351", "352",
      // Nebraska — Omaha
      "680", "681", "683",
      // Kansas — Kansas City area
      "660", "661", "662",
    ],
    plans: [
      {
        name: "DIA 50",
        speed: "50 Mbps",
        price: "$249",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.95% uptime SLA",
          "24/7 tech support",
          "IPv4 & IPv6 support",
        ],
      },
      {
        name: "DIA 200",
        speed: "200 Mbps",
        price: "$449",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router option",
          "Static IP block",
        ],
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$799",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router included",
          "Static IP block",
          "DDoS mitigation included",
        ],
        recommended: true,
      },
      {
        name: "DIA 10 Gig",
        speed: "10 Gbps",
        price: "Custom",
        features: [
          "Dedicated symmetrical bandwidth",
          "99.999% uptime SLA",
          "Proactive network monitoring",
          "Fully managed CPE",
          "Enterprise DDoS protection",
          "Dedicated account team",
        ],
      },
    ],
  },
  {
    id: "zayo",
    name: "Zayo Group",
    description: "One of the largest independent fiber providers with 17+ million fiber miles, offering dedicated internet, dark fiber, and wavelength services for businesses of all sizes.",
    technology: "Dedicated Fiber / Dark Fiber",
    dedicatedFiber: true,
    // Zayo has extensive metro and long-haul fiber across 50+ US markets
    serviceableZipPrefixes: [
      // New York metro
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      // New Jersey
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Los Angeles / Southern CA
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      // San Francisco / Bay Area
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      // Houston
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      // Dallas / Fort Worth
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761",
      // Chicago
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      // Philadelphia
      "190", "191", "192", "193", "194", "195", "196",
      // Washington DC / Northern VA / MD
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      "220", "221", "222", "223", "224", "225",
      // Atlanta
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Boston
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      // Denver / Boulder (Zayo HQ area)
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      // Phoenix
      "850", "851", "852", "853",
      // Seattle
      "980", "981", "982", "983", "984", "985",
      // Minneapolis
      "550", "551", "553", "554", "555",
      // Detroit
      "480", "481", "482", "483", "484", "485",
      // Portland
      "970", "971", "972", "973",
      // Charlotte
      "280", "281", "282", "283",
      // Tampa / Miami / FL
      "330", "331", "332", "333", "334", "335",
      // Ohio — Columbus, Cleveland
      "430", "431", "432", "433", "434",
      "440", "441", "442", "443", "444",
      // Indianapolis
      "460", "461", "462", "463", "464", "465",
      // Connecticut
      "060", "061", "062", "063", "064", "065",
      // St. Louis
      "630", "631", "633",
      // Salt Lake City
      "840", "841", "842", "843",
      // Las Vegas
      "889", "890", "891",
      // Nashville
      "370", "371", "372",
      // Pennsylvania (eastern)
      "180", "181", "182", "183", "184", "185", "186",
      // Kansas City
      "660", "661", "662",
      // Sacramento
      "956", "957", "958",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$349",
        features: [
          "Dedicated symmetrical fiber",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "IPv4 & IPv6 support",
        ],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$649",
        features: [
          "Dedicated symmetrical fiber",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router option",
          "Static IP block",
        ],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$949",
        features: [
          "Dedicated symmetrical fiber",
          "99.99% uptime SLA",
          "24/7 NOC monitoring",
          "Managed router included",
          "Static IP block",
          "DDoS mitigation",
        ],
      },
      {
        name: "Dark Fiber",
        speed: "Unlimited",
        price: "Custom",
        features: [
          "Unlit fiber pairs for your own equipment",
          "Full control over bandwidth",
          "Long-term lease options",
          "Scalable to 100G+ with your optics",
          "Ideal for data center interconnects",
        ],
      },
    ],
  },
];

// Spectrum Business serviceable zip code prefixes (first 3 digits)
export const spectrumServiceableZipPrefixes = [
  // New York
  "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
  "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
  "120", "121", "122", "123", "124", "125", "126", "127", "128", "129",
  "130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
  "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  // California
  "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
  "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
  "920", "921", "922", "923", "924", "925", "926", "927", "928", "930",
  "931", "932", "933", "934", "935", "936", "937", "938", "939", "940",
  "941", "942", "943", "944", "945", "946", "947", "948", "949", "950",
  "951", "952", "953", "954", "955", "956", "957", "958", "959", "960", "961",
  // Texas
  "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
  "760", "761", "762", "763", "764", "765", "766", "767", "768", "769",
  "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
  "780", "781", "782", "783", "784", "785", "786", "787", "788", "789",
  "790", "791", "792", "793", "794", "795", "796", "797", "798", "799",
  // Ohio
  "430", "431", "432", "433", "434", "435", "436", "437", "438", "439",
  "440", "441", "442", "443", "444", "445", "446", "447", "448", "449",
  "450", "451", "452", "453", "454", "455", "456", "457", "458",
  // Florida
  "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
  "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
  "340", "341", "342", "344", "346", "347", "349",
  // North Carolina
  "270", "271", "272", "273", "274", "275", "276", "277", "278", "279",
  "280", "281", "282", "283", "284", "285", "286", "287", "288", "289",
  // Wisconsin
  "530", "531", "532", "534", "535", "537", "538", "539", "540", "541",
  "542", "543", "544", "545", "546", "547", "548", "549",
  // Kentucky
  "400", "401", "402", "403", "404", "405", "406", "407", "408", "409",
  "410", "411", "412", "413", "414", "415", "416", "417", "418",
  // Connecticut
  "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
  // Massachusetts
  "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
  "020", "021", "022", "023", "024", "025", "026", "027",
  // Georgia
  "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
  "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
  // Indiana
  "460", "461", "462", "463", "464", "465", "466", "467", "468", "469",
  "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
  // Tennessee
  "370", "371", "372", "373", "374", "376", "377", "378", "379", "380",
  "381", "382", "383", "384", "385",
  // Missouri
  "630", "631", "633", "634", "635", "636", "637", "638", "639", "640",
  "641", "644", "645", "646", "647", "648", "649", "650", "651", "652",
  "653", "654", "655", "656", "657", "658",
  // South Carolina
  "290", "291", "292", "293", "294", "295", "296", "297", "298", "299",
  // Alabama
  "350", "351", "352", "354", "355", "356", "357", "358", "359", "360",
  "361", "362", "363", "364", "365", "366", "367", "368", "369",
  // Colorado
  "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
  "810", "811", "812", "813", "814", "815", "816",
  // Louisiana
  "700", "701", "703", "704", "705", "706", "707", "708", "710", "711", "712", "713", "714",
  // Minnesota
  "550", "551", "553", "554", "555", "556", "557", "558", "559", "560",
  "561", "562", "563", "564", "565", "566", "567",
  // Mississippi
  "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397",
  // Virginia
  "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
  "230", "231", "232", "233", "234", "235", "236", "237", "238", "239",
  "240", "241", "242", "243", "244", "245", "246",
  // West Virginia
  "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
  "257", "258", "259", "260", "261", "262", "263", "264", "265", "266", "267", "268",
  // Washington state
  "980", "981", "982", "983", "984", "985", "986", "988", "989", "990", "991", "992", "993", "994",
  // Oregon
  "970", "971", "972", "973", "974", "975", "976", "977", "978", "979",
  // Pennsylvania
  "150", "151", "152", "153", "154", "155", "156", "157", "158", "159",
  "160", "161", "162", "163", "164", "165", "166", "167", "168", "169",
  "170", "171", "172", "173", "174", "175", "176", "177", "178", "179",
  "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
  "190", "191", "192", "193", "194", "195", "196",
  // New Jersey
  "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
  "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
  // Michigan
  "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
  "490", "491", "492", "493", "494", "495", "496", "497", "498", "499",
  // Nebraska
  "680", "681", "683", "684", "685", "686", "687", "688", "689", "690", "691", "692", "693",
  // Hawaii
  "967", "968",
  // Arizona
  "850", "851", "852", "853", "855", "856", "857", "859", "860", "863", "864", "865",
  // Nevada
  "889", "890", "891", "893", "894", "895", "897", "898",
  // Maine
  "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049",
  // Vermont
  "050", "051", "052", "053", "054", "056", "057", "058", "059",
  // New Hampshire
  "030", "031", "032", "033", "034", "035", "036", "037", "038",
  // Maryland
  "206", "207", "208", "209", "210", "211", "212", "214", "215", "216", "217", "218", "219",
  // Kansas
  "660", "661", "662", "664", "665", "666", "667", "668", "669", "670",
  "671", "672", "673", "674", "675", "676", "677", "678", "679",
  // Idaho
  "832", "833", "834", "835", "836", "837", "838",
  // Montana
  "590", "591", "592", "593", "594", "595", "596", "597", "598", "599",
  // South Dakota
  "570", "571", "572", "573", "574", "575", "576", "577",
  // Wyoming
  "820", "821", "822", "823", "824", "825", "826", "827", "828", "829", "831",
  // New Mexico
  "870", "871", "872", "873", "874", "875", "877", "878", "879", "880", "881", "882", "883", "884",
  // Illinois
  "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
  "610", "611", "612", "613", "614", "615", "616", "617", "618", "619",
  "620", "622", "623", "624", "625", "626", "627", "628", "629",
];

/** The Spectrum provider object — treated like any other provider but flagged as preferred */
export const spectrumProvider: InternetProvider = {
  id: "spectrum",
  name: "Spectrum Business",
  description: "Fast, reliable cable internet with no data caps, free modem, and 24/7 U.S.-based support.",
  technology: "Cable / Fiber",
  serviceableZipPrefixes: spectrumServiceableZipPrefixes,
  plans: spectrumPlans,
};

/** Check if Spectrum services a given zip code */
export function checkSpectrumAvailability(zipCode: string): boolean {
  const prefix = zipCode.substring(0, 3);
  return spectrumServiceableZipPrefixes.includes(prefix);
}

/** Check if a specific provider services a given zip code */
export function checkProviderAvailability(provider: InternetProvider, zipCode: string): boolean {
  if (provider.nationwide) return true;
  if (!provider.serviceableZipPrefixes) return false;
  const prefix = zipCode.substring(0, 3);
  return provider.serviceableZipPrefixes.includes(prefix);
}

/** Get all available alternative providers for a zip code (excludes Spectrum) */
export function getAvailableProviders(zipCode: string): InternetProvider[] {
  return alternativeProviders.filter((provider) =>
    checkProviderAvailability(provider, zipCode)
  );
}

export interface AvailabilityResult {
  spectrumAvailable: boolean;
  allProviders: InternetProvider[];
}

/** Get ALL available providers for a zip code, with Spectrum first when available */
export function getAllAvailableProviders(zipCode: string): AvailabilityResult {
  const spectrumAvailable = checkSpectrumAvailability(zipCode);
  const otherProviders = getAvailableProviders(zipCode);

  const allProviders: InternetProvider[] = [];
  if (spectrumAvailable) {
    allProviders.push(spectrumProvider);
  }
  allProviders.push(...otherProviders);

  return { spectrumAvailable, allProviders };
}

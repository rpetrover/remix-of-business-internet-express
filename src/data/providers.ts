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

// ─── Spectrum (Preferred Partner) ────────────────────────────────────────────

export const spectrumPlans: InternetPlan[] = [
  {
    name: "Internet Premier",
    speed: "500 Mbps",
    price: "$65.00",
    features: [
      "No data caps",
      "Free modem",
      "$99 standard installation",
      "24/7 U.S.-based support",
      "Static IP available ($20/mo)",
    ],
  },
  {
    name: "Internet Ultra",
    speed: "750 Mbps",
    price: "$95.00",
    features: [
      "No data caps",
      "Free modem",
      "$99 standard installation",
      "24/7 U.S.-based support",
      "Static IP available ($20/mo)",
      "Free Business WiFi included",
    ],
    recommended: true,
  },
  {
    name: "Internet Gig",
    speed: "1 Gbps",
    price: "$115.00",
    features: [
      "No data caps",
      "Free modem",
      "$99 standard installation",
      "24/7 U.S.-based support",
      "Static IP available ($20/mo)",
      "Free Business WiFi included",
    ],
  },
];

// ─── Broadband Providers ─────────────────────────────────────────────────────

export const alternativeProviders: InternetProvider[] = [
  // --- Satellite (Nationwide) ---
  {
    id: "viasat",
    name: "Viasat",
    logo: "/logos/viasat.png",
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

  // --- AT&T Business ---
  {
    id: "att",
    name: "AT&T Business",
    logo: "/logos/att.png",
    description: "AT&T Business Internet delivers fiber and IPBB internet with dedicated business support across 21 states.",
    technology: "Fiber / IPBB",
    serviceableZipPrefixes: [
      // California
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "920", "921", "922", "923", "924", "925", "926", "927", "928",
      "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
      // Texas
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765", "766", "767", "768", "769",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "780", "781", "782", "783", "784", "785", "786", "787", "788", "789",
      "790", "791", "792", "793", "794", "795", "796", "797", "798", "799",
      // Georgia
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
      // Florida
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
      // Illinois
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614", "615", "616", "617", "618", "619",
      // Ohio
      "430", "431", "432", "433", "434", "435", "436", "437", "438", "439",
      "440", "441", "442", "443", "444", "445", "446", "447", "448", "449",
      "450", "451", "452", "453",
      // Michigan
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      // Indiana
      "460", "461", "462", "463", "464", "465", "466", "467", "468", "469",
      "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
      // Wisconsin
      "530", "531", "532", "534", "535", "537", "538", "539",
      // Missouri
      "630", "631", "633", "634", "635", "636", "637", "638", "639",
      "640", "641", "644", "645",
      // Alabama
      "350", "351", "352", "354", "355", "356", "357", "358", "359",
      "360", "361", "362", "363", "364", "365", "366", "367", "368", "369",
      // Tennessee
      "370", "371", "372", "373", "374", "376", "377", "378", "379",
      "380", "381", "382", "383", "384", "385",
      // Kentucky
      "400", "401", "402", "403", "404", "405", "406", "407", "408", "409",
      "410", "411", "412", "413", "414", "415", "416", "417", "418",
      // Mississippi
      "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397",
      // Louisiana
      "700", "701", "703", "704", "705", "706", "707", "708", "710", "711", "712", "713", "714",
      // Arkansas
      "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729",
      // Kansas
      "660", "661", "662", "664", "665", "666", "667", "668", "669",
      // Oklahoma
      "730", "731", "734", "735", "736", "737", "738", "739", "740", "741", "743", "744", "745", "746", "747", "748", "749",
      // Nevada
      "889", "890", "891", "893", "894", "895",
      // North Carolina
      "270", "271", "272", "273", "274", "275", "276", "277", "278", "279",
      // South Carolina
      "290", "291", "292", "293", "294", "295", "296",
    ],
    plans: [
      {
        name: "AT&T Business Internet 100",
        speed: "100 Mbps",
        price: "$40.00",
        features: ["No annual contract", "AT&T ActiveArmor security", "24/7 support", "Free equipment"],
      },
      {
        name: "AT&T Business Fiber 500",
        speed: "500 Mbps",
        price: "$55.00",
        features: ["Symmetrical fiber speeds", "AT&T ActiveArmor security", "24/7 support", "Static IP available"],
        recommended: true,
      },
      {
        name: "AT&T Business Fiber 1 Gig",
        speed: "1 Gbps",
        price: "$80.00",
        features: ["Symmetrical fiber speeds", "AT&T ActiveArmor security", "24/7 support", "Static IP included", "Wi-Fi gateway included"],
      },
    ],
  },

  // --- Cox Business ---
  {
    id: "cox",
    name: "Cox Business",
    logo: "/logos/cox.png",
    description: "Cox Business provides reliable cable and fiber internet with a range of business-grade solutions and bundled services.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      // Arizona (Phoenix, Tucson, Scottsdale)
      "850", "851", "852", "853", "855", "856", "857",
      // California (Orange County, San Diego, Santa Barbara)
      "900", "901", "902", "903", "904", "906", "920", "921", "922",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // Florida (Pensacola, Gainesville, Ocala, Fort Myers)
      "324", "325", "326", "327", "335", "336", "337", "338", "339",
      // Georgia (Atlanta suburbs)
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Idaho (Boise)
      "836", "837",
      // Iowa (Omaha metro)
      "510", "511", "512", "513", "514", "515", "516",
      // Kansas (Wichita, Topeka)
      "660", "661", "662", "664", "665", "666", "667", "670", "671", "672",
      // Louisiana (Baton Rouge, Lafayette, New Orleans)
      "700", "701", "703", "704", "705", "706", "707", "708",
      // Nebraska (Omaha)
      "680", "681", "683", "684", "685",
      // Nevada (Las Vegas)
      "889", "890", "891", "893",
      // North Carolina (Raleigh area)
      "270", "271", "272", "273", "274", "275", "276",
      // Ohio (Cleveland)
      "440", "441", "442", "443", "444",
      // Oklahoma (OKC, Tulsa)
      "730", "731", "734", "735", "736", "737", "738", "739", "740", "741",
      // Rhode Island
      "028", "029",
      // Virginia (Hampton Roads, Northern VA)
      "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
      "230", "231", "232", "233", "234", "235", "236",
    ],
    plans: [
      {
        name: "Cox Business Internet 100",
        speed: "100 Mbps",
        price: "$59.99",
        features: ["Business-grade reliability", "24/7 support", "Free security suite", "No annual contract option"],
      },
      {
        name: "Cox Business Internet 250",
        speed: "250 Mbps",
        price: "$79.99",
        features: ["Business-grade reliability", "24/7 support", "Free security suite", "Static IP included"],
        recommended: true,
      },
      {
        name: "Cox Business Internet 500",
        speed: "500 Mbps",
        price: "$99.99",
        features: ["Business-grade reliability", "24/7 support", "Free security suite", "Static IP included", "Priority support"],
      },
    ],
  },

  // --- Breezeline ---
  {
    id: "breezeline",
    name: "Breezeline",
    logo: "/logos/breezeline.png",
    description: "Formerly Atlantic Broadband, Breezeline offers reliable cable internet for businesses across the eastern United States.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      // Maine
      "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049",
      // New Hampshire
      "030", "031", "032", "033", "034", "035", "036", "037", "038",
      // Maryland (western/eastern shore)
      "206", "207", "208", "209", "214", "215", "216", "217", "218", "219",
      // Ohio
      "430", "431", "432", "433", "434", "435", "436", "437",
      // Pennsylvania
      "150", "151", "152", "153", "154", "155", "156", "157", "158", "159",
      // South Carolina (Myrtle Beach area)
      "295", "296", "297", "298", "299",
      // West Virginia
      "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
      "257", "258", "259", "260", "261", "262", "263", "264", "265", "266",
      // Virginia
      "237", "238", "239", "240", "241", "242", "243",
    ],
    plans: [
      {
        name: "Breezeline Business 200",
        speed: "200 Mbps",
        price: "$49.99",
        features: ["No data caps", "Business-grade WiFi", "24/7 support", "Free installation"],
      },
      {
        name: "Breezeline Business 500",
        speed: "500 Mbps",
        price: "$69.99",
        features: ["No data caps", "Business-grade WiFi", "24/7 support", "Static IP available"],
        recommended: true,
      },
      {
        name: "Breezeline Business Gig",
        speed: "1 Gbps",
        price: "$99.99",
        features: ["No data caps", "Business-grade WiFi", "Priority support", "Static IP included"],
      },
    ],
  },

  // --- Astound Business Solutions ---
  {
    id: "astound",
    name: "Astound Business Solutions",
    logo: "/logos/astound.png",
    description: "Astound Business offers high-speed cable and fiber internet with enterprise-class reliability in select metro markets.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      // California — Bay Area (RCN/Wave footprint)
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      // Chicago area (RCN)
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      // Washington DC area (RCN)
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209",
      // New York City/NJ (RCN)
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112",
      "070", "071", "072", "073", "074", "075", "076",
      // Texas — Dallas/Fort Worth (Grande/Wave)
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      // Pennsylvania — Philly area (RCN)
      "190", "191", "192", "193", "194", "195",
      // Massachusetts — Boston area (RCN)
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      // Oregon/Washington (Wave)
      "970", "971", "972", "973", "974",
      "980", "981", "982", "983", "984", "985", "986",
    ],
    plans: [
      {
        name: "Business Internet 300",
        speed: "300 Mbps",
        price: "$49.99",
        features: ["No data caps", "Business-grade reliability", "24/7 support", "Free modem"],
      },
      {
        name: "Business Internet 600",
        speed: "600 Mbps",
        price: "$69.99",
        features: ["No data caps", "Business-grade reliability", "24/7 support", "Static IP option"],
        recommended: true,
      },
      {
        name: "Business Internet 1 Gig",
        speed: "1 Gbps",
        price: "$89.99",
        features: ["No data caps", "Business-grade reliability", "Priority support", "Static IP included"],
      },
    ],
  },

  // --- Mediacom Business ---
  {
    id: "mediacom",
    name: "Mediacom Business",
    logo: "/logos/mediacom.png",
    description: "Mediacom Business provides cable internet to businesses in smaller cities and rural markets across the Midwest and South.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      // Iowa
      "500", "501", "502", "503", "504", "505", "506", "507", "508", "509",
      "510", "511", "512", "513", "514", "515", "516", "520", "521", "522", "523", "524", "525", "526", "527", "528",
      // Illinois (downstate/rural)
      "615", "616", "617", "618", "619", "620", "622", "623", "624", "625", "626", "627", "628", "629",
      // Indiana (southern)
      "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
      // Georgia (southern/rural)
      "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
      // Alabama (northern)
      "354", "355", "356", "357", "358", "359",
      // Mississippi
      "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397",
      // Minnesota (southern/central)
      "556", "557", "558", "559", "560", "561", "562",
      // Missouri (rural)
      "646", "647", "648", "649", "650", "651", "652", "653", "654", "655", "656", "657", "658",
      // South Dakota
      "570", "571", "572", "573", "574", "575", "576", "577",
      // Arizona (Flagstaff, Lake Havasu)
      "855", "856", "857", "859", "860",
    ],
    plans: [
      {
        name: "Business Internet 100",
        speed: "100 Mbps",
        price: "$69.99",
        features: ["Business-grade reliability", "24/7 tech support", "Free installation", "No contract required"],
      },
      {
        name: "Business Internet 300",
        speed: "300 Mbps",
        price: "$89.99",
        features: ["Business-grade reliability", "24/7 tech support", "Free installation", "Static IP available"],
        recommended: true,
      },
      {
        name: "Business Internet 1 Gig",
        speed: "1 Gbps",
        price: "$129.99",
        features: ["Business-grade reliability", "Priority support", "Free installation", "Static IP included"],
      },
    ],
  },

  // --- Metronet Business ---
  {
    id: "metronet",
    name: "Metronet Business",
    logo: "/logos/metronet.png",
    description: "Metronet delivers 100% fiber-optic internet to businesses with symmetrical speeds and no data caps across the Midwest and Southeast.",
    technology: "Fiber",
    serviceableZipPrefixes: [
      // Indiana
      "460", "461", "462", "463", "464", "465", "466", "467", "468", "469",
      "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
      // Illinois
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      // Iowa
      "500", "501", "502", "503", "504", "505",
      // Kentucky
      "400", "401", "402", "403", "404", "405", "406", "407",
      // Michigan
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      // Minnesota
      "550", "551", "553", "554", "555", "556",
      // Ohio
      "430", "431", "432", "433", "434", "435", "436", "437",
      "440", "441", "442", "443", "444", "445",
      "450", "451", "452", "453",
      // Wisconsin
      "530", "531", "532", "534", "535",
      // Florida (expanding)
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "340", "341", "342",
      // Virginia
      "220", "221", "222", "223", "224", "225", "226", "227",
      // North Carolina
      "270", "271", "272", "273", "274", "275", "276", "277", "278",
      // Texas (expanding — Dallas area)
      "750", "751", "752", "753", "754", "755", "756", "757",
    ],
    plans: [
      {
        name: "Business Fiber 200",
        speed: "200 Mbps",
        price: "$49.95",
        features: ["100% fiber", "Symmetrical speeds", "No data caps", "No contracts"],
      },
      {
        name: "Business Fiber 500",
        speed: "500 Mbps",
        price: "$69.95",
        features: ["100% fiber", "Symmetrical speeds", "No data caps", "Static IP available"],
        recommended: true,
      },
      {
        name: "Business Fiber 1 Gig",
        speed: "1 Gbps",
        price: "$89.95",
        features: ["100% fiber", "Symmetrical speeds", "No data caps", "Static IP included", "Priority support"],
      },
    ],
  },

  // --- Fidium Fiber (Consolidated Communications) ---
  {
    id: "fidium",
    name: "Fidium Fiber",
    logo: "/logos/fidium.png",
    description: "Fidium Fiber by Consolidated Communications brings all-fiber internet to businesses with symmetrical speeds in northern New England and select markets.",
    technology: "Fiber",
    serviceableZipPrefixes: [
      // Maine
      "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049",
      // New Hampshire
      "030", "031", "032", "033", "034", "035", "036", "037", "038",
      // Vermont
      "050", "051", "052", "053", "054", "056", "057",
      // Minnesota (southern)
      "556", "557", "558", "559", "560", "561", "562",
      // Texas (eastern)
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      // Illinois (central/southern)
      "615", "616", "617", "618", "619", "620", "622", "623", "624", "625",
      // California (inland, ex-SureWest)
      "956", "957", "958",
    ],
    plans: [
      {
        name: "Fidium 500",
        speed: "500 Mbps",
        price: "$55.00",
        features: ["Symmetrical fiber speeds", "No data caps", "No contracts", "Free installation"],
      },
      {
        name: "Fidium 1 Gig",
        speed: "1 Gbps",
        price: "$70.00",
        features: ["Symmetrical fiber speeds", "No data caps", "No contracts", "Free whole-home WiFi"],
        recommended: true,
      },
      {
        name: "Fidium 2 Gig",
        speed: "2 Gbps",
        price: "$95.00",
        features: ["Symmetrical fiber speeds", "No data caps", "No contracts", "Premium WiFi included", "Priority support"],
      },
    ],
  },

  // --- Frontier ---
  {
    id: "frontier",
    name: "Frontier Internet",
    logo: "/logos/frontier.png",
    description: "Fiber and DSL internet options for businesses with competitive pricing.",
    technology: "Fiber / DSL",
    serviceableZipPrefixes: [
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
      "257", "258", "259", "260", "261", "262", "263", "264", "265", "266",
      "460", "461", "462", "463", "464", "465", "466", "467", "468", "469",
      "470", "471", "472", "473", "474", "475", "476", "477", "478", "479",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614", "615", "616", "617", "618", "619",
      "430", "431", "432", "433", "434", "435", "436", "437", "438", "439",
      "440", "441", "442", "443", "444", "445", "446", "447", "448", "449",
      "530", "531", "532", "534", "535", "537", "538", "539",
      "550", "551", "553", "554", "556", "557", "558", "559",
      "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
      "950", "951", "952", "953", "954", "955", "956", "957", "958", "959",
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "340", "341", "342", "344",
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765", "766", "767", "768", "769",
      "850", "851", "852", "853", "855", "856", "857",
      "889", "890", "891", "893", "894", "895",
      "870", "871", "872", "873", "874", "875", "877",
      "840", "841", "842", "843", "844", "845", "846", "847",
      "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
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

  // --- Natural Wireless ---
  {
    id: "natural-wireless",
    name: "Natural Wireless",
    logo: "/logos/natural-wireless.png",
    description: "Fixed wireless broadband for businesses in underserved areas with reliable connectivity.",
    technology: "Fixed Wireless",
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "120", "121", "122", "123", "124", "125", "126", "127", "128", "129",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
      "190", "191", "192", "193", "194", "195", "196",
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

  // --- Comcast Business ---
  {
    id: "comcast",
    name: "Comcast Business",
    logo: "/logos/comcast.png",
    description: "Xfinity Business internet with a range of speeds and business-grade features.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "920", "921", "922", "923", "924", "925", "926", "927", "928",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      "197", "198", "199",
      "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
      "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614", "615", "616",
      "460", "461", "462", "463", "464", "465", "466", "467",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024", "025", "026", "027",
      "206", "207", "208", "209", "210", "211", "212", "214", "215", "216",
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      "550", "551", "553", "554", "555",
      "030", "031", "032", "033", "034", "035", "036", "037", "038",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "870", "871",
      "970", "971", "972", "973", "974",
      "150", "151", "152", "153", "154", "155", "156", "157", "158", "159",
      "160", "161", "162", "163", "164", "165", "166", "167", "168", "169",
      "170", "171", "172", "173", "174", "175", "176", "177", "178", "179",
      "180", "181", "182", "183", "184", "185", "186", "187", "188", "189",
      "190", "191", "192", "193", "194", "195", "196",
      "290", "291", "292", "293", "294",
      "370", "371", "372", "373",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "840", "841", "842", "843", "844", "845",
      "220", "221", "222", "223", "224", "225", "226", "227",
      "050", "051", "052", "053", "054", "056", "057",
      "980", "981", "982", "983", "984", "985", "986",
      "530", "531", "532", "534", "535",
    ],
    plans: [
      {
        name: "Business Internet Essential",
        speed: "150 Mbps",
        price: "$99.95",
        features: ["SecurityEdge available", "24/7 support", "No data caps", "$129.95 installation"],
      },
      {
        name: "Business Internet Standard",
        speed: "300 Mbps",
        price: "$149.95",
        features: ["SecurityEdge available", "24/7 support", "No data caps", "Static IP available ($34.95/mo)"],
      },
      {
        name: "Business Internet Performance",
        speed: "500 Mbps",
        price: "$199.95",
        features: ["SecurityEdge available", "24/7 support", "No data caps", "Static IP available ($34.95/mo)"],
        recommended: true,
      },
      {
        name: "Business Internet Advanced",
        speed: "800 Mbps",
        price: "$249.95",
        features: ["SecurityEdge available", "24/7 support", "No data caps", "Static IP available ($34.95/mo)", "WiFi Pro available"],
      },
      {
        name: "Business Internet Gigabit Extra",
        speed: "1.25 Gbps",
        price: "$399.95",
        features: ["SecurityEdge available", "24/7 support", "No data caps", "Static IP available ($34.95/mo)", "WiFi Pro available", "Connection Pro available"],
      },
    ],
  },

  // --- Optimum Business ---
  {
    id: "optimum",
    name: "Optimum Business",
    logo: "/logos/optimum.png",
    description: "Business internet with competitive speeds and bundling options in the Northeast.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085",
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      "180", "181", "182", "183", "184", "185", "186", "187", "188",
      "270", "271", "272", "273", "274", "275", "276", "277",
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

  // --- Verizon Business ---
  {
    id: "verizon",
    name: "Verizon Business",
    logo: "/logos/verizon.png",
    description: "Fios business internet with symmetrical upload and download speeds on a 100% fiber network.",
    technology: "Fiber",
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "060", "061", "068", "069",
      "190", "191", "192", "193", "194", "195", "196",
      "206", "207", "208", "209", "210", "211", "212", "214",
      "200", "201", "202", "203", "204", "205",
      "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
      "230", "231", "232", "233", "234", "235", "236",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      "028", "029",
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

  // --- Windstream (Kinetic) ---
  {
    id: "windstream",
    name: "Windstream Kinetic",
    logo: "/logos/windstream.png",
    description: "Windstream Kinetic Business provides fiber and DSL internet across 18 states with competitive speeds and bundled voice options.",
    technology: "Fiber / DSL",
    serviceableZipPrefixes: [
      // Arkansas
      "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729",
      // Georgia (rural/southern)
      "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
      // Iowa
      "500", "501", "502", "503", "504", "505", "506", "507", "508", "509",
      "510", "511", "512", "513", "514", "515", "516",
      // Kentucky
      "400", "401", "402", "403", "404", "405", "406", "407", "408", "409",
      "410", "411", "412", "413", "414", "415", "416", "417", "418",
      // Minnesota
      "556", "557", "558", "559", "560", "561", "562",
      // Missouri
      "646", "647", "648", "649", "650", "651", "652", "653", "654", "655", "656", "657", "658",
      // Nebraska
      "680", "681", "683", "684", "685", "686", "687", "688", "689",
      // New Mexico
      "870", "871", "872", "873", "874", "875", "877",
      // New York (upstate)
      "130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
      // North Carolina
      "270", "271", "272", "273", "274", "275", "276", "277", "278", "279",
      // Ohio (rural)
      "436", "437", "438", "439", "446", "447", "448", "449",
      // Oklahoma
      "730", "731", "734", "735", "736", "737", "738", "739", "740", "741",
      // Pennsylvania (rural)
      "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169",
      // South Carolina
      "295", "296", "297", "298", "299",
      // Texas (east)
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      // Alabama
      "354", "355", "356", "357", "358", "359", "360", "361", "362",
      // Mississippi
      "386", "387", "388", "389", "390", "391", "392", "393",
      // Florida (panhandle)
      "324", "325",
    ],
    plans: [
      {
        name: "Kinetic Business 200",
        speed: "200 Mbps",
        price: "$49.99",
        features: ["Business-grade reliability", "24/7 support", "No data caps", "Free installation"],
      },
      {
        name: "Kinetic Business 500",
        speed: "500 Mbps",
        price: "$69.99",
        features: ["Business-grade reliability", "24/7 support", "No data caps", "Static IP available"],
        recommended: true,
      },
      {
        name: "Kinetic Business 1 Gig",
        speed: "1 Gbps",
        price: "$89.99",
        features: ["Symmetrical fiber speeds", "24/7 support", "No data caps", "Static IP included", "Priority support"],
      },
    ],
  },

  // --- WOW Business ---
  {
    id: "wow",
    name: "WOW! Business",
    logo: "/logos/wow.png",
    description: "WOW! Business delivers reliable cable and fiber internet at competitive prices across select Midwest and Southeast markets.",
    technology: "Cable / Fiber",
    serviceableZipPrefixes: [
      // Alabama (Huntsville, Auburn, Montgomery, Dothan)
      "350", "351", "354", "355", "356", "360", "361", "362", "363",
      // Florida (Pinellas/Tampa area, Panama City)
      "335", "336", "337", "338", "339", "324",
      // Georgia (Columbus, Augusta, Savannah)
      "310", "311", "312", "313", "318", "319",
      // Illinois (Chicago suburbs, downstate)
      "600", "601", "602", "603", "604", "605", "606", "607", "608",
      // Indiana (Evansville, Fort Wayne)
      "470", "471", "472", "473", "467", "468",
      // Michigan (Detroit suburbs, Lansing, Grand Rapids)
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      "490", "491", "492", "493", "494", "495",
      // Ohio (Cleveland suburbs, Columbus)
      "430", "431", "432", "433", "434", "435",
      "440", "441", "442", "443", "444",
      // South Carolina (Charleston)
      "290", "291", "292", "293", "294",
      // Tennessee (Knoxville, Chattanooga)
      "370", "371", "372", "373", "374",
    ],
    plans: [
      {
        name: "WOW! Business 200",
        speed: "200 Mbps",
        price: "$49.99",
        features: ["No data caps", "Free modem", "24/7 support", "No contract required"],
      },
      {
        name: "WOW! Business 500",
        speed: "500 Mbps",
        price: "$69.99",
        features: ["No data caps", "Free modem", "24/7 support", "Static IP option"],
        recommended: true,
      },
      {
        name: "WOW! Business 1 Gig",
        speed: "1 Gbps",
        price: "$89.99",
        features: ["No data caps", "Free modem", "Priority support", "Static IP included"],
      },
    ],
  },

  // --- Ziply Fiber ---
  {
    id: "ziply",
    name: "Ziply Fiber",
    logo: "/logos/ziply.png",
    description: "Ziply Fiber delivers 100% fiber internet to businesses across the Pacific Northwest with symmetrical gigabit speeds and no contracts.",
    technology: "Fiber",
    serviceableZipPrefixes: [
      // Washington state
      "980", "981", "982", "983", "984", "985", "986", "988", "989",
      "990", "991", "992", "993", "994",
      // Oregon
      "970", "971", "972", "973", "974", "975", "976", "977", "978", "979",
      // Idaho
      "832", "833", "834", "835", "836", "837", "838",
      // Montana (western)
      "590", "591", "592", "593", "594", "595", "596", "597", "598", "599",
    ],
    plans: [
      {
        name: "Business Fiber 300",
        speed: "300 Mbps",
        price: "$40.00",
        features: ["Symmetrical speeds", "No data caps", "No contracts", "Free installation"],
      },
      {
        name: "Business Fiber 1 Gig",
        speed: "1 Gbps",
        price: "$60.00",
        features: ["Symmetrical speeds", "No data caps", "No contracts", "Free installation", "Static IP available"],
        recommended: true,
      },
      {
        name: "Business Fiber 5 Gig",
        speed: "5 Gbps",
        price: "$300.00",
        features: ["Symmetrical speeds", "No data caps", "No contracts", "Priority support", "Static IP included"],
      },
    ],
  },

  // --- T-Mobile Business Internet ---
  {
    id: "tmobile",
    name: "T-Mobile Business Internet",
    logo: "/logos/tmobile.png",
    description: "T-Mobile 5G Business Internet delivers wireless broadband virtually nationwide with no annual contracts, no data caps, and quick self-setup.",
    technology: "5G / Fixed Wireless",
    nationwide: true,
    plans: [
      {
        name: "Business Internet",
        speed: "Up to 245 Mbps",
        price: "$50.00",
        features: ["No annual contract", "No data caps", "5G gateway included", "Self-setup in minutes", "Price lock guarantee"],
      },
      {
        name: "Business Internet Plus",
        speed: "Up to 400 Mbps",
        price: "$70.00",
        features: ["No annual contract", "No data caps", "5G gateway included", "Self-setup in minutes", "Priority support"],
        recommended: true,
      },
      {
        name: "Business Internet Premium",
        speed: "Up to 500+ Mbps",
        price: "$90.00",
        features: ["No annual contract", "No data caps", "5G gateway included", "Priority network access", "Dedicated support line"],
      },
    ],
  },

  // ─── Dedicated Fiber / Enterprise Providers ──────────────────────────────────

  // --- Segra ---
  {
    id: "segra",
    name: "Segra",
    logo: "/logos/segra.png",
    description: "Segra owns and operates a 34,000+ mile fiber network across the Mid-Atlantic and Southeast, delivering dedicated internet, Ethernet, and dark fiber services.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // Virginia
      "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
      "230", "231", "232", "233", "234", "235", "236", "237", "238", "239",
      "240", "241", "242", "243", "244", "245", "246",
      // North Carolina
      "270", "271", "272", "273", "274", "275", "276", "277", "278", "279",
      "280", "281", "282", "283", "284", "285", "286", "287", "288", "289",
      // South Carolina
      "290", "291", "292", "293", "294", "295", "296", "297", "298", "299",
      // Georgia
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // Tennessee
      "370", "371", "372", "373", "374", "376", "377",
      // Maryland
      "206", "207", "208", "209", "210", "211", "212", "214",
      // DC
      "200", "201", "202", "203", "204", "205",
      // West Virginia
      "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
      // Alabama
      "350", "351", "352", "354", "355",
      // Mississippi
      "386", "387", "388", "389", "390", "391",
      // Pennsylvania (eastern)
      "170", "171", "172", "173", "174", "175", "176",
      // Delaware
      "197", "198", "199",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$329",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router option"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$579",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$829",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed CPE", "Static IP block", "Dark fiber available"],
      },
    ],
  },

  // --- Uniti Fiber ---
  {
    id: "uniti",
    name: "Uniti Fiber",
    logo: "/logos/uniti.png",
    description: "Uniti Fiber operates a dense metro fiber footprint across the Southeast, delivering dedicated internet and lit/dark fiber for businesses.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // Alabama (Birmingham, Huntsville, Mobile)
      "350", "351", "352", "354", "355", "356", "357", "358", "359",
      "360", "361", "362", "363", "364", "365", "366", "367",
      // Florida (Jacksonville, Pensacola, Tallahassee)
      "320", "321", "322", "323", "324", "325", "326",
      "330", "331", "332", "333", "334",
      // Georgia (Atlanta, Savannah, Macon)
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "310", "311", "312", "313",
      // Louisiana (New Orleans, Baton Rouge, Shreveport)
      "700", "701", "703", "704", "705", "706", "707", "708",
      "710", "711", "712", "713", "714",
      // Mississippi (Jackson, Gulfport, Hattiesburg)
      "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397",
      // Tennessee (Nashville, Memphis, Knoxville)
      "370", "371", "372", "373", "374", "376", "377", "378", "379",
      "380", "381", "382", "383", "384", "385",
      // Virginia (Hampton Roads)
      "230", "231", "232", "233", "234", "235", "236",
      // Texas (Houston, Dallas areas)
      "770", "771", "772", "773", "774", "775",
      "750", "751", "752", "753", "754", "755",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$299",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed CPE option"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$549",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed CPE", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$799",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed CPE", "Static IP block", "Scalable to 10G+"],
      },
    ],
  },

  // --- Crown Castle Fiber ---
  {
    id: "crown-castle",
    name: "Crown Castle Fiber",
    logo: "/logos/crown-castle.png",
    description: "Enterprise-class dedicated fiber internet access with guaranteed bandwidth, low latency, and scalable speeds for mission-critical business applications.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "190", "191", "192", "193", "194", "195", "196",
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      "220", "221", "222", "223", "224", "225",
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      "800", "801", "802", "803", "804", "805",
      "280", "281", "282", "283", "284",
      "550", "551", "553", "554", "555",
      "850", "851", "852", "853",
      "980", "981", "982", "983", "984",
      "480", "481", "482", "483", "484", "485",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$299",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$599",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$899",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included", "Static IP block", "Proactive fault detection"],
      },
      {
        name: "DIA 10 Gig",
        speed: "10 Gbps",
        price: "Custom",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Fully managed service", "Large IP block", "Dedicated account team"],
      },
    ],
  },

  // --- Lumen (CenturyLink) ---
  {
    id: "lumen",
    name: "Lumen (CenturyLink)",
    logo: "/logos/lumen.png",
    description: "Enterprise-grade dedicated internet access on one of the world's largest fiber networks, with 450,000+ route miles and connections to 6,500+ third-party data centers.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "920", "921", "922", "923", "924", "925",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "610", "611", "612", "613", "614",
      "190", "191", "192", "193", "194", "195", "196",
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212", "214",
      "220", "221", "222", "223", "224", "225", "226", "227",
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      "850", "851", "852", "853", "855", "856", "857",
      "980", "981", "982", "983", "984", "985", "986",
      "550", "551", "553", "554", "555", "556", "557",
      "480", "481", "482", "483", "484", "485", "486", "487", "488", "489",
      "970", "971", "972", "973", "974",
      "280", "281", "282", "283", "284", "285",
      "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
      "430", "431", "432", "433", "434", "435",
      "440", "441", "442", "443", "444", "445",
      "450", "451", "452", "453",
      "630", "631", "633", "634", "635", "636",
      "640", "641", "644", "645",
      "460", "461", "462", "463", "464", "465", "466", "467",
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
      "840", "841", "842", "843", "844",
      "889", "890", "891", "893",
      "370", "371", "372", "373",
      "700", "701", "703", "704", "705", "706", "707", "708",
      "530", "531", "532",
      "350", "351", "352",
      "680", "681", "683",
      "660", "661", "662",
    ],
    plans: [
      {
        name: "DIA 50",
        speed: "50 Mbps",
        price: "$249",
        features: ["Dedicated symmetrical bandwidth", "99.95% uptime SLA", "24/7 tech support", "IPv4 & IPv6 support"],
      },
      {
        name: "DIA 200",
        speed: "200 Mbps",
        price: "$449",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router option", "Static IP block"],
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$799",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included", "Static IP block", "DDoS mitigation included"],
        recommended: true,
      },
      {
        name: "DIA 10 Gig",
        speed: "10 Gbps",
        price: "Custom",
        features: ["Dedicated symmetrical bandwidth", "99.999% uptime SLA", "Proactive network monitoring", "Fully managed CPE", "Enterprise DDoS protection", "Dedicated account team"],
      },
    ],
  },

  // --- Zayo Group ---
  {
    id: "zayo",
    name: "Zayo Group",
    logo: "/logos/zayo.png",
    description: "One of the largest independent fiber providers with 17+ million fiber miles, offering dedicated internet, dark fiber, and wavelength services.",
    technology: "Dedicated Fiber / Dark Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "950", "951",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "190", "191", "192", "193", "194", "195", "196",
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      "220", "221", "222", "223", "224", "225",
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      "800", "801", "802", "803", "804", "805", "806", "807", "808", "809",
      "850", "851", "852", "853",
      "980", "981", "982", "983", "984", "985",
      "550", "551", "553", "554", "555",
      "480", "481", "482", "483", "484", "485",
      "970", "971", "972", "973",
      "280", "281", "282", "283",
      "330", "331", "332", "333", "334", "335",
      "430", "431", "432", "433", "434",
      "440", "441", "442", "443", "444",
      "460", "461", "462", "463", "464", "465",
      "060", "061", "062", "063", "064", "065",
      "630", "631", "633",
      "840", "841", "842", "843",
      "889", "890", "891",
      "370", "371", "372",
      "180", "181", "182", "183", "184", "185", "186",
      "660", "661", "662",
      "956", "957", "958",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$349",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "IPv4 & IPv6 support"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$649",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router option", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$949",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included", "Static IP block", "DDoS mitigation"],
      },
      {
        name: "Dark Fiber",
        speed: "Unlimited",
        price: "Custom",
        features: ["Unlit fiber pairs for your own equipment", "Full control over bandwidth", "Long-term lease options", "Scalable to 100G+ with your optics", "Ideal for data center interconnects"],
      },
    ],
  },

  // --- GTT Communications ---
  {
    id: "gtt",
    name: "GTT Communications",
    logo: "/logos/gtt.png",
    description: "GTT provides Tier 1 IP transit, dedicated internet, and SD-WAN services across a global fiber backbone reaching 600+ data centers.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // GTT has extensive US metro presence — major data center cities
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      "900", "901", "902", "903", "904", "905", "906", "907", "908", "909",
      "940", "941", "942", "943", "944", "945", "946", "947", "948", "949",
      "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      "220", "221", "222", "223", "224", "225",
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "010", "011", "012", "013", "014", "015", "016", "017", "018", "019",
      "020", "021", "022", "023", "024",
      "800", "801", "802", "803", "804", "805",
      "850", "851", "852", "853",
      "980", "981", "982", "983", "984",
      "550", "551", "553", "554", "555",
      "480", "481", "482", "483", "484", "485",
      "190", "191", "192", "193", "194", "195", "196",
      "330", "331", "332", "333", "334", "335",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$399",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Tier 1 IP backbone"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$699",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router option", "DDoS mitigation"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$999",
        features: ["Dedicated symmetrical bandwidth", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed CPE", "DDoS mitigation", "SD-WAN capable"],
      },
    ],
  },

  // --- FiberLight ---
  {
    id: "fiberlight",
    name: "FiberLight",
    logo: "/logos/fiberlight.png",
    description: "FiberLight provides dedicated fiber solutions across Texas, Virginia, and the Southeast with metro and long-haul connectivity.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // Texas — Dallas, Houston, San Antonio, Austin
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763", "764", "765",
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      "780", "781", "782", "783", "784", "785", "786", "787", "788", "789",
      // Virginia (Northern VA data center corridor)
      "220", "221", "222", "223", "224", "225", "226", "227",
      // DC Metro
      "200", "201", "202", "203", "204", "205",
      "206", "207", "208", "209", "210", "211", "212",
      // Georgia (Atlanta)
      "300", "301", "302", "303", "304", "305", "306", "307", "308", "309",
      // North Carolina (Charlotte, Raleigh)
      "270", "271", "272", "273", "274", "275", "276", "277",
      "280", "281", "282", "283", "284",
      // South Carolina
      "290", "291", "292", "293", "294",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$349",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed router option"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$599",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed router", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$849",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC support", "Managed CPE", "Static IP block", "Scalable to 10G"],
      },
    ],
  },

  // --- LOGIX Fiber Networks ---
  {
    id: "logix",
    name: "LOGIX Fiber Networks",
    logo: "/logos/logix.png",
    description: "LOGIX provides dedicated fiber internet and managed network services across major Texas metros with 250,000+ fiber miles.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // Houston metro
      "770", "771", "772", "773", "774", "775", "776", "777", "778", "779",
      // Dallas/Fort Worth metro
      "750", "751", "752", "753", "754", "755", "756", "757", "758", "759",
      "760", "761", "762", "763",
      // San Antonio
      "780", "781", "782", "783", "784", "785", "786", "787", "788", "789",
      // Austin
      "786", "787", "788", "789",
      // Corpus Christi
      "783", "784",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$299",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Texas-based support"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$549",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$799",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed CPE included", "Static IP block", "Scalable to 10G+"],
      },
    ],
  },

  // --- Lightpath ---
  {
    id: "lightpath",
    name: "Lightpath",
    logo: "/logos/lightpath.png",
    description: "Lightpath delivers dedicated fiber connectivity across the New York metro area with enterprise-grade reliability and 18,000+ route miles.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // NYC Metro — all boroughs + Long Island + Westchester + NJ
      "100", "101", "102", "103", "104", "105", "106", "107", "108", "109",
      "110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
      // New Jersey (northern/central)
      "070", "071", "072", "073", "074", "075", "076", "077", "078", "079",
      "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
      // Connecticut (Fairfield/New Haven)
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$349",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router included"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$649",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$899",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed CPE", "Static IP block", "Dark fiber option available"],
      },
    ],
  },

  // --- FirstLight Fiber ---
  {
    id: "firstlight",
    name: "FirstLight Fiber",
    logo: "/logos/firstlight.png",
    description: "FirstLight owns and operates a 28,000+ mile fiber network across the Northeast with dedicated business internet and data center connectivity.",
    technology: "Dedicated Fiber",
    dedicatedFiber: true,
    serviceableZipPrefixes: [
      // New York (upstate — Albany, Syracuse, Rochester, Buffalo)
      "120", "121", "122", "123", "124", "125", "126", "127", "128", "129",
      "130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
      "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
      // Maine
      "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049",
      // New Hampshire
      "030", "031", "032", "033", "034", "035", "036", "037", "038",
      // Vermont
      "050", "051", "052", "053", "054", "056", "057",
      // Massachusetts (western)
      "010", "011", "012", "013",
      // Connecticut
      "060", "061", "062", "063", "064", "065", "066", "067", "068", "069",
    ],
    plans: [
      {
        name: "DIA 100",
        speed: "100 Mbps",
        price: "$349",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Local support team"],
      },
      {
        name: "DIA 500",
        speed: "500 Mbps",
        price: "$599",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed router", "Static IP block"],
        recommended: true,
      },
      {
        name: "DIA 1 Gig",
        speed: "1 Gbps",
        price: "$849",
        features: ["Dedicated symmetrical fiber", "99.99% uptime SLA", "24/7 NOC monitoring", "Managed CPE", "Static IP block", "Data center access"],
      },
    ],
  },
];

// ─── Spectrum Configuration ──────────────────────────────────────────────────

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
  logo: "/logos/spectrum.png",
  description: "Fast, reliable cable internet with no data caps, free modem, and 24/7 U.S.-based support.",
  technology: "Cable / Fiber",
  serviceableZipPrefixes: spectrumServiceableZipPrefixes,
  plans: spectrumPlans,
};

// ─── Lookup Functions ────────────────────────────────────────────────────────

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

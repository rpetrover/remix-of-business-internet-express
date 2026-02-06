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
];

// Spectrum Business serviceable states (Spectrum covers these states fully or partially)
// Source: Spectrum serves 42 states as of 2025
export const spectrumServiceableStates = [
  "AL", "AZ", "CA", "CO", "CT", "FL", "GA", "HI", "ID", "IL",
  "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO",
  "MS", "MT", "NC", "NE", "NH", "NJ", "NM", "NV", "NY", "OH",
  "OR", "PA", "SC", "SD", "TN", "TX", "VA", "VT", "WA", "WI",
  "WV", "WY",
];

// Common Spectrum-serviceable zip code prefixes (first 3 digits)
// This is an approximation - for production, you'd want a full database
export const spectrumServiceableZipPrefixes = [
  // New York metro
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
  "951", "952", "953", "954", "955", "956", "957", "958", "959", "960",
  "961",
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
  "700", "701", "703", "704", "705", "706", "707", "708", "710", "711",
  "712", "713", "714",
  // Minnesota
  "550", "551", "553", "554", "555", "556", "557", "558", "559", "560",
  "561", "562", "563", "564", "565", "566", "567",
  // Mississippi
  "386", "387", "388", "389", "390", "391", "392", "393", "394", "395",
  "396", "397",
  // Virginia
  "220", "221", "222", "223", "224", "225", "226", "227", "228", "229",
  "230", "231", "232", "233", "234", "235", "236", "237", "238", "239",
  "240", "241", "242", "243", "244", "245", "246",
  // West Virginia
  "247", "248", "249", "250", "251", "252", "253", "254", "255", "256",
  "257", "258", "259", "260", "261", "262", "263", "264", "265", "266",
  "267", "268",
  // Washington state
  "980", "981", "982", "983", "984", "985", "986", "988", "989", "990",
  "991", "992", "993", "994",
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
  "680", "681", "683", "684", "685", "686", "687", "688", "689", "690",
  "691", "692", "693",
  // Hawaii
  "967", "968",
  // Arizona
  "850", "851", "852", "853", "855", "856", "857", "859", "860", "863",
  "864", "865",
  // Nevada
  "889", "890", "891", "893", "894", "895", "897", "898",
  // Maine
  "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049",
  // Vermont
  "050", "051", "052", "053", "054", "056", "057", "058", "059",
  // New Hampshire
  "030", "031", "032", "033", "034", "035", "036", "037", "038",
  // Maryland
  "206", "207", "208", "209", "210", "211", "212", "214", "215", "216",
  "217", "218", "219",
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
  "870", "871", "872", "873", "874", "875", "877", "878", "879", "880",
  "881", "882", "883", "884",
  // Illinois
  "600", "601", "602", "603", "604", "605", "606", "607", "608", "609",
  "610", "611", "612", "613", "614", "615", "616", "617", "618", "619",
  "620", "622", "623", "624", "625", "626", "627", "628", "629",
];

export function checkSpectrumAvailability(zipCode: string): boolean {
  const prefix = zipCode.substring(0, 3);
  return spectrumServiceableZipPrefixes.includes(prefix);
}

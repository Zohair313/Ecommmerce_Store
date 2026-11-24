export const CLOUDFRONT_PREFIX = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";

export function buildImageUrl(filename, width) {
  const original = CLOUDFRONT_PREFIX + filename;
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(original)}&w=${width}&q=85`;
}

export const BASE_FILE = "hf_20261115_071307_1d0f42d5-b05f-4e21-bf76-f52fb4b12bb5.png";
export const SHEET_FILE = "hf_20261115_071304_55f839b8-7976-43af-8b07-b439c6be0936.png";

export const PRODUCTS = [
  {
    id: 0,
    title: "Alpine Puffer",
    category: "Down Puffers",
    price: "$238.00",
    priceNum: 238,
    pillName: "Alpine Puffer Jacket",
    pillSub: "Ice Grey",
    badge: "Arctic Rated",
    rating: 4.9,
    reviewsCount: 384,
    description: "Built for sub-zero winds and freezing sleet. 800-fill power RDS-certified goose down encased in Japanese technical ripstop nylon.",
    specs: ["800-fill RDS Goose Down", "20,000mm Waterproof Shell", "-30°C Comfort Rating", "Storm-proof Magnetic Placket"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    crop: { x: 134, y: 79, w: 760, h: 863 },
    wearFile: "hf_20261115_071402_80cf9c12-dd74-45cf-a639-1f8580543ff3.png",
    colorHex: "#D5DDE3",
    weight: "640g (Size M)",
    temperatureRating: "-30°C to +5°C",
    fabricDetails: "40D Japanese Ripstop Nylon with Eco-DWR (Fluorocarbon-free)",
    fitDetails: "Athletic Arctic Fit: room for thermal midlayer without binding",
    care: "Machine wash cold (30°C) with technical down wash. Tumble dry low with 3 clean tennis balls to restore baffle loft. Never dry clean.",
    highlights: [
      "Independently tested in Tromsø, Norway at -28°C windchill",
      "Toray Dermizax 3-layer waterproof breathable shoulder yolk",
      "Fidlock magnetic storm placket closes automatically with gloved hands",
      "Two deep fleece-lined handwarmer pockets + internal zippered media pocket"
    ]
  },
  {
    id: 1,
    title: "Ridge Fleece",
    category: "Thermal Fleece",
    price: "$148.00",
    priceNum: 148,
    pillName: "Ridge Fleece Jacket",
    pillSub: "Sage",
    badge: "Staff Pick",
    rating: 4.8,
    reviewsCount: 247,
    description: "High-loft bonded microfleece with wind-blocking ripstop chest overlay. Rapid thermal retention with zero bulk.",
    specs: ["360gsm Bonded Thermal Fleece", "Reinforced Cordura Elbows", "YKK Aquaguard Zippers", "Internal Media Pocket"],
    sizes: ["S", "M", "L", "XL"],
    crop: { x: 1138, y: 79, w: 790, h: 863 },
    wearFile: "hf_20261115_071402_63307d14-96fd-4b18-bae5-034018df0692.png",
    colorHex: "#768875",
    weight: "480g (Size M)",
    temperatureRating: "-10°C to +15°C",
    fabricDetails: "360gsm Bonded Microfleece + 500D Cordura Ripstop Elbow Panels",
    fitDetails: "Tailored Midlayer Fit: sits close to body for thermal efficiency",
    care: "Machine wash cold inside out. Hang dry or tumble dry low. Do not bleach or use fabric softeners.",
    highlights: [
      "High-loft shearling thermal interior traps body heat instantly",
      "Wind-blocking chest panel stops bitter headwinds while hiking",
      "Abrasion-resistant Cordura elbow patches for expedition durability",
      "Dropped rear hem ensures zero draft exposure while cycling or climbing"
    ]
  },
  {
    id: 2,
    title: "Drift Shell",
    category: "Technical Shells",
    price: "$196.00",
    priceNum: 196,
    pillName: "Drift Shell Jacket",
    pillSub: "Light Grey",
    badge: "Ultralight",
    rating: 4.9,
    reviewsCount: 312,
    description: "3-layer seam-sealed technical storm shell. Maximum breathability during high-output alpine ascents and torrential downpours.",
    specs: ["3-Layer Breathable Membrane", "Fully Heat-Taped Seams", "Helmet-Compatible Hood", "Underarm Zip Vents"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    crop: { x: 137, y: 1024, w: 748, h: 901 },
    wearFile: "hf_20261115_071402_01ef6ea1-a2e6-4d0d-83ce-cbae31202ccc.png",
    colorHex: "#BAC4CC",
    weight: "395g (Size M)",
    temperatureRating: "-15°C to +20°C (Shell Layer)",
    fabricDetails: "3-Layer 20D Recycled Nylon Ripstop with Hydrophilic Membrane",
    fitDetails: "Ergonomic Articulated Fit: full shoulder mobility for ice axes and poles",
    care: "Machine wash cold with tech wash detergent. Tumble dry warm for 20 minutes to reactivate DWR coating.",
    highlights: [
      "28,000mm hydrostatic head waterproof rating (Monsoon & blizzard certified)",
      "Dual-direction underarm pit zips for instant heat dumping on steep climbs",
      "3-point adjustable storm hood fits over climbing and ski helmets",
      "Ultralight packable design stuffs into its own interior chest pocket"
    ]
  },
  {
    id: 3,
    title: "Harbor Parka",
    category: "Storm Parkas",
    price: "$284.00",
    priceNum: 284,
    pillName: "Harbor Parka",
    pillSub: "Navy",
    badge: "Heavy Duty",
    rating: 5.0,
    reviewsCount: 418,
    description: "Extended expedition parka with dual-chamber insulation and storm hood. Blocks biting coastal gales and relentless blizzards.",
    specs: ["Dual-Chamber Primaloft Gold", "DWR Heavy Twill Shell", "Fleece-Lined Handwarmers", "Removable Storm Skirt"],
    sizes: ["S", "M", "L", "XL"],
    crop: { x: 1146, y: 1011, w: 776, h: 966 },
    wearFile: "hf_20261115_071400_47a4d43c-8f7c-4f0a-b860-1dc753202b92.png",
    colorHex: "#1B2838",
    weight: "980g (Size M)",
    temperatureRating: "-35°C to 0°C",
    fabricDetails: "70D Heavyweight Weatherproof Poly-Cotton Twill with Storm DWR",
    fitDetails: "Relaxed Expedition Parka Cut: extended mid-thigh coverage",
    care: "Machine wash gentle cold. Tumble dry gentle low. Remove faux-shearling hood trim prior to washing.",
    highlights: [
      "Dual-chamber Primaloft Gold synthetic down retains 98% warmth even if soaked",
      "Extended 34-inch drop tail seals off freezing drafts on open snowmobiles",
      "Polar fleece lined dual-entry storm pockets with glove-friendly pull tabs",
      "Internal powder skirt prevents snow ingress during deep alpine drifts"
    ]
  }
];

export const REVIEWS = [
  {
    id: 1,
    author: "Liam K.",
    location: "Reykjavik, Iceland",
    product: "Alpine Puffer",
    rating: 5,
    date: "November 2026",
    verified: true,
    title: "Endured 50 knot gusts and freezing rain",
    comment: "Took this to the South Coast of Iceland in sleet and 50kt winds. The baffle construction keeps all cold spots sealed off. The ice-grey finish looks incredible in person."
  },
  {
    id: 2,
    author: "Marcus E.",
    location: "Oslo, Norway",
    product: "Harbor Parka",
    rating: 5,
    date: "October 2026",
    verified: true,
    title: "The warmest piece of outerwear I own",
    comment: "Daily commute at -18°C feels completely effortless. The magnetic storm flap is genius when wearing thick winter gloves. TAWAKAL nailed the tailoring."
  },
  {
    id: 3,
    author: "Julian T.",
    location: "Vancouver, BC",
    product: "Drift Shell",
    rating: 5,
    date: "November 2026",
    verified: true,
    title: "100% waterproof through endless Pacific storms",
    comment: "Bone dry after 4 hours of torrential downpours on Grouse Mountain. The hood stays locked without blocking peripheral vision."
  }
];

export const FAQS = [
  {
    question: "How does the virtual try-on studio work?",
    answer: "Our virtual try-on hero uses high-fidelity stereoscopic capture to demonstrate garment drape, shoulder width, and torso fit on a live model in real time."
  },
  {
    question: "What temperature ratings are these jackets certified for?",
    answer: "Our Alpine Puffer and Harbor Parka are lab-tested down to -30°C (-22°F). The Ridge Fleece is optimal from 0°C to 15°C, while the Drift Shell acts as an impervious waterproof barrier for any temperature when layered."
  },
  {
    question: "How accurate is the sizing?",
    answer: "Our garments are tailored with an athletic winter silhouette: true to size with calculated allowance for an ergonomic mid-layer. Use our interactive Fit Lab below to calculate your exact size."
  },
  {
    question: "What is your return and warranty policy?",
    answer: "Every TAWAKAL purchase includes a 30-day real-world trial. Wear it in the cold; if you aren't completely shielded from the elements, return it for a full refund. We also back all seams and zippers with a lifetime repair warranty."
  },
  {
    question: "Where do orders ship from, and what are delivery times?",
    answer: "Orders ship via DHL Express from our clean-energy fulfillment hubs in Europe and North America. Express delivery takes 2–4 business days worldwide, with tracking and carbon offset included."
  }
];

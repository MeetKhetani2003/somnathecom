export type Product = {
  id: string;
  name: string;
  category: string;
  collection: string;
  gender: "Women" | "Men" | "Unisex";
  price: number;
  image: string;
  image2?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  fabric: "Tencel" | "Hosiery" | "Cotton Lyocell" | "Modal";
  description: string;
};

const px = (id: number, h = 1400, w = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

export const PRODUCTS: Product[] = [
  { id: "n-01", name: "Tencel Full Night Suit", category: "Full Night Suit", collection: "Women", gender: "Women",
    price: 4900, image: "/tencel_full_suit.png", image2: "/tencel_full_suit.png",
    colors: [{name:"Ivory",hex:"#EFEAE0"},{name:"Stone",hex:"#C9C2B5"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["XS","S","M","L","XL"], fabric: "Tencel",
    description: "A relaxed two-piece in featherweight Tencel. Long-sleeve shirt and elasticated trouser, finished with mother-of-pearl buttons." },
  { id: "n-02", name: "Capri Night Suit", category: "Capri Night Suit", collection: "Women", gender: "Women",
    price: 3900, image: "/capri_suit.png", image2: "/capri_suit.png",
    colors: [{name:"Bone",hex:"#E7E2D6"},{name:"Charcoal",hex:"#3E3A36"}],
    sizes: ["XS","S","M","L"], fabric: "Cotton Lyocell",
    description: "Calf-length trousers paired with a soft button-through top. Cut for movement, made for stillness." },
  { id: "n-03", name: "Short Night Suit", category: "Short Night Suit", collection: "Women", gender: "Women",
    price: 3400, image: px(8416086), image2: px(8416196),
    colors: [{name:"Powder",hex:"#E9DCD3"},{name:"Black",hex:"#111111"}],
    sizes: ["XS","S","M","L","XL"], fabric: "Hosiery",
    description: "A weightless short set, finished by hand. Engineered for warmer nights." },
  { id: "n-04", name: "Oversized T-Shirt", category: "Oversized T-Shirt", collection: "Women", gender: "Women",
    price: 2400, image: px(34896871), image2: px(10211651),
    colors: [{name:"Ecru",hex:"#E6E1D3"},{name:"Black",hex:"#111111"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["S","M","L","XL"], fabric: "Cotton Lyocell",
    description: "Heavyweight 240 GSM jersey, cut to drape with a deliberate oversized silhouette." },
  { id: "n-05", name: "Oversized Tee + Plazo", category: "Oversized T-Shirt + Plazo", collection: "Women", gender: "Women",
    price: 5200, image: px(6612834), image2: px(6598913),
    colors: [{name:"Sand",hex:"#D9CDB8"},{name:"Slate",hex:"#5A5E66"}],
    sizes: ["S","M","L","XL"], fabric: "Modal",
    description: "A co-ord set in fluid modal. Wide-leg trouser meets relaxed tee — engineered as one." },
  { id: "n-06", name: "Cargo Plazo Co-Ord", category: "Oversized T-Shirt + Cargo Plazo", collection: "Women", gender: "Women",
    price: 6200, image: px(8340464), image2: px(6612834),
    colors: [{name:"Olive",hex:"#5C5A3F"},{name:"Black",hex:"#111111"}],
    sizes: ["S","M","L","XL"], fabric: "Cotton Lyocell",
    description: "Utility-cargo trouser with quiet pocket detailing, paired with a softened oversized tee." },
  { id: "n-07", name: "Valentino Plazo", category: "Valentino Plazo", collection: "Women", gender: "Women",
    price: 4200, image: px(6598913), image2: px(17574239),
    colors: [{name:"Ivory",hex:"#EFEAE0"},{name:"Navy",hex:"#1E1B4B"},{name:"Black",hex:"#111111"}],
    sizes: ["XS","S","M","L","XL"], fabric: "Modal",
    description: "Our signature wide-leg, cut from a dense Valentino-weave for an unmistakable drape." },
  { id: "n-08", name: "Tencel Plazo", category: "Tencel Plazo", collection: "Women", gender: "Women",
    price: 4500, image: px(6598903), image2: px(7760026),
    colors: [{name:"Bone",hex:"#E7E2D6"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["XS","S","M","L"], fabric: "Tencel",
    description: "Eco-luxe Tencel — temperature-regulating, weightless, made to drape." },
  { id: "n-09", name: "Men's Full Night Suit", category: "Full Night Suit", collection: "Men", gender: "Men",
    price: 4700, image: "/mens_suit.png", image2: "/mens_suit.png",
    colors: [{name:"Black",hex:"#111111"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["S","M","L","XL","XXL"], fabric: "Cotton Lyocell",
    description: "A considered two-piece in soft cotton-lyocell. Notched collar, mother-of-pearl buttons." },
  { id: "n-10", name: "Men's Capri Night Suit", category: "Capri Night Suit", collection: "Men", gender: "Men",
    price: 3800, image: px(4611941), image2: px(4611907),
    colors: [{name:"Stone",hex:"#C9C2B5"},{name:"Black",hex:"#111111"}],
    sizes: ["S","M","L","XL"], fabric: "Hosiery",
    description: "Mid-length trouser with a relaxed shirt. Designed to live in." },
  { id: "n-11", name: "Men's Short Night Suit", category: "Short Night Suit", collection: "Men", gender: "Men",
    price: 3200, image: px(8416315), image2: px(20364755),
    colors: [{name:"Bone",hex:"#E7E2D6"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["S","M","L","XL"], fabric: "Hosiery",
    description: "A warm-weather essential — pared back, considered, complete." },
  { id: "n-12", name: "The Lounge Set", category: "Tencel Set", collection: "Tencel", gender: "Unisex",
    price: 5400, image: "/lounge_set.png", image2: "/lounge_set.png",
    colors: [{name:"Ivory",hex:"#EFEAE0"},{name:"Sand",hex:"#D9CDB8"},{name:"Black",hex:"#111111"}],
    sizes: ["XS","S","M","L","XL"], fabric: "Tencel",
    description: "Our flagship Tencel set — the softest fabric we have ever sourced." },
];

export const ALL_PRODUCTS: Product[] = [
  ...PRODUCTS,
  ...PRODUCTS.map((p, i) => ({
    ...p, id: p.id + "-b",
    name: i % 2 ? p.name + " — Edition II" : p.name + " — Signature",
    price: p.price + 400,
  })),
];

export const JOURNAL = [
  { id: "j-01", category: "Fabric Guide", title: "On Tencel, and why it changes everything",
    excerpt: "An honest study of the fibre that sits closest to the skin — and the trees it comes from.",
    image: px(7087669, 1100, 1500), readTime: "6 min read", date: "Nov 2025" },
  { id: "j-02", category: "Comfort Guide", title: "Eight hours, considered",
    excerpt: "What we sleep in shapes how we wake. A short manual on building a better night.",
    image: px(3755590, 1100, 1500), readTime: "4 min read", date: "Nov 2025" },
  { id: "j-03", category: "Trends", title: "The quiet rise of considered loungewear",
    excerpt: "From private to public — how the at-home wardrobe is being rewritten.",
    image: px(4045540, 1100, 1500), readTime: "5 min read", date: "Oct 2025" },
  { id: "j-04", category: "Lifestyle", title: "Rooms made for rest",
    excerpt: "A visual study of bedrooms that prioritise stillness over performance.",
    image: px(7749046, 1100, 1500), readTime: "3 min read", date: "Oct 2025" },
];

export const GALLERY = [
  px(27869836, 1200, 900), px(29215016, 1200, 900), px(10211651, 1200, 900),
  px(14562150, 1200, 900), px(17574239, 1200, 900), px(7760026, 1200, 900),
  px(7760997, 1200, 900), px(31132019, 1200, 900),
];

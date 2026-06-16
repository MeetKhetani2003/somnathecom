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
  { id: "n-09", name: "Men's Full Night Suit", category: "Full Night Suit", collection: "Men", gender: "Men",
    price: 4700, image: "/mens_suit.png", image2: "/mens_suit.png",
    colors: [{name:"Black",hex:"#Black"},{name:"Indigo",hex:"#1E1B4B"}],
    sizes: ["S","M","L","XL","XXL"], fabric: "Cotton Lyocell",
    description: "A considered two-piece in soft cotton-lyocell. Notched collar, mother-of-pearl buttons." },
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
    image: "/tencel_full_suit.png", readTime: "6 min read", date: "Nov 2025" },
  { id: "j-02", category: "Comfort Guide", title: "Eight hours, considered",
    excerpt: "What we sleep in shapes how we wake. A short manual on building a better night.",
    image: "/capri_suit.png", readTime: "4 min read", date: "Nov 2025" },
  { id: "j-03", category: "Trends", title: "The quiet rise of considered loungewear",
    excerpt: "From private to public — how the at-home wardrobe is being rewritten.",
    image: "/mens_suit.png", readTime: "5 min read", date: "Oct 2025" },
  { id: "j-04", category: "Lifestyle", title: "Rooms made for rest",
    excerpt: "A visual study of bedrooms that prioritise stillness over performance.",
    image: "/lounge_set.png", readTime: "3 min read", date: "Oct 2025" },
];

export const GALLERY = [
  "/tencel_full_suit.png", "/capri_suit.png", "/mens_suit.png", "/lounge_set.png",
  "/tencel_full_suit.png", "/capri_suit.png", "/mens_suit.png", "/lounge_set.png"
];

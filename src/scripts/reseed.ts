import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// Inline schema (avoids Next.js-specific model pattern)
const SizeSchema = new mongoose.Schema({ size: String, stock: { type: Number, default: 0 } });
const ReviewSchema = new mongoose.Schema({
  userName: String, userEmail: String, rating: Number, comment: String, createdAt: { type: Date, default: Date.now }
});
const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  sku: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  image: { type: String, required: true },
  images: [String],
  tag: String,
  description: String,
  stock: { type: Number, default: 0 },
  material: String,
  sizes: [SizeSchema],
  whatsIncluded: [String],
  careInstructions: String,
  featured: { type: Boolean, default: false },
  reviews: { type: [ReviewSchema], default: [] },
});
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
});

const products = [
  {
    id: 201, title: "Premium Tencel Plazo Set", category: "Tencel Collection",
    price: 1499, mrp: 2499, rating: 4.9,
    image: "/images/products/tencel_plazo.png",
    images: ["/images/products/tencel_plazo.png", "/images/products/valentino_plazo.png", "/images/products/short_suit.png"],
    tag: "Bestseller", featured: true,
    description: "Experience the ultimate softness with our premium Tencel Plazo Set. Lightweight, breathable, and perfectly styled for lounging.",
    material: "100% Premium Tencel",
    sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 20 }, { size: "XL", stock: 20 }, { size: "XXL", stock: 20 }, { size: "3XL", stock: 20 }],
    whatsIncluded: ["Top", "Plazo Bottom"],
    careInstructions: "Machine wash cold on gentle cycle. Do not bleach. Tumble dry low.",
  },
  {
    id: 202, title: "Ladies Full Night Suit - Silk Finish", category: "Women's Nightwear",
    price: 1899, mrp: 2999, rating: 4.8,
    image: "/images/products/silk_suit.png",
    images: ["/images/products/silk_suit.png", "/images/products/tencel_plazo.png"],
    tag: "Premium", featured: true,
    description: "A luxurious full night suit featuring a sleek silk-like finish. Perfect for elegant evenings and comfortable sleep.",
    material: "Satin Silk Blend",
    sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 20 }, { size: "XL", stock: 20 }, { size: "XXL", stock: 20 }],
    whatsIncluded: ["Long Sleeve Shirt", "Trousers"],
    careInstructions: "Hand wash cold or dry clean. Iron on low heat.",
  },
  {
    id: 203, title: "Oversized T-Shirt & Cargo Plazo", category: "Oversized Collection",
    price: 1299, mrp: 1999, rating: 4.7,
    image: "/images/products/oversized_cargo.png",
    images: ["/images/products/oversized_cargo.png", "/images/products/short_suit.png"],
    tag: "Trending", featured: true,
    description: "Casual, modern, and extremely comfortable. Our oversized tee paired with a functional cargo plazo is your go-to weekend look.",
    material: "100% Breathable Cotton",
    sizes: [{ size: "L", stock: 20 }, { size: "XL", stock: 20 }, { size: "XXL", stock: 20 }, { size: "3XL", stock: 20 }],
    whatsIncluded: ["Oversized T-Shirt", "Cargo Plazo"],
    careInstructions: "Machine wash cold with like colors. Do not bleach.",
  },
  {
    id: 204, title: "Gents Full Night Suit - Classic Stripe", category: "Men's Nightwear",
    price: 1599, mrp: 2499, rating: 4.8,
    image: "/images/products/gents_stripe.png",
    images: ["/images/products/gents_stripe.png"],
    tag: "New", featured: true,
    description: "Classic design meets supreme comfort. Features a relaxed fit and incredibly soft fabric.",
    material: "Premium Cotton Blend",
    sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 20 }, { size: "XL", stock: 20 }, { size: "XXL", stock: 20 }],
    whatsIncluded: ["Shirt", "Pyjama"],
    careInstructions: "Machine wash cold. Tumble dry low.",
  },
  {
    id: 205, title: "Valentino Plazo Signature Set", category: "Valentino Collection",
    price: 1799, mrp: 2899, rating: 4.9,
    image: "/images/products/valentino_plazo.png",
    images: ["/images/products/valentino_plazo.png", "/images/products/silk_suit.png"],
    tag: "Exclusive", featured: true,
    description: "The Valentino signature collection brings elegant draping and high-end fabric feel to everyday loungewear.",
    material: "Viscose Spandex Blend",
    sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 20 }, { size: "XL", stock: 20 }],
    whatsIncluded: ["Sleeveless Top", "Wide-leg Plazo"],
    careInstructions: "Dry clean recommended. Hand wash cold if necessary.",
  },
  {
    id: 206, title: "Ladies Short Night Suit", category: "Women's Nightwear",
    price: 1099, mrp: 1799, rating: 4.6,
    image: "/images/products/short_suit.png",
    images: ["/images/products/short_suit.png", "/images/products/oversized_cargo.png"],
    tag: "-38%", featured: false,
    description: "Perfect for warm nights. A soft, lightweight short set featuring a comfortable elastic waist.",
    material: "Hosiery Cotton",
    sizes: [{ size: "M", stock: 20 }, { size: "L", stock: 20 }, { size: "XL", stock: 20 }, { size: "XXL", stock: 20 }],
    whatsIncluded: ["Top", "Shorts"],
    careInstructions: "Machine wash cold. Do not iron print.",
  },
];

async function reseed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("Connected!");

  const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  const CouponModel = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

  // Wipe and reseed products
  const deleted = await ProductModel.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} old products.`);

  const toInsert = products.map(p => ({
    ...p,
    sku: `SOM-NX-${p.id}`,
    stock: p.sizes.reduce((sum, s) => sum + s.stock, 0),
  }));

  const inserted = await ProductModel.insertMany(toInsert);
  console.log(`✅ Inserted ${inserted.length} Somnath NX products with custom images.`);

  // Ensure coupons
  const couponCount = await CouponModel.countDocuments();
  if (couponCount === 0) {
    await CouponModel.insertMany([
      { code: "WELCOME10", discountPercent: 10, active: true },
      { code: "FESTIVE20", discountPercent: 20, active: true },
      { code: "SOMNATH25", discountPercent: 25, active: true },
    ]);
    console.log("✅ Seeded coupons: WELCOME10, FESTIVE20, SOMNATH25");
  } else {
    console.log(`ℹ️  ${couponCount} coupons already exist, skipping.`);
  }

  await mongoose.disconnect();
  console.log("🚀 Done! Refresh the site to see products.");
  process.exit(0);
}

reseed().catch(err => {
  console.error("❌ Reseed failed:", err.message);
  process.exit(1);
});

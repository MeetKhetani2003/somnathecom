import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fullPath: { type: String, required: true, unique: true },
  group: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const initialCategories = [
  {
    title: "Ladies Collection",
    categories: [
      { label: "Ladies Full Night Suit", value: "Ladies Collection > Night Suits > Ladies Full Night Suit" },
      { label: "Ladies Capri Night Suit", value: "Ladies Collection > Night Suits > Ladies Capri Night Suit" },
      { label: "Ladies Short Night Suit", value: "Ladies Collection > Night Suits > Ladies Short Night Suit" },
      { label: "Oversized T-Shirt", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt" },
      { label: "Oversized T-Shirt & Plazo Set", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt & Plazo Set" },
      { label: "Oversized T-Shirt & Cargo Plazo Set", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt & Cargo Plazo Set" },
      { label: "Valentino Plazo", value: "Ladies Collection > Plazo Collection > Valentino Plazo" },
      { label: "Tencel Plazo", value: "Ladies Collection > Plazo Collection > Tencel Plazo" }
    ]
  },
  {
    title: "Men's Collection",
    categories: [
      { label: "Gents Full Night Suit", value: "Men's Collection > Night Suits > Gents Full Night Suit" },
      { label: "Gents Capri Night Suit", value: "Men's Collection > Night Suits > Gents Capri Night Suit" },
      { label: "Gents Short Night Suit", value: "Men's Collection > Night Suits > Gents Short Night Suit" }
    ]
  },
  {
    title: "Tencel Collection",
    categories: [
      { label: "Tencel Full Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Full Night Suit" },
      { label: "Tencel Capri Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Capri Night Suit" },
      { label: "Tencel Short Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Short Night Suit" },
      { label: "Tencel Plazo", value: "Tencel Collection > Tencel Plazo > Tencel Plazo" },
      { label: "Tencel Lounge Wear", value: "Tencel Collection > Future Collections > Tencel Lounge Wear" },
      { label: "Tencel Couple Set", value: "Tencel Collection > Future Collections > Tencel Couple Set" }
    ]
  },
  {
    title: "Hosiery Collection",
    categories: [
      { label: "Hosiery Full Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Full Night Suit" },
      { label: "Hosiery Capri Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Capri Night Suit" },
      { label: "Hosiery Short Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Short Night Suit" },
      { label: "Hosiery Oversized T-Shirt", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt" },
      { label: "Hosiery Oversized T-Shirt & Plazo Set", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Plazo Set" },
      { label: "Hosiery Oversized T-Shirt & Cargo Plazo Set", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Cargo Plazo Set" }
    ]
  }
];

async function seedCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    console.log("Clearing existing categories...");
    await Category.deleteMany({});

    console.log("Inserting initial categories...");
    
    let count = 0;
    for (const group of initialCategories) {
      for (const cat of group.categories) {
        await Category.create({
          name: cat.label,
          fullPath: cat.value,
          group: group.title,
          isHidden: false
        });
        count++;
      }
    }

    console.log(`Successfully seeded ${count} categories!`);
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();

import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { products } from "@/data/mockData";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Run auto-seeding
    await seedDatabase();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function seedDatabase() {
  try {
    // Somnath NX Purge: Remove old kids categories if they exist
    const oldProducts = await Product.find({
      category: {
        $in: [
          "Super Heroes", "Animal Costume", "Indian Mythology Costume", "Indian Dance Costume",
          "Insect Costume", "Cartoon Characters Costume", "Republic Day / Independence Day",
          "Caps / Hats / Safa / Pagdi", "Face Masks", "Hair Wigs", "Silver / Golden Jewellery",
          "Umbrella / Fans", "Offer Products", "Our Helpers", "Community Helpers", "National Heroes",
          "Halloween Costumes", "Birds Costume", "Indian State Costume", "Fruit Costume", "Vegetable Costume", "Water Animals Costume"
        ]
      }
    });

    if (oldProducts.length > 0) {
      console.log(`Found ${oldProducts.length} old products. Purging and reseeding database for Somnath NX...`);
      await Product.deleteMany({});
    }

    // Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const formattedProducts = products.map(p => {
        const sizesList = p.sizes || ["M", "L", "XL", "XXL", "3XL"];
        const sizeObjects = sizesList.map(s => ({ size: s, stock: 15 }));
        const totalStock = sizeObjects.reduce((sum, item) => sum + item.stock, 0);
        return {
          id: p.id,
          sku: `SOM-NX-${p.id}`,
          title: p.title,
          category: p.category,
          price: p.price,
          mrp: p.mrp,
          rating: p.rating,
          image: p.image,
          tag: p.tag,
          description: p.description || "Premium nightwear and loungewear set.",
          stock: totalStock,
          material: p.material || "Premium fabric",
          sizes: sizeObjects,
          whatsIncluded: p.whatsIncluded || ["Top", "Bottom"],
          careInstructions: p.careInstructions || "Machine wash cold.",
          images: p.images || [p.image]
        };
      });
      await Product.insertMany(formattedProducts);
    } else {
      // Migrate/update existing products to populate images and structured sizes if needed
      const existingProductsList = await Product.find({});
      for (const prod of existingProductsList) {
        let needsUpdate = false;
        let updateFields: any = {};

        // Migrate images if missing
        if (!prod.images || prod.images.length === 0) {
          const mockP = products.find(p => p.id === prod.id);
          updateFields.images = (mockP && mockP.images && mockP.images.length > 0) ? mockP.images : [prod.image];
          needsUpdate = true;
        }

        // Migrate sizes if strings
        const hasStringSizes = prod.sizes && prod.sizes.some((s: any) => typeof s === "string");
        if (hasStringSizes || !prod.sizes || prod.sizes.length === 0) {
          const sizesList = (prod.sizes && prod.sizes.length > 0) 
            ? prod.sizes.map((s: any) => typeof s === "string" ? s : s.size) 
            : ["Size 24", "Size 26", "Size 28", "Size 30", "Size 32"];
          
          const count = sizesList.length;
          const stockPerSize = count > 0 ? Math.max(1, Math.floor((prod.stock || 50) / count)) : 10;
          
          updateFields.sizes = sizesList.map((s: any) => ({
            size: s,
            stock: stockPerSize
          }));
          updateFields.stock = count * stockPerSize;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await Product.updateOne({ _id: prod._id }, { $set: updateFields });
          console.log(`Migrated product ${prod.id} (${prod.title}) with updated schema fields.`);
        }
      }
    }

    // Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const defaultCoupons = [
        { code: "WELCOME10", discountPercent: 10, active: true },
        { code: "FESTIVE20", discountPercent: 20, active: true },
        { code: "SOMNATH25", discountPercent: 25, active: true }
      ];
      await Coupon.insertMany(defaultCoupons);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export default dbConnect;

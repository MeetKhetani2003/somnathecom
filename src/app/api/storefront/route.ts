import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import StorefrontAsset from "@/models/StorefrontAsset";
import { heroSlides, categories } from "@/data/mockData";

export async function GET(_req: Request) {
  try {
    await dbConnect();

    // Check if we already have assets
    const count = await StorefrontAsset.countDocuments();
    
    if (count === 0) {
      // Seed default assets if empty
      const assetsToInsert = [];
      
      // Add Hero Banners
      for (const slide of heroSlides) {
        assetsToInsert.push({
          type: "hero",
          identifier: `hero_slide_${slide.id}`,
          image: slide.image,
          title: `Hero Banner ${slide.id}`,
        });
      }

      // Add Category Images
      categories.forEach((cat, _idx) => {
        assetsToInsert.push({
          type: "category",
          identifier: cat.name,
          image: cat.image,
          title: `Category: ${cat.name.split(" > ").pop()}`,
        });
      });

      await StorefrontAsset.insertMany(assetsToInsert);
    }

    const assets = await StorefrontAsset.find({});
    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch/Seed Storefront Assets Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

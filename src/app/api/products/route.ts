import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { uploadToGridFS } from "@/utils/gridfs";


export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ id: 1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const mrp = formData.get("mrp") as string;
    const netPriceStr = formData.get("netPrice") as string;
    const description = formData.get("description") as string;
    const tag = formData.get("tag") as string;
    const material = formData.get("material") as string;
    const sizesStr = formData.get("sizes") as string;
    const whatsIncludedStr = formData.get("whatsIncluded") as string;
    const careInstructions = formData.get("careInstructions") as string;
    const featuredStr = formData.get("featured") as string;
    
    const imageFile = formData.get("image") as File | null;
    const imagesFiles = formData.getAll("images") as File[];

    if (!title || !category || !price || !mrp) {
      return NextResponse.json({ success: false, message: "Missing required product fields" }, { status: 400 });
    }

    await dbConnect();

    // Size limit check (500KB = 500 * 1024 bytes)
    const MAX_SIZE = 500 * 1024;
    
    let mainImageUrl = "https://images.pexels.com/photos/8501698/pexels-photo-8501698.jpeg"; // Default
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Main image exceeds 500KB limit" }, { status: 400 });
      }
      const fileId = await uploadToGridFS(imageFile);
      mainImageUrl = `/api/image/${fileId}`;
    }

    let detailedImageUrls: string[] = [];
    for (const file of imagesFiles) {
      if (file && file.size > 0) {
        if (file.size > MAX_SIZE) {
          return NextResponse.json({ success: false, message: `Image ${file.name} exceeds 500KB limit` }, { status: 400 });
        }
        const fileId = await uploadToGridFS(file);
        detailedImageUrls.push(`/api/image/${fileId}`);
      }
    }

    let sizes: { size: string; stock: number }[] = [];
    if (sizesStr) {
      try {
        sizes = JSON.parse(sizesStr);
      } catch (e) {
        sizes = sizesStr.split(",").map(s => ({ size: s.trim(), stock: 10 })).filter(x => x.size);
      }
    }

    // Auto-generate a unique numerical id
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 101;

    // ─── SKU Generation ───────────────────────────────────────────────────────
    // Format: SAH-[CAT3]-[ID]-[SIZECODE]-[RAND4]
    // Examples:
    //   SAH-ANI-101-34Y-78Y-4823  (Animal Costume, sizes 3-4 Yrs to 7-8 Yrs)
    //   SAH-BRD-102-S26-7231      (Birds Costume, single size S26)
    //   SAH-FRU-103-NS-9012       (Fruit Costume, no sizes defined)

    /** Encode a single size string into a short code */
    function encodeSingleSize(sizeStr: string): string {
      const clean = sizeStr.trim();

      // "Size 24" / "size24" → S24
      const numberedMatch = clean.match(/^[Ss]ize\s*(\d+)/);
      if (numberedMatch) return `S${numberedMatch[1]}`;

      // "3-4 Yrs" / "3-4 Years" / "3-4 yr" → 34Y
      const yearRangeMatch = clean.match(/^(\d+)-(\d+)\s*[Yy]/);
      if (yearRangeMatch) return `${yearRangeMatch[1]}${yearRangeMatch[2]}Y`;

      // "3 Yrs" / "3 Years" → 3Y
      const singleYearMatch = clean.match(/^(\d+)\s*[Yy]/);
      if (singleYearMatch) return `${singleYearMatch[1]}Y`;

      // Fallback: strip spaces, uppercase first 4 chars
      return clean.replace(/\s+/g, "").substring(0, 4).toUpperCase();
    }

    /** Build size code from the full sizes array */
    function buildSizeCode(sizeList: { size: string; stock: number }[]): string {
      const valid = sizeList.filter(s => s.size.trim());
      if (valid.length === 0) return "NS"; // No Size
      if (valid.length === 1) return encodeSingleSize(valid[0].size);
      // For multiple sizes: encode first and last to show the range
      const first = encodeSingleSize(valid[0].size);
      const last  = encodeSingleSize(valid[valid.length - 1].size);
      return first === last ? first : `${first}-${last}`;
    }

    const catAbbrev  = category.substring(0, 3).toUpperCase();
    const sizeCode   = buildSizeCode(sizes);
    const randomNum  = Math.floor(1000 + Math.random() * 9000);
    const sku        = `SAH-${catAbbrev}-${nextId}-${sizeCode}-${randomNum}`;
    // ─────────────────────────────────────────────────────────────────────────

    const computedStock = sizes.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
    const whatsIncluded = whatsIncludedStr ? whatsIncludedStr.split("\n").map(s => s.trim()).filter(Boolean) : [];

    const product = await Product.create({
      id: nextId,
      sku,
      title,
      category,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      ...(netPriceStr && !isNaN(parseFloat(netPriceStr)) ? { netPrice: parseFloat(netPriceStr) } : {}),
      image: mainImageUrl,
      images: detailedImageUrls,
      stock: computedStock,
      description: description || "",
      rating: 4.5,
      tag: tag || "",
      material: material || "",
      sizes,
      whatsIncluded,
      careInstructions: careInstructions || "",
      featured: featuredStr === "true"
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { uploadToGridFS } from "@/utils/gridfs";


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    await dbConnect();

    // Size limit check (500KB = 500 * 1024 bytes)
    const MAX_SIZE = 500 * 1024;
    
    let updateData: any = {};
    
    const fields = ['title', 'category', 'description', 'ytVideoUrl', 'tag', 'material', 'careInstructions'];
    fields.forEach(f => {
      const val = formData.get(f);
      if (val !== null) updateData[f] = val;
    });

    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    const sizesStr = formData.get("sizes");
    if (sizesStr !== null) {
      try {
        updateData.sizes = JSON.parse(sizesStr as string);
      } catch (e) {
        updateData.sizes = (sizesStr as string).split(",").map(s => ({ size: s.trim(), stock: 10 })).filter(x => x.size);
      }
      updateData.stock = updateData.sizes.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
    }

    const whatsIncludedStr = formData.get("whatsIncluded");
    if (whatsIncludedStr !== null) {
      updateData.whatsIncluded = (whatsIncludedStr as string).split("\n").map(s => s.trim()).filter(Boolean);
    }



    // ─── Color Variants ──────────────────────────────────────────────────────
    const colorsMetaStr = formData.get("colorsMeta") as string;
    const colorImageFiles = formData.getAll("colorImages") as File[];

    if (colorsMetaStr) {
      try {
        const colorsMeta: { name: string; title?: string; featured?: boolean; ytVideoUrl?: string; hasSizeGuide?: boolean; sizeGuide?: any[]; sizes: any[]; imageCount: number; existingImages?: string[] }[] = JSON.parse(colorsMetaStr);
        
        let colorImageIdx = 0;
        const colors: { name: string; title?: string; featured: boolean; images: string[]; ytVideoUrl?: string; sizeGuide?: any[]; sizes: any[] }[] = [];
        
        for (const meta of colorsMeta) {
          const colorImages: string[] = [...(meta.existingImages || [])];
          
          for (let i = 0; i < meta.imageCount; i++) {
            const file = colorImageFiles[colorImageIdx];
            if (file && file.size > 0) {
              if (file.size > MAX_SIZE) {
                return NextResponse.json({ success: false, message: `Image in color "${meta.name}" exceeds 500KB limit` }, { status: 400 });
              }
              const fileId = await uploadToGridFS(file);
              colorImages.push(`/api/image/${fileId}`);
            }
            colorImageIdx++;
          }

          colors.push({
            name: meta.name,
            title: meta.title,
            featured: meta.featured || false,
            images: colorImages,
            ytVideoUrl: meta.ytVideoUrl || "",
            sizeGuide: meta.hasSizeGuide ? meta.sizeGuide : undefined,
            sizes: meta.sizes,
          });
        }
        
        updateData.colors = colors;
        
        // Recompute total stock from all color sizes
        updateData.stock = colors.reduce((sum, c) => sum + c.sizes.reduce((s, sz) => s + (Number(sz.stock) || 0), 0), 0);
        
        // Also update the flat sizes array with the union for backward compat
        updateData.sizes = colors.flatMap(c => c.sizes);
        
        // Auto-update global main image
        if (colors.length > 0 && colors[0].images.length > 0) {
          updateData.image = colors[0].images[0];
        }
      } catch (e) {
        console.error("Error parsing colorsMeta:", e);
      }
    } else {
      // If colorsMeta is explicitly not sent but "clearColors" flag is set, clear colors
      const clearColors = formData.get("clearColors");
      if (clearColors === "true") {
        updateData.colors = [];
      }
    }

    // ─── Legacy images (no colors) ───────────────────────────────────────────
    if (!colorsMetaStr) {
      const keepImagesStr = formData.get("keepImages");
      let keepImages: string[] = [];
      if (keepImagesStr) {
        try { keepImages = JSON.parse(keepImagesStr as string); } catch {}
      }

      const imagesFiles = formData.getAll("images") as File[];
      let newImageUrls: string[] = [];
      for (const file of imagesFiles) {
        if (file && file.size > 0) {
          if (file.size > MAX_SIZE) {
            return NextResponse.json({ success: false, message: `Image ${file.name} exceeds 500KB limit` }, { status: 400 });
          }
          const fileId = await uploadToGridFS(file);
          newImageUrls.push(`/api/image/${fileId}`);
        }
      }

      if (keepImagesStr !== null || newImageUrls.length > 0) {
        updateData.images = [...keepImages, ...newImageUrls];
        if (updateData.images.length > 0) {
          updateData.image = updateData.images[0];
        }
      }
    }

    // ─── Calculate Global Base Prices ─────────────────────────────────────────
    if (updateData.sizes && updateData.sizes.length > 0) {
      const validPrices = updateData.sizes.map((s: any) => Number(s.price)).filter((p: number) => !isNaN(p) && p > 0);
      if (validPrices.length > 0) updateData.price = Math.min(...validPrices);
      
      const validMrps = updateData.sizes.map((s: any) => Number(s.mrp)).filter((p: number) => !isNaN(p) && p > 0);
      if (validMrps.length > 0) updateData.mrp = Math.min(...validMrps);
      
      const validNetPrices = updateData.sizes.map((s: any) => Number(s.netPrice)).filter((p: number) => !isNaN(p) && p > 0);
      if (validNetPrices.length > 0) updateData.netPrice = Math.min(...validNetPrices);
    }

    let product;
    if (!isNaN(Number(id))) {
      product = await Product.findOneAndUpdate({ id: Number(id) }, updateData, { new: true });
    } else {
      product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    let product;
    if (!isNaN(Number(id))) {
      product = await Product.findOne({ id: Number(id) });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await dbConnect();
    let result;
    if (!isNaN(Number(id))) {
      result = await Product.findOneAndDelete({ id: Number(id) });
    } else {
      result = await Product.findByIdAndDelete(id);
    }

    if (!result) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

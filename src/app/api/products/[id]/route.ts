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
    
    const fields = ['title', 'category', 'price', 'mrp', 'netPrice', 'stock', 'description', 'tag', 'material', 'careInstructions'];
    fields.forEach(f => {
      const val = formData.get(f);
      if (val !== null) updateData[f] = val;
    });

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.mrp) updateData.mrp = parseFloat(updateData.mrp);
    if (updateData.netPrice) updateData.netPrice = parseFloat(updateData.netPrice);
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

    const featuredStr = formData.get("featured");
    if (featuredStr !== null) {
      updateData.featured = featuredStr === "true";
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: "Main image exceeds 500KB limit" }, { status: 400 });
      }
      const fileId = await uploadToGridFS(imageFile);
      updateData.image = `/api/image/${fileId}`;
    }

    // keepImages: existing DB URLs the admin chose to keep
    const keepImagesStr = formData.get("keepImages");
    let keepImages: string[] = [];
    if (keepImagesStr) {
      try { keepImages = JSON.parse(keepImagesStr as string); } catch {}
    }

    // Upload any new detailed image files
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

    // Final images = kept existing + newly uploaded
    if (keepImagesStr !== null || newImageUrls.length > 0) {
      updateData.images = [...keepImages, ...newImageUrls];
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

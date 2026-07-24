import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import StorefrontAsset from "@/models/StorefrontAsset";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadToGridFS } from "@/utils/gridfs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const imageFile = formData.get("image") as File;

    if (!id || !imageFile) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (imageFile.size > 2 * 1024 * 1024) { // 2MB limit
      return NextResponse.json({ success: false, error: "Image exceeds 2MB limit" }, { status: 400 });
    }

    const fileId = await uploadToGridFS(imageFile);
    const imageUrl = `/api/image/${fileId}`;

    const asset = await StorefrontAsset.findByIdAndUpdate(
      id,
      { image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, asset }, { status: 200 });
  } catch (error: any) {
    console.error("Update Storefront Asset Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

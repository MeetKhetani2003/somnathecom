import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Banner } from "@/models/Banner";

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error("Fetch banners error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await dbConnect();
    const banner = await Banner.create(data);
    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("Create banner error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    await dbConnect();
    const { id, ...updateData } = data;
    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("Update banner error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await dbConnect();
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error: any) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

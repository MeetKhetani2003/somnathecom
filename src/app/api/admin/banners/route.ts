import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Banner } from "@/models/Banner";

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error("Fetch banners error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Inquiry } from "@/models/Inquiry";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    await dbConnect();
    const inquiry = await Inquiry.create({ name, email, message });
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

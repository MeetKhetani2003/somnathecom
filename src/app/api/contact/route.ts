import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Inquiry from "@/models/Inquiry";
import { sendInquiryEmail } from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Please provide all required fields" },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send email notification to admin asynchronously (don't await so we can return response faster)
    sendInquiryEmail({ name, email, phone, subject, message }).catch(err => {
      console.error("Error sending inquiry email:", err);
    });

    return NextResponse.json(
      { success: true, data: inquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Inquiry } from "@/models/Inquiry";
import { sendBulkInquiryEmails } from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, productId, productTitle, quantity, eventDate } = await req.json();

    if (!name || !email || !message || !productId || !productTitle || !quantity || !eventDate) {
      return NextResponse.json({ success: false, message: "All bulk inquiry fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Create the bulk inquiry entry in the database
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      productId: Number(productId),
      productTitle,
      quantity: Number(quantity),
      eventDate,
      type: "bulk",
      status: "pending"
    });

    // Send emails
    try {
      await sendBulkInquiryEmails({
        name,
        email,
        phone,
        message,
        productId: Number(productId),
        productTitle,
        quantity: Number(quantity),
        eventDate
      });
    } catch (emailErr) {
      console.error("Error sending bulk inquiry emails:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Bulk inquiry submitted successfully", inquiry });

  } catch (error: any) {
    console.error("Error in bulk inquiry API:", error);
    return NextResponse.json({ success: false, message: error.message || "Bulk inquiry server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { sendInvoiceEmail } from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required." }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    // Prevent duplicate emails
    if (order.invoiceSent) {
      return NextResponse.json({ success: true, message: "Invoice email has already been sent." });
    }

    if (!order.shippingDetails) {
      return NextResponse.json({ success: false, message: "Order shipping details are missing." }, { status: 400 });
    }

    // Send invoice email
    await sendInvoiceEmail({
      orderId: order._id.toString(),
      customerName: order.shippingDetails.name,
      email: order.email,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      address: order.shippingDetails.address,
      phone: order.shippingDetails.phone,
    });

    // Mark as sent
    order.invoiceSent = true;
    await order.save();

    return NextResponse.json({ success: true, message: "Invoice email dispatched successfully." });
  } catch (error: any) {
    console.error("Error sending invoice email in API endpoint:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to send email" }, { status: 500 });
  }
}

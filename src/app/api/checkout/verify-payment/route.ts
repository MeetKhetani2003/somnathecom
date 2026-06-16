import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Reservation } from "@/models/Reservation";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !orderId) {
      return NextResponse.json({ success: false, message: "Missing verification parameters" }, { status: 400 });
    }

    await dbConnect();

    // Find local order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Local order not found" }, { status: 404 });
    }

    // Verify payment signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_secret === "placeholder_secret";

    let signatureVerified = false;

    if (isPlaceholder) {
      // Automatic bypass in dev / placeholder mode
      signatureVerified = true;
    } else {
      if (razorpay_signature) {
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
          .createHmac("sha256", key_secret)
          .update(text)
          .digest("hex");
        signatureVerified = generated_signature === razorpay_signature;
      }
    }

    if (!signatureVerified) {
      return NextResponse.json({ success: false, message: "Payment signature verification failed" }, { status: 400 });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    await order.save();

    // Mark inventory reservation as completed (inactive)
    const reservation = await Reservation.findOne({ orderId: order._id });
    if (reservation) {
      reservation.active = false;
      await reservation.save();
    }



    return NextResponse.json({ success: true, message: "Payment verified and order finalized" });

  } catch (error: any) {
    console.error("Error in verify-payment API:", error);
    return NextResponse.json({ success: false, message: error.message || "Verification error" }, { status: 500 });
  }
}

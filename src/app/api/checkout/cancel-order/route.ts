import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Reservation } from "@/models/Reservation";
import { Product } from "@/models/Product";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Find and check active reservation
    const reservation = await Reservation.findOne({ orderId: order._id, active: true });
    if (reservation) {
      // Restore stock for all reserved products
      for (const item of reservation.items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          if (product.sizes && product.sizes.length > 0 && item.size) {
            const sizeObj = product.sizes.find((s: any) => s.size === item.size);
            if (sizeObj) {
              sizeObj.stock += item.quantity;
            }
          }
          product.stock += item.quantity;
          await product.save();
        }
      }

      // Mark reservation as inactive
      reservation.active = false;
      await reservation.save();
    }

    // 3. Mark payment status as failed
    order.paymentStatus = "failed";
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled and stock restored successfully" });

  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ success: false, message: error.message || "Cancellation error" }, { status: 500 });
  }
}

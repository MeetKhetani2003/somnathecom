import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const orderId = searchParams.get("orderId");
    const exchangeOnly = searchParams.get("exchangeOnly") === "true";

    await dbConnect();

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }
    
    let query: any = {};
    if (email) {
      query = { email };
    }
    if (exchangeOnly) {
      query.exchangeRequested = true;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orderId, shippingStatus, trackingNumber, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Update shipping status and handle stock restoration if cancelled
    if (shippingStatus) {
      if (shippingStatus === "Cancelled" && order.shippingStatus !== "Cancelled") {
        for (const item of order.items) {
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
      }
      order.shippingStatus = shippingStatus;
    }

    // Update payment status if provided
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

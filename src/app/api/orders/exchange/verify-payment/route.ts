import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId, newAddress, newSizes } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !orderId) {
      return NextResponse.json({ success: false, message: "Missing verification parameters" }, { status: 400 });
    }

    await dbConnect();

    // Verify payment signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_secret === "placeholder_secret";

    let signatureVerified = false;

    if (isPlaceholder) {
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

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Eligibility check: 7 days limit
    const orderAgeInDays = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (orderAgeInDays > 7) {
      return NextResponse.json({ success: false, message: "Exchanges are only allowed within 7 days of order placement" }, { status: 400 });
    }

    if (order.shippingStatus === "Cancelled") {
      return NextResponse.json({ success: false, message: "Cancelled orders cannot be exchanged" }, { status: 400 });
    }

    // Perform stock updates and edit sizes in order
    const originalSizes: any[] = [];
    const recordedNewSizes: any[] = [];

    if (newSizes && newSizes.length > 0) {
      // Re-verify stock once more
      for (const reqItem of newSizes) {
        const orderItem = order.items.find((item: any) => item.productId === reqItem.productId && item.size === reqItem.oldSize);
        if (orderItem && reqItem.newSize && reqItem.newSize !== orderItem.size) {
          const product = await Product.findOne({ id: reqItem.productId });
          if (product && product.sizes && product.sizes.length > 0) {
            const newSizeObj = product.sizes.find((s: any) => s.size === reqItem.newSize);
            if (newSizeObj && newSizeObj.stock < orderItem.quantity) {
              return NextResponse.json({ 
                success: false, 
                message: `Insufficient stock for size ${reqItem.newSize} of ${product.title} during confirmation.` 
              }, { status: 400 });
            }
          }
        }
      }

      // Proceed with adjustments
      for (const reqItem of newSizes) {
        const orderItem = order.items.find((item: any) => item.productId === reqItem.productId && item.size === reqItem.oldSize);
        if (orderItem && reqItem.newSize && reqItem.newSize !== orderItem.size) {
          originalSizes.push({ productId: reqItem.productId, size: orderItem.size });
          recordedNewSizes.push({ productId: reqItem.productId, size: reqItem.newSize });

          const product = await Product.findOne({ id: reqItem.productId });
          if (product && product.sizes && product.sizes.length > 0) {
            // Restore stock of old size
            const oldSizeObj = product.sizes.find((s: any) => s.size === orderItem.size);
            if (oldSizeObj) {
              oldSizeObj.stock += orderItem.quantity;
            }
            // Deduct stock of new size
            const newSizeObj = product.sizes.find((s: any) => s.size === reqItem.newSize);
            if (newSizeObj) {
              newSizeObj.stock -= orderItem.quantity;
            }
            await product.save();
          }
          // Update size in order item
          orderItem.size = reqItem.newSize;
        }
      }
    }

    // Address Update
    let previousAddress = "";
    let updatedAddress = order.shippingDetails?.address || "";
    if (newAddress && newAddress.trim() && newAddress.trim() !== updatedAddress) {
      previousAddress = updatedAddress;
      updatedAddress = newAddress.trim();
      if (order.shippingDetails) {
        order.shippingDetails.address = updatedAddress;
      }
    }

    const flatExchangeFee = 120;
    order.exchangeFee = flatExchangeFee;
    order.total += flatExchangeFee;
    order.exchangeRequested = true;
    order.shippingStatus = "Exchange Processing";
    order.paymentMethod = "online"; // Since payment verified online

    order.exchangeDetails = {
      originalSizes,
      newSizes: recordedNewSizes,
      previousAddress,
      newAddress: previousAddress ? updatedAddress : "",
      requestedAt: new Date(),
      paymentMethod: "online",
      razorpayPaymentId: razorpay_payment_id
    } as any;

    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Exchange payment verified and request processed successfully", 
      order 
    });

  } catch (error: any) {
    console.error("Error verifying order exchange payment:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

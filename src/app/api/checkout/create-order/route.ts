import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { Reservation } from "@/models/Reservation";
import { Coupon } from "@/models/Coupon";
import Razorpay from "razorpay";
import { createShiprocketOrder } from "@/utils/shiprocket";
import { sendOutOfStockEmail } from "@/utils/emailService";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingDetails, email, couponCode, referralCode, username, userId, paymentMethod, shippingCost } = await req.json();

    if (!cartItems || cartItems.length === 0 || !shippingDetails || !email) {
      return NextResponse.json({ success: false, message: "Missing required details" }, { status: 400 });
    }

    await dbConnect();

    // 1. Validate Stock and fetch products
    const itemsToOrder = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = await Product.findOne({ id: item.id });
      if (!product) {
        return NextResponse.json({ success: false, message: `Product ${item.title} not found` }, { status: 404 });
      }

      // Color-specific stock check
      const hasColors = product.colors && product.colors.length > 0;
      if (hasColors && item.selectedColor) {
        const colorObj = product.colors.find((c: any) => c.name === item.selectedColor);
        if (!colorObj) {
          return NextResponse.json({
            success: false,
            message: `Color ${item.selectedColor} is not available for ${product.title}.`
          }, { status: 400 });
        }
        if (item.selectedSize) {
          const sizeObj = colorObj.sizes.find((s: any) => s.size === item.selectedSize);
          if (!sizeObj) {
            return NextResponse.json({
              success: false,
              message: `Size ${item.selectedSize} in ${item.selectedColor} is not available for ${product.title}.`
            }, { status: 400 });
          }
          if (sizeObj.stock < item.quantity) {
            return NextResponse.json({
              success: false,
              message: `Insufficient stock for ${product.title} (${item.selectedColor} / ${sizeObj.size}). Only ${sizeObj.stock} left.`
            }, { status: 400 });
          }
        }
      } else if (product.sizes && product.sizes.length > 0 && item.selectedSize) {
        const sizeObj = product.sizes.find((s: any) => s.size === item.selectedSize);
        if (!sizeObj) {
          return NextResponse.json({
            success: false,
            message: `Size ${item.selectedSize} is not available for ${product.title}.`
          }, { status: 400 });
        }
        if (sizeObj.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Insufficient stock for ${product.title} (${sizeObj.size}). Only ${sizeObj.stock} left.`
          }, { status: 400 });
        }
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json({
            success: false,
            message: `Insufficient stock for ${product.title}. Only ${product.stock} left.`
          }, { status: 400 });
        }
      }

      subtotal += product.price * item.quantity;
      itemsToOrder.push({
        productDocument: product,
        productId: Number(item.id),
        title: product.title || item.title,
        price: product.price || item.price || 0,
        quantity: item.quantity,
        image: product.image,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || ""
      });
    }

    // 2. Calculate Coupon Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
        }
      }
    }

    const finalShippingCost = paymentMethod === "cod" ? (shippingCost || 0) : 0;
    const baseTotal = subtotal - discount;
    const gstAmount = Math.round(baseTotal * 0.05);
    const platformFee = Math.round(baseTotal * 0.02);
    const total = baseTotal + finalShippingCost + gstAmount + platformFee;

    // 3. Deduct Stock Temporarily (Reservation)
    for (const item of itemsToOrder) {
      const hasColors = item.productDocument.colors && item.productDocument.colors.length > 0;
      let variantOut = "";
      let isOut = false;

      if (hasColors && item.selectedColor) {
        const colorObj = item.productDocument.colors.find((c: any) => c.name === item.selectedColor);
        if (colorObj && item.selectedSize) {
          const sizeObj = colorObj.sizes.find((s: any) => s.size === item.selectedSize);
          if (sizeObj) {
            sizeObj.stock -= item.quantity;
            if (sizeObj.stock <= 0) {
              sizeObj.stock = 0;
              isOut = true;
              variantOut = `Color: ${item.selectedColor}, Size: ${item.selectedSize}`;
            }
          }
        }
        // Synchronize flat sizes array with color-specific sizes for backward compatibility
        item.productDocument.set("sizes", item.productDocument.colors.flatMap((c: any) => c.sizes));
      } else if (item.productDocument.sizes && item.productDocument.sizes.length > 0 && item.selectedSize) {
        const sizeObj = item.productDocument.sizes.find((s: any) => s.size === item.selectedSize);
        if (sizeObj) {
          sizeObj.stock -= item.quantity;
          if (sizeObj.stock <= 0) {
            sizeObj.stock = 0;
            isOut = true;
            variantOut = `Size: ${item.selectedSize}`;
          }
        }
      }
      item.productDocument.stock -= item.quantity;
      if (item.productDocument.stock <= 0) {
        item.productDocument.stock = 0;
        isOut = true;
      }
      await Product.updateOne(
        { _id: item.productDocument._id },
        { 
          $set: { 
            colors: item.productDocument.colors,
            sizes: item.productDocument.sizes,
            stock: item.productDocument.stock 
          }
        }
      );

      if (isOut) {
        try {
          await sendOutOfStockEmail(item.title, variantOut);
        } catch (mailErr) {
          console.error("Failed to send out of stock email notification:", mailErr);
        }
      }
    }

    // 4. Create local pending Order
    const localOrder = await Order.create({
      userId: userId || email,
      email,
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.selectedSize || null,
        color: item.selectedColor || null
      })),
      shippingDetails,
      subtotal,
      discount,
      shippingCost: finalShippingCost,
      gstAmount,
      platformFee,
      total,
      couponUsed: couponCode || null,
      referralCode: referralCode || null,
      username: username || email || "Guest User",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "online",
      shippingStatus: "Processing"
    });

    // If Cash on Delivery and there is NO shipping cost, bypass Razorpay flow
    if (paymentMethod === "cod" && finalShippingCost === 0) {
      await Reservation.create({
        orderId: localOrder._id,
        items: itemsToOrder.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.selectedSize || null
        })),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        active: false // Inactive since it's COD
      });

      // PUSH COD ORDER TO SHIPROCKET IMMEDIATELY
      try {
        const shiprocketRes = await createShiprocketOrder(localOrder);
        if (shiprocketRes && shiprocketRes.shipment_id) {
          localOrder.trackingNumber = shiprocketRes.shipment_id.toString();
          await localOrder.save();
        }
      } catch (shiprocketErr) {
        console.error("Failed to create order in Shiprocket for COD order:", shiprocketErr);
      }

      return NextResponse.json({
        success: true,
        orderId: localOrder._id.toString(),
        isCod: true
      });
    }

    // 5. Create Stock Reservation entry (expires in 10 minutes)
    await Reservation.create({
      orderId: localOrder._id,
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.selectedSize || null
      })),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      active: true
    });

    // 6. Initiate Razorpay Order
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    const isPlaceholder = key_id === "rzp_test_placeholder" || key_secret === "placeholder_secret";

    let rzpOrderId = "";
    let rzpAmount = (paymentMethod === "cod" ? finalShippingCost : total) * 100;

    if (isPlaceholder) {
      rzpOrderId = "mock_rzp_" + Math.random().toString(36).substring(2, 11);
    } else {
      const razorpay = new Razorpay({
        key_id,
        key_secret
      });

      const rzpOrder = await razorpay.orders.create({
        amount: rzpAmount, // Razorpay works in paise
        currency: "INR",
        receipt: localOrder._id.toString()
      });
      rzpOrderId = rzpOrder.id;
      rzpAmount = typeof rzpOrder.amount === "string" ? parseInt(rzpOrder.amount, 10) : rzpOrder.amount;
    }

    // Update local order with Razorpay Order ID
    localOrder.razorpayOrderId = rzpOrderId;
    await localOrder.save();

    return NextResponse.json({
      success: true,
      orderId: localOrder._id.toString(),
      razorpayOrderId: rzpOrderId,
      amount: rzpAmount,
      key: key_id
    });

  } catch (error: any) {
    console.error("Error creating checkout order:", error);
    return NextResponse.json({ success: false, message: error.message || "Server checkout error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { customerDetails, items, discount, paymentStatus, shippingStatus } = await req.json();

    if (!items || items.length === 0 || !customerDetails?.name || !customerDetails?.phone) {
      return NextResponse.json({ success: false, message: "Missing items or customer details" }, { status: 400 });
    }

    await dbConnect();

    // 1. Validate Stock and retrieve product details
    const itemsToOrder = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return NextResponse.json({ success: false, message: `Product ID ${item.productId} not found` }, { status: 404 });
      }

      // Check size-specific stock if size is provided
      if (product.sizes && product.sizes.length > 0 && item.size) {
        const sizeObj = product.sizes.find((s: any) => s.size === item.size);
        if (!sizeObj) {
          return NextResponse.json({ success: false, message: `Size ${item.size} is not available for ${product.title}.` }, { status: 400 });
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
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        selectedSize: item.size || ""
      });
    }

    // 2. Deduct Stock
    for (const item of itemsToOrder) {
      const product = item.productDocument;
      const hasColors = product.colors && product.colors.length > 0;
      
      if (hasColors && item.selectedSize) {
        // Find the first color variant that has this size in stock, or fallback to the first color that has this size
        let targetColorObj = product.colors.find((c: any) => 
          c.sizes.some((s: any) => s.size === item.selectedSize && s.stock >= item.quantity)
        );
        if (!targetColorObj) {
          targetColorObj = product.colors.find((c: any) => 
            c.sizes.some((s: any) => s.size === item.selectedSize)
          );
        }
        
        if (targetColorObj) {
          const sizeObj = targetColorObj.sizes.find((s: any) => s.size === item.selectedSize);
          if (sizeObj) {
            sizeObj.stock -= item.quantity;
          }
        }
        // Synchronize flat sizes array with color-specific sizes for backward compatibility
        product.set("sizes", product.colors.flatMap((c: any) => c.sizes));
      } else if (product.sizes && product.sizes.length > 0 && item.selectedSize) {
        const sizeObj = product.sizes.find((s: any) => s.size === item.selectedSize);
        if (sizeObj) {
          sizeObj.stock -= item.quantity;
        }
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const manualDiscount = Number(discount) || 0;
    const total = Math.max(0, subtotal - manualDiscount);

    // 3. Create the Offline Order
    const offlineOrder = await Order.create({
      userId: customerDetails.email || "offline_walkin",
      email: customerDetails.email || "offline@saheli.com",
      items: itemsToOrder.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.selectedSize || null
      })),
      shippingDetails: {
        name: customerDetails.name,
        address: customerDetails.address || "Offline Walk-in Counter",
        phone: customerDetails.phone
      },
      subtotal,
      discount: manualDiscount,
      total,
      paymentMethod: "offline",
      paymentStatus: paymentStatus || "paid",
      shippingStatus: shippingStatus || "Delivered",
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      orderId: offlineOrder._id.toString(),
      order: offlineOrder
    });

  } catch (error: any) {
    console.error("Error creating offline order:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to create offline order" }, { status: 500 });
  }
}

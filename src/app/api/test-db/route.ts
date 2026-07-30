import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";

export async function GET() {
  await dbConnect();
  
  const order = await Order.findById("6a6b5c1d3c960167cda00804");
  if (order) {
    // Recompute total without discount
    const baseTotal = order.subtotal;
    const gstAmount = Math.round(baseTotal * 0.05);
    const platformFee = Math.round(baseTotal * 0.02);
    const finalShippingCost = 0; // Since it was khata/online
    order.total = baseTotal + finalShippingCost + gstAmount + platformFee;
    await order.save();
  }

  return NextResponse.json({ success: true, order });
}

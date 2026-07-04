import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { getShiprocketAwbFromApi, createShiprocketOrder, getShiprocketTrackStatus } from "@/utils/shiprocket";

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

    let trackingNumber = order.trackingNumber || "";

    // 1. If we don't have a tracking number, check if it already exists in Shiprocket
    if (!trackingNumber || trackingNumber.startsWith("SR_MOCK")) {
      console.log(`[Sync AWB] Checking if order ${orderId} already exists in Shiprocket...`);
      const existingAwb = await getShiprocketAwbFromApi(orderId);
      if (existingAwb) {
        trackingNumber = existingAwb;
        order.trackingNumber = existingAwb;
      } else {
        // 2. If not found in Shiprocket, push order and generate/assign AWB
        console.log(`[Sync AWB] Order ${orderId} not found in Shiprocket. Pushing order now...`);
        const shiprocketRes = await createShiprocketOrder(order);
        if (shiprocketRes && shiprocketRes.shipment_id) {
          trackingNumber = shiprocketRes.shipment_id.toString();
          order.trackingNumber = trackingNumber;
        }
      }
    }

    // 3. If we now have a real tracking number, fetch the latest status from Shiprocket
    let updatedStatus = order.shippingStatus;
    if (trackingNumber && !trackingNumber.startsWith("SR_MOCK")) {
      console.log(`[Sync AWB] Fetching tracking status for AWB: ${trackingNumber}`);
      const latestStatus = await getShiprocketTrackStatus(trackingNumber);
      if (latestStatus) {
        updatedStatus = latestStatus as any;
        order.shippingStatus = latestStatus as any;
        if (latestStatus === "Delivered" && !order.deliveredAt) {
          order.deliveredAt = new Date();
        }
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      trackingNumber,
      shippingStatus: updatedStatus,
      message: `AWB and status synced successfully. Tracking: ${trackingNumber || "None"}, Status: ${updatedStatus}`
    });

  } catch (error: any) {
    console.error("Error in sync-shiprocket API:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

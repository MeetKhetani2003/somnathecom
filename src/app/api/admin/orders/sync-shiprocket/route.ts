import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { getShiprocketAwbFromApi, createShiprocketOrder, getShiprocketTrackStatus } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { orderId, syncAll } = await req.json();

    await dbConnect();

    // Helper to sync single order
    const syncSingleOrder = async (order: any) => {
      if (order.isDebitPurchase) {
        return { orderId: order._id.toString(), trackingNumber: order.trackingNumber, shippingStatus: order.shippingStatus };
      }

      let trackingNumber = order.trackingNumber || "";

      // 1. Check if order exists in Shiprocket
      if (!trackingNumber) {
        console.log(`[Sync AWB] Checking if order ${order._id} already exists in Shiprocket...`);
        const existingAwb = await getShiprocketAwbFromApi(order._id.toString());
        if (existingAwb) {
          trackingNumber = existingAwb;
          order.trackingNumber = existingAwb;
        } else {
          // 2. If not found in Shiprocket, push order and generate/assign AWB
          console.log(`[Sync AWB] Order ${order._id} not found in Shiprocket. Pushing order now...`);
          try {
            const shiprocketRes = await createShiprocketOrder(order);
            if (shiprocketRes && shiprocketRes.shipment_id) {
              trackingNumber = shiprocketRes.shipment_id.toString();
              order.trackingNumber = trackingNumber;
            }
          } catch (createErr) {
            console.error(`[Sync AWB] Failed to push order ${order._id}:`, createErr);
          }
        }
      }

      // 3. Fetch latest tracking status from Shiprocket
      let updatedStatus = order.shippingStatus;
      if (trackingNumber) {
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
      return { orderId: order._id.toString(), trackingNumber, shippingStatus: updatedStatus };
    };

    if (syncAll) {
      console.log("[Sync AWB Batch] Starting batch sync for all active orders...");
      const activeOrders = await Order.find({ shippingStatus: { $ne: "Cancelled" } }).sort({ createdAt: -1 });
      const results = [];
      for (const ord of activeOrders) {
        const res = await syncSingleOrder(ord);
        results.push(res);
      }
      return NextResponse.json({
        success: true,
        count: results.length,
        message: `Synced ${results.length} active orders with Shiprocket.`,
        results,
      });
    }

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID or syncAll flag is required." }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const synced = await syncSingleOrder(order);

    return NextResponse.json({
      success: true,
      trackingNumber: synced.trackingNumber,
      shippingStatus: synced.shippingStatus,
      message: `AWB and status synced successfully. Tracking: ${synced.trackingNumber || "None"}, Status: ${synced.shippingStatus}`
    });

  } catch (error: any) {
    console.error("Error in sync-shiprocket API:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

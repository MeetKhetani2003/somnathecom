import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/utils/shiprocket";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, message: "Tracking number is required." },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing Shiprocket credentials" }, { status: 500 });
    }

    // 2. Fetch live tracking data from Shiprocket API
    try {
      console.log(`[Shiprocket API] Querying live tracking for AWB / Shipment ID ${trackingNumber}...`);
      let response = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = await response.json();
      
      // If AWB tracking fails or returned no tracking data, fallback to Shipment tracking API
      if (!response.ok || !data || !data.tracking_data || !data.tracking_data.shipment_track) {
        console.log(`[Shiprocket API] AWB track failed or empty. Falling back to shipment ID tracking for ${trackingNumber}...`);
        response = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${trackingNumber}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(`Shiprocket API responded with status ${response.status}`);
      }
      
      // Parse Shiprocket tracking response structure
      if (data && data.tracking_data && data.tracking_data.shipment_track) {
        const track = data.tracking_data.shipment_track[0];
        if (track && track.awb_code) {
          const scans = (track.scans || []).map((scan: any) => ({
            date: scan.date || scan.activity_at || "",
            activity: scan.activity || scan.status || "",
            location: scan.location || "",
            status: scan.status || ""
          }));

          return NextResponse.json({
            success: true,
            isMock: false,
            awb: track.awb_code,
            courier: track.courier_name || "Shiprocket Partner",
            currentStatus: track.current_status || "In Transit",
            scans: scans // list already sorted or raw from Shiprocket
          });
        }
      }

      throw new Error("No tracking info found in Shiprocket response.");
    } catch (liveErr: any) {
      console.error(`[Shiprocket API] Failed to query live tracking API (${liveErr.message || liveErr}).`);
      return NextResponse.json(
        { success: false, message: "Failed to retrieve live tracking data." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in tracking API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve tracking." },
      { status: 500 }
    );
  }
}

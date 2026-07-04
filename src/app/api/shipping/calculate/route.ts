import { NextResponse } from "next/server";
import { calculateShippingCost } from "@/utils/shiprocket";

export async function POST(req: Request) {
  try {
    const { delivery_postcode, weight, declared_value, cod } = await req.json();

    if (!delivery_postcode) {
      return NextResponse.json(
        { success: false, message: "Delivery postcode is required." },
        { status: 400 }
      );
    }

    const result = await calculateShippingCost(
      delivery_postcode,
      weight || 0.5,
      declared_value || 0,
      !!cod
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in shipping calculate API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to calculate shipping." },
      { status: 500 }
    );
  }
}

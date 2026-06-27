import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all coupons
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    
    // Fetch orders that used a coupon to calculate dynamic usage counts
    const orders = await Order.find({ couponUsed: { $ne: null } }).select("couponUsed").lean();
    
    const usageCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.couponUsed) {
        const code = order.couponUsed.toUpperCase();
        usageCounts[code] = (usageCounts[code] || 0) + 1;
      }
    });

    const couponsWithCount = coupons.map((c: any) => ({
      ...c,
      usedCount: usageCounts[c.code.toUpperCase()] || 0,
    }));

    return NextResponse.json({ success: true, coupons: couponsWithCount });
  } catch (error: any) {
    console.error("Fetch coupons error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { code, discountPercent, expiresAt, active, resellerName } = await req.json();
    await dbConnect();

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      active: active ?? true,
      resellerName: resellerName || "",
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, code, discountPercent, expiresAt, active, resellerName } = await req.json();
    await dbConnect();

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        code: code.toUpperCase(),
        discountPercent: Number(discountPercent),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        active,
        resellerName: resellerName || "",
      },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await dbConnect();

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

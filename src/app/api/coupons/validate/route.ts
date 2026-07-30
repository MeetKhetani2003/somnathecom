import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Coupon } from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    const { code, userEmail, userName } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, message: "Code is required" }, { status: 400 });
    }

    await dbConnect();
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or inactive coupon code" });
    }

    // Check expiry
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({ valid: false, message: "Coupon has expired" });
    }

    if (coupon.isDebitCoupon) {
      if (coupon.debitUserName && (userEmail || userName)) {
        if (coupon.debitUserName !== userEmail && coupon.debitUserName !== userName) {
          return NextResponse.json({ valid: false, message: "This Debit Coupon is not assigned to your account" });
        }
      } else if (coupon.debitUserName && !userEmail && !userName) {
         return NextResponse.json({ valid: false, message: "You must be logged in to use a Debit Coupon" });
      }

      if ((coupon.usageCount || 0) >= (coupon.usageLimit || 1)) {
        return NextResponse.json({ valid: false, message: "Your limit of coupon is reached" });
      }
      return NextResponse.json({ 
        valid: true, 
        discountPercent: coupon.discountPercent,
        isDebitCoupon: true,
        debitUserName: coupon.debitUserName 
      });
    }

    return NextResponse.json({ valid: true, discountPercent: coupon.discountPercent });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}

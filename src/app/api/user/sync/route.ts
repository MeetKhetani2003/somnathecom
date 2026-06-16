import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Missing email parameter" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      cart: user.cart || [],
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error("Error in sync GET:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, cart, wishlist } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Missing email" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (cart !== undefined) {
      user.cart = cart;
    }
    if (wishlist !== undefined) {
      user.wishlist = wishlist;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Sync successful",
      cart: user.cart,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error("Error in sync POST:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

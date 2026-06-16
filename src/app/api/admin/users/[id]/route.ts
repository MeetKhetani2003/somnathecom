import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";
import { Order } from "@/models/Order";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Fetch orders associated with this user (by email or userId)
    const orders = await Order.find({
      $or: [
        { userId: user._id.toString() },
        { email: user.email }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      user,
      orders
    });
  } catch (error) {
    console.error("Error in user details endpoint:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

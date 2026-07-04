import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, addresses, defaultAddress, phone } = await req.json();

    if (!email || !Array.isArray(addresses)) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload. Email and addresses array are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateFields: any = {
      addresses: addresses
    };
    if (phone) {
      updateFields.phone = phone;
    }
    if (typeof defaultAddress === "string") {
      updateFields.defaultAddress = defaultAddress;
    } else if (addresses.length > 0) {
      updateFields.defaultAddress = addresses[0];
    } else {
      updateFields.defaultAddress = "";
    }

    const result = await User.updateOne(
      { email },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      addresses: addresses,
      defaultAddress: updateFields.defaultAddress,
    });
  } catch (error: any) {
    console.error("Error updating user addresses:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

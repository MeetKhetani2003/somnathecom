import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { User } from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ success: false, message: "Missing email or role" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/utils/dbConnect";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { name, fullPath, group, isHidden } = await req.json();

    if (!name || !fullPath || !group) {
      return NextResponse.json({ success: false, message: "Name, fullPath, and group are required" }, { status: 400 });
    }

    const exists = await Category.findOne({ fullPath });
    if (exists) {
      return NextResponse.json({ success: false, message: "Category with this full path already exists" }, { status: 400 });
    }

    const category = await Category.create({ name, fullPath, group, isHidden: isHidden || false });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { id, name, fullPath, group, isHidden } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID is required" }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, fullPath, group, isHidden },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID is required" }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

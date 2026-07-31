import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    // If admin is requesting, return all categories. Otherwise, return only visible categories.
    const query = isAdmin ? {} : { isHidden: { $ne: true } };

    const categories = await Category.find(query).sort({ group: 1, name: 1 }).lean();

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

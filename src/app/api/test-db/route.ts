import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";

export async function GET() {
  await dbConnect();
  const prod = await Product.findOne({ title: /over size/i });
  return NextResponse.json(prod);
}

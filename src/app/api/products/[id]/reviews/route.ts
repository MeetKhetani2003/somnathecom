import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { Product } from "@/models/Product";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userName, userEmail, rating, comment } = await req.json();

    if (!userName || !userEmail || !rating || !comment) {
      return NextResponse.json({ success: false, message: "Missing required review fields" }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await dbConnect();
    
    let product;
    if (!isNaN(Number(id))) {
      product = await Product.findOne({ id: Number(id) });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (!product.reviews) {
      product.reviews = [] as any;
    }

    // Add review to subdocument array
    product.reviews.push({
      userName,
      userEmail,
      rating: ratingNum,
      comment,
      createdAt: new Date()
    });

    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));

    const savedProduct = await product.save();

    return NextResponse.json({ success: true, message: "Review added successfully", product: savedProduct });
  } catch (error: any) {
    console.error("Error adding review:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ success: false, message: "Missing review ID" }, { status: 400 });
    }

    await dbConnect();
    
    let product;
    if (!isNaN(Number(id))) {
      product = await Product.findOne({ id: Number(id) });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (!product.reviews) {
      product.reviews = [] as any;
    }

    // Filter out the review
    const initialLength = product.reviews.length;
    product.reviews = product.reviews.filter((r: any) => r._id.toString() !== reviewId) as any;

    if (product.reviews.length === initialLength) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      product.rating = Number((totalRating / product.reviews.length).toFixed(1));
    } else {
      product.rating = 4.5; // Reset to default if no reviews remain
    }

    const savedProduct = await product.save();

    return NextResponse.json({ success: true, message: "Review deleted successfully", product: savedProduct });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

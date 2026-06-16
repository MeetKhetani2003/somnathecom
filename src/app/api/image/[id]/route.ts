import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { getGridFSBucket } from "@/utils/gridfs";
import { ObjectId } from "mongodb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const bucket = getGridFSBucket();

    const objectId = new ObjectId(id);
    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (files.length === 0) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(objectId);
    
    const headers = new Headers();
    headers.set("Content-Type", (file as any).contentType || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Convert standard Node.js stream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, { headers });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

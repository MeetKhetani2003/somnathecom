import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

export function getGridFSBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }
  return new GridFSBucket(db, {
    bucketName: "images",
  });
}

export async function uploadToGridFS(file: File): Promise<string> {
  const bucket = getGridFSBucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    } as any);
    
    uploadStream.on("error", (error) => reject(error));
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    
    uploadStream.end(buffer);
  });
}

import { Schema, model, models } from "mongoose";

const InquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  productId: { type: Number },
  productTitle: { type: String },
  quantity: { type: Number },
  eventDate: { type: String },
  type: { type: String, enum: ["general", "bulk"], default: "general" },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Inquiry = models.Inquiry || model("Inquiry", InquirySchema);

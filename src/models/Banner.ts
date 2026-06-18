import { Schema, model, models } from "mongoose";

const BannerSchema = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    eyebrow: { type: String, default: "NEW COLLECTION" },
    cta: { type: String, default: "Shop Now" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = models.Banner || model("Banner", BannerSchema);

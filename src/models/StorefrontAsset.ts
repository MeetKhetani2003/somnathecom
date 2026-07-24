import { Schema, model, models } from "mongoose";

const StorefrontAssetSchema = new Schema(
  {
    type: { type: String, enum: ["hero", "category"], required: true },
    identifier: { type: String, required: true }, // e.g., "Hero Slide 1", "Ladies Collection > Night Suits"
    image: { type: String, required: true },
    title: { type: String }, // Optional, for display in admin UI if needed
  },
  { timestamps: true }
);

export const StorefrontAsset = models.StorefrontAsset || model("StorefrontAsset", StorefrontAssetSchema);
export default StorefrontAsset;

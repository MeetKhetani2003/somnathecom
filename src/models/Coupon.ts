import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date },
  resellerName: { type: String, default: "" },
});

export const Coupon = models.Coupon || model("Coupon", CouponSchema);

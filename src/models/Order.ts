import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  items: [
    {
      productId: { type: Number, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      size: { type: String },
      color: { type: String },
    },
  ],
  shippingDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" }
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponUsed: { type: String },
  referralCode: { type: String },
  username: { type: String },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymentMethod: { type: String, enum: ["online", "cod", "offline"], default: "online" },
  shippingStatus: { type: String, enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Exchange Processing"], default: "Processing" },
  trackingNumber: { type: String },
  invoiceSent: { type: Boolean, default: false },
  exchangeRequested: { type: Boolean, default: false },
  exchangeFee: { type: Number, default: 0 },
  exchangeDetails: {
    originalSizes: [{ productId: Number, size: String, color: String }],
    newSizes: [{ productId: Number, size: String, color: String }],
    previousAddress: String,
    newAddress: String,
    requestedAt: { type: Date },
  },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

if (models.Order) {
  delete (models as any).Order;
}

export const Order = model("Order", OrderSchema);


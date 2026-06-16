import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  addresses: [{ type: String }],
  defaultAddress: { type: String, default: "" },
  cart: [{
    id: { type: Number },
    title: { type: String },
    category: { type: String },
    price: { type: Number },
    mrp: { type: Number },
    rating: { type: Number },
    image: { type: String },
    tag: { type: String },
    description: { type: String },
    quantity: { type: Number }
  }],
  wishlist: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);

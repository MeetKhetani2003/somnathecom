import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  // Accept both cases; the set transform normalises to lowercase on assignment
  role: { type: String, enum: ["user", "admin"], default: "user", set: (v: string) => v?.toLowerCase() ?? "user" },
  addresses: [{
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    email: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" }
  }],
  defaultAddress: { type: Schema.Types.Mixed, default: null },
  phone: { type: String, default: "" },
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

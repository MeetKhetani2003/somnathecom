import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  netPrice: { type: Number },
  image: { type: String, required: true },
  tag: { type: String },
  description: { type: String },
  stock: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  material: { type: String },
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, default: 0 }
  }],
  colors: [{
    name: { type: String, required: true },
    images: [{ type: String }],
    sizes: [{
      size: { type: String, required: true },
      stock: { type: Number, default: 0 }
    }]
  }],
  whatsIncluded: [{ type: String }],
  careInstructions: { type: String },
  images: [{ type: String }],
  sku: { type: String, unique: true },
  reviews: {
    type: [{
      userName: { type: String, required: true },
      userEmail: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }
});

if (models.Product) {
  delete (models as any).Product;
}

export const Product = model("Product", ProductSchema);

import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  slug: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  netPrice: { type: Number },
  image: { type: String },
  tag: { type: String },
  description: { type: String },
  ytVideoUrl: { type: String },
  stock: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  material: { type: String },
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, default: 0 },
    price: { type: Number },
    mrp: { type: Number },
    netPrice: { type: Number },
    weight: { type: Number },
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }],
  colors: [{
    name: { type: String, required: true },
    title: { type: String }, // Variant specific title
    featured: { type: Boolean, default: false }, // Feature this specific variant
    images: [{ type: String }],
    ytVideoUrl: { type: String },
    sizeGuide: [{
      size: { type: String },
      chest: { type: String },
      waist: { type: String },
      hip: { type: String }
    }],
    sizes: [{
      size: { type: String, required: true },
      stock: { type: Number, default: 0 },
      price: { type: Number },
      mrp: { type: Number },
      netPrice: { type: Number },
      weight: { type: Number },
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
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

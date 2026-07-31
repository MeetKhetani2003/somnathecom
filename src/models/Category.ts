import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  fullPath: { type: String, required: true, unique: true },
  group: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

if (models.Category) {
  delete (models as any).Category;
}

export const Category = model("Category", CategorySchema);

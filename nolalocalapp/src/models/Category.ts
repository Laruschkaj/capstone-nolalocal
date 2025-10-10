import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Category color is required'],
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
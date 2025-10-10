import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    location: { type: String, required: true },
    imageUrl: { type: String },
    tips: [String], // Array of tips (e.g., "Free on Wednesdays!")
    priceRange: { type: String }, // Free, $, $$, $$$
    bestTimeToVisit: { type: String }, // "Weekday mornings", "Year-round", etc.
    website: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isOfficial: { type: Boolean, default: false }, // NolaLocal curated guides
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Guide = mongoose.models.Guide || mongoose.model('Guide', guideSchema);
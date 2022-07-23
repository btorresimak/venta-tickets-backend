import { Schema } from 'mongoose';

export const locationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    total: { type: Number, required: true },
    available: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

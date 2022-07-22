import { Schema } from 'mongoose';

export const ProfileSchema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    name: { type: String, required: true },
    services: [{ type: { _id: false, name: String, isEnabled: Boolean } }],
  },
  {
    timestamps: true,
  },
);

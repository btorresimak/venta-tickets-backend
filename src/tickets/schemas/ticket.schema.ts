import { Schema } from 'mongoose';

export const ticketSchema = new Schema(
  {
    number: { type: Number, required: true },
    location: { type: String, required: true }, // General - Arena - VIP
    isActive: { type: Boolean, default: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'users' },
    paymentMethod: { type: String, uppercase: true, required: true }, // Cash - Credit Card - Debit Card - Paypal - Payphone
    collectionType: { type: String, uppercase: true, required: true }, // Reseller - Point of Sale - Web
    issuedDate: { type: Date, required: true, default: Date.now },
    assistantId: { type: Schema.Types.ObjectId, ref: 'users' },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true,
  },
);

import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export interface IUser extends Document {
  identityCard: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  profile: any;
  isActive: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

export const userSchema = new Schema<IUser>(
  {
    identityCard: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    profile: { type: String, uppercase: true, required: true }, // Admin - Client - Seller - Guest
    password: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  if (this.password !== undefined) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
  }
  next();
});

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.method('toJSON', function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __v, password, ...object } = this.toObject();
  return object;
});

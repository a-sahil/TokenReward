// backend/src/model/Shop.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import { IProduct } from './Product';

export interface IShop extends Document {
  id: string;
  _id: Types.ObjectId;
  name: string;
  logo: string;
  description: string;
  type: string;
  tokenName: string;
  tokenSymbol: string;
  ownerWalletAddress: string;
  products: (Types.ObjectId | IProduct)[];
  mintAddress?: string; // Added for loyalty token mint
  // tokenPoolAddress?: string; // createMint from SDK handles pool, might not need to store separately
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: false },
    description: { type: String, required: true },
    type: { type: String, required: true },
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 5 },
    ownerWalletAddress: { type: String, required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    mintAddress: { type: String }, // Added
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export default mongoose.model<IShop>('Shop', ShopSchema);
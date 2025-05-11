import mongoose, { Document, Schema, Types } from 'mongoose';
import { IProduct } from './Product'; // Import IProduct if you plan to type populated products

export interface IShop extends Document {
  id: string; // Virtual
  _id: Types.ObjectId; // Actual DB field
  name: string;
  logo: string;
  description: string;
  type: string;
  tokenName: string;
  tokenSymbol: string;
  ownerWalletAddress: string;
  products: (Types.ObjectId | IProduct)[]; // Can be ObjectIds or populated IProduct objects
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
    tokenSymbol: { type: String, required: true },
    ownerWalletAddress: { type: String, required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // <--- ADD THIS
    toObject: { virtuals: true } // <--- ADD THIS
  }
);

// Mongoose creates a virtual 'id' getter by default that returns _id.toString()
// You don't strictly need to define it again unless you want custom logic.
// ShopSchema.virtual('id').get(function() {
//   return this._id.toHexString();
// });

export default mongoose.model<IShop>('Shop', ShopSchema);
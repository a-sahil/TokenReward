import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  id: string; // Virtual
  _id: Types.ObjectId; // Actual DB field
  name: string;
  image: string;
  price: number;
  rating: number;
  tokenReward: number;
  shopId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    tokenReward: { type: Number, required: true, default: 0 },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // <--- ADD THIS
    toObject: { virtuals: true } // <--- ADD THIS
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
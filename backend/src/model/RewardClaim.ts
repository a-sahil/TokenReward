// backend/src/model/RewardClaim.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRewardClaim extends Document {
  _id: Types.ObjectId;
  paymentTransactionSignature: string; // Signature of the SOL payment transaction
  shopId: Types.ObjectId; // Reference to the Shop
  recipientWalletAddress: string; // User's wallet that made the payment and should receive reward
  amount: number; // Amount of shop's tokens to be rewarded
  claimed: boolean;
  claimTransactionSignature?: string; // Signature of the reward compression transaction
  createdAt: Date;
  updatedAt: Date;
}

const RewardClaimSchema: Schema = new Schema(
  {
    paymentTransactionSignature: { type: String, required: true, index: true }, // Index for faster lookups
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    recipientWalletAddress: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    claimed: { type: Boolean, default: false, index: true },
    claimTransactionSignature: { type: String },
  },
  {
    timestamps: true,
    // Ensure a payment transaction + shopId combination is unique for a reward,
    // though paymentTransactionSignature should ideally be globally unique for rewards.
    // If a single payment can result in rewards from multiple shops, then {paymentTransactionSignature, shopId} should be unique.
    // For simplicity here, assuming one payment tx = one set of rewards (potentially from multiple shops in one order).
    // A better approach might be to have an Order document, and RewardClaim references an OrderItem.
    // For now, let's make paymentTransactionSignature + shopId unique for a specific reward instance.
    indexes: [{ fields: { paymentTransactionSignature: 1, shopId: 1 }, unique: true }]
  }
);

export default mongoose.model<IRewardClaim>('RewardClaim', RewardClaimSchema);
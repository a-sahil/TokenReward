// // backend/src/models/Claim.ts
// import mongoose, { Document, Schema } from 'mongoose';
// import { IShop } from './Shop';
// import { IProduct } from './Product';

// export type ClaimStatus = 'pending' | 'claimed' | 'failed';

// export interface IClaim extends Document {
//   buyerWalletAddress: string;
//   shop: IShop['_id'];
//   product: IProduct['_id'];
//   shopTokenMintAddress: string;
//   amountToClaim: number;
//   purchaseTransactionId?: string;
//   compressionTransactionId?: string;
//   claimStatus: ClaimStatus;
//   claimTransactionId?: string;
//   createdAt: Date;
// }

// const ClaimSchema: Schema = new Schema({
//   buyerWalletAddress: { type: String, required: true },
//   shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
//   product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
//   shopTokenMintAddress: { type: String, required: true },
//   amountToClaim: { type: Number, required: true },
//   purchaseTransactionId: { type: String },
//   compressionTransactionId: { type: String },
//   claimStatus: { type: String, enum: ['pending', 'claimed', 'failed'], default: 'pending' },
//   claimTransactionId: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model<IClaim>('Claim', ClaimSchema);
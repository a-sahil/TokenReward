"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/model/RewardClaim.ts
const mongoose_1 = __importStar(require("mongoose"));
const RewardClaimSchema = new mongoose_1.Schema({
    paymentTransactionSignature: { type: String, required: true, index: true }, // Index for faster lookups
    shopId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop', required: true },
    recipientWalletAddress: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    claimed: { type: Boolean, default: false, index: true },
    claimTransactionSignature: { type: String },
}, {
    timestamps: true,
    // Ensure a payment transaction + shopId combination is unique for a reward,
    // though paymentTransactionSignature should ideally be globally unique for rewards.
    // If a single payment can result in rewards from multiple shops, then {paymentTransactionSignature, shopId} should be unique.
    // For simplicity here, assuming one payment tx = one set of rewards (potentially from multiple shops in one order).
    // A better approach might be to have an Order document, and RewardClaim references an OrderItem.
    // For now, let's make paymentTransactionSignature + shopId unique for a specific reward instance.
    indexes: [{ fields: { paymentTransactionSignature: 1, shopId: 1 }, unique: true }]
});
exports.default = mongoose_1.default.model('RewardClaim', RewardClaimSchema);

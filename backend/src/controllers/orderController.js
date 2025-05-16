"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeOrder = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const stateless_js_1 = require("@lightprotocol/stateless.js");
const Shop_1 = __importDefault(require("../model/Shop"));
const RewardClaim_1 = __importDefault(require("../model/RewardClaim"));
dotenv_1.default.config();
const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
if (!RPC_ENDPOINT) {
    console.error("FATAL: RPC_ENDPOINT not found in .env file.");
    process.exit(1);
}
const connection = (0, stateless_js_1.createRpc)(RPC_ENDPOINT);
// MARKETPLACE_WALLET_ADDRESS is still good to have for future reference or if you add deeper checks later
const MARKETPLACE_WALLET_ADDRESS_STRING = process.env.MARKETPLACE_WALLET_ADDRESS;
if (!MARKETPLACE_WALLET_ADDRESS_STRING) {
    console.warn("Warning: MARKETPLACE_WALLET_ADDRESS not set in .env. Payment recipient cannot be verified by backend.");
}
// const MARKETPLACE_WALLET_ADDRESS = MARKETPLACE_WALLET_ADDRESS_STRING 
//     ? new PublicKey(MARKETPLACE_WALLET_ADDRESS_STRING)
//     : null; 
const finalizeOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { paymentTransactionSignature, cartItems, payerWalletAddress } = req.body;
    if (!paymentTransactionSignature || !cartItems || cartItems.length === 0 || !payerWalletAddress) {
        return res.status(400).json({ message: 'Payment signature, cart items, and payer address are required.' });
    }
    // Removed MARKETPLACE_WALLET_ADDRESS null check as we are removing its direct use in verification for now
    try {
        console.log(`[finalizeOrder] Received request to finalize order for payment tx: ${paymentTransactionSignature}`);
        console.log(`[finalizeOrder] Payer wallet address from frontend: ${payerWalletAddress}`);
        const txData = yield connection.getTransaction(paymentTransactionSignature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!txData) {
            console.error(`[finalizeOrder] Payment transaction ${paymentTransactionSignature} not found or not confirmed.`);
            return res.status(400).json({ message: 'Payment transaction not found or not confirmed.' });
        }
        if ((_a = txData.meta) === null || _a === void 0 ? void 0 : _a.err) {
            console.error(`[finalizeOrder] Payment transaction ${paymentTransactionSignature} failed on-chain:`, txData.meta.err);
            return res.status(400).json({ message: `Payment transaction failed on-chain: ${JSON.stringify(txData.meta.err)}` });
        }
        // --- SIGNER VERIFICATION REMOVED/COMMENTED OUT ---
        /*
        const accountKeysFromMessage = txData.transaction.message.getAccountKeys();
        const parsedMessageAccounts = txData.transaction.message.accountKeys;
    
        console.log("[finalizeOrder] Static accountKeys from message:", JSON.stringify(accountKeysFromMessage.staticAccountKeys.map(k=>k.toBase58()), null, 2));
        
        let actualPayerFoundAndSigner = false;
        const signerAccount = parsedMessageAccounts.find(
            (acc: ParsedMessageAccount) => acc.pubkey.toBase58() === payerWalletAddress && acc.signer
        );
    
        if (signerAccount) {
            actualPayerFoundAndSigner = true;
            console.log(`[finalizeOrder] Verified signer (from frontend provided address): ${signerAccount.pubkey.toBase58()}`);
        }
        
        if (!actualPayerFoundAndSigner) {
            console.error(`[finalizeOrder] CRITICAL: Signer verification bypassed, but expected payer ${payerWalletAddress} was not found as a signer in the transaction if we were to check.`);
            // const allSigners = parsedMessageAccounts.filter((acc: ParsedMessageAccount) => acc.signer).map((acc: ParsedMessageAccount) => acc.pubkey.toBase58());
            // console.error(`[finalizeOrder] Actual signers found in transaction: ${allSigners.join(', ')}`);
            // Depending on your risk tolerance for a demo, you might still want to log this or even error out.
            // For this request, we are proceeding without this check failing the request.
        }
        */
        console.log(`[finalizeOrder] Payment transaction ${paymentTransactionSignature} confirmed on-chain. Proceeding without explicit backend signer verification as per request.`);
        // --- Step 2: Calculate Rewards and Create RewardClaim Documents ---
        const rewardsByShop = {};
        for (const item of cartItems) {
            if (!item.shopId) {
                console.warn(`[finalizeOrder] Item ${item.name} is missing shopId. Skipping reward for this item.`);
                continue;
            }
            const shop = yield Shop_1.default.findById(item.shopId);
            if (!shop) {
                console.warn(`[finalizeOrder] Shop with ID ${item.shopId} not found for product ${item.name}. Skipping reward.`);
                continue;
            }
            if (!shop.mintAddress) {
                console.warn(`[finalizeOrder] Shop ${shop.name} does not have a mintAddress configured. Skipping reward for its products.`);
                continue;
            }
            const shopKey = shop.id.toString();
            if (!rewardsByShop[shopKey]) {
                rewardsByShop[shopKey] = {
                    shopName: shop.name,
                    totalAmount: 0,
                    shopMongoId: shop.id,
                    tokenSymbol: shop.tokenSymbol,
                };
            }
            rewardsByShop[shopKey].totalAmount += item.tokenReward * item.quantity;
        }
        const createdOrFoundClaimsDetails = [];
        for (const shopMongoId of Object.keys(rewardsByShop)) {
            const rewardInfo = rewardsByShop[shopMongoId];
            if (rewardInfo.totalAmount > 0) {
                let rewardClaim = yield RewardClaim_1.default.findOne({
                    paymentTransactionSignature,
                    shopId: rewardInfo.shopMongoId,
                    recipientWalletAddress: payerWalletAddress,
                });
                if (rewardClaim) {
                    console.log(`[finalizeOrder] Found existing RewardClaim ID ${rewardClaim._id} for shop ${rewardInfo.shopName}, payment ${paymentTransactionSignature}. Claimed status: ${rewardClaim.claimed}`);
                }
                else {
                    rewardClaim = new RewardClaim_1.default({
                        paymentTransactionSignature,
                        shopId: rewardInfo.shopMongoId,
                        recipientWalletAddress: payerWalletAddress, // Use the address sent from frontend
                        amount: rewardInfo.totalAmount,
                        claimed: false,
                    });
                    yield rewardClaim.save();
                    console.log(`[finalizeOrder] Created new RewardClaim for shop ${rewardInfo.shopName}, amount ${rewardInfo.totalAmount}, ID: ${rewardClaim._id}`);
                }
                createdOrFoundClaimsDetails.push({
                    claimId: rewardClaim._id.toString(),
                    shopName: rewardInfo.shopName,
                    tokenSymbol: rewardInfo.tokenSymbol,
                    amount: rewardInfo.totalAmount,
                });
            }
        }
        if (createdOrFoundClaimsDetails.length === 0) {
            console.log(`[finalizeOrder] No rewards eligible for claim for payment tx: ${paymentTransactionSignature}`);
            return res.status(200).json({ message: 'Order processed. No token rewards eligible for claim with this order.', claims: [] });
        }
        console.log(`[finalizeOrder] Responding with claims:`, createdOrFoundClaimsDetails);
        res.status(200).json({
            message: 'Order finalized, rewards are ready to be claimed.',
            claims: createdOrFoundClaimsDetails
        });
    }
    catch (error) {
        console.error("[finalizeOrder] Error in finalizeOrder:", error);
        next(error);
    }
});
exports.finalizeOrder = finalizeOrder;

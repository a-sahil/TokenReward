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
exports.claimReward = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const dotenv_1 = __importDefault(require("dotenv"));
const stateless_js_1 = require("@lightprotocol/stateless.js");
const compressed_token_1 = require("@lightprotocol/compressed-token");
const Shop_1 = __importDefault(require("../model/Shop"));
const RewardClaim_1 = __importDefault(require("../model/RewardClaim")); // Import the new model
const spl_token_1 = require("@solana/spl-token");
dotenv_1.default.config();
const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const PAYER_SECRET_KEY_STRING = process.env.PAYER_KEYPAIR;
if (!RPC_ENDPOINT) { /* ... */
    process.exit(1);
}
if (!PAYER_SECRET_KEY_STRING) { /* ... */
    process.exit(1);
}
const backendPayerKeypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(PAYER_SECRET_KEY_STRING));
const connection = (0, stateless_js_1.createRpc)(RPC_ENDPOINT);
const claimReward = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Now expects claimId and the claiming user's wallet address
        const { claimId, userWalletAddress } = req.body;
        if (!claimId || !userWalletAddress) {
            return res.status(400).json({ message: 'Claim ID and user wallet address are required.' });
        }
        const rewardClaim = yield RewardClaim_1.default.findById(claimId);
        if (!rewardClaim) {
            return res.status(404).json({ message: 'Reward claim not found.' });
        }
        if (rewardClaim.recipientWalletAddress !== userWalletAddress) {
            console.warn(`[claimReward] Wallet mismatch. Claim for ${rewardClaim.recipientWalletAddress}, attempt by ${userWalletAddress}`);
            return res.status(403).json({ message: 'Connected wallet does not match the reward recipient.' });
        }
        if (rewardClaim.claimed) {
            return res.status(400).json({
                message: 'This reward has already been claimed.',
                details: `Claimed with transaction: ${rewardClaim.claimTransactionSignature}. Try purchasing another product to be eligible for new cTokens.`
            });
        }
        const shop = yield Shop_1.default.findById(rewardClaim.shopId);
        if (!shop || !shop.mintAddress) {
            return res.status(404).json({ message: 'Associated shop or shop token mint not found for this claim.' });
        }
        const shopMintAddress = new web3_js_1.PublicKey(shop.mintAddress);
        const recipientPublicKey = new web3_js_1.PublicKey(rewardClaim.recipientWalletAddress); // Use address from stored claim
        const rewardAmount = (0, stateless_js_1.bn)(rewardClaim.amount);
        console.log(`[claimReward] Processing claim ID ${claimId}: ${rewardAmount.toString()} of ${shopMintAddress.toBase58()} to ${recipientPublicKey.toBase58()}`);
        const sourceTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, backendPayerKeypair, shopMintAddress, backendPayerKeypair.publicKey, false, "confirmed", undefined, spl_token_1.TOKEN_PROGRAM_ID);
        console.log(`[claimReward] Using source ATA: ${sourceTokenAccount.address.toBase58()}`);
        const sourceAtaInfo = yield connection.getTokenAccountBalance(sourceTokenAccount.address, "confirmed");
        if (BigInt(sourceAtaInfo.value.amount) < BigInt(rewardAmount.toString())) {
            const errorMessage = `Shop's reward distribution account (ATA: ${sourceTokenAccount.address.toBase58()}) has insufficient SPL token balance for mint ${shop.tokenSymbol}. Has: ${sourceAtaInfo.value.uiAmountString}, Needs: ${rewardAmount.toString()}.`;
            console.error(`[claimReward] ${errorMessage}`);
            return res.status(500).json({ message: errorMessage });
        }
        console.log(`[claimReward] Source ATA balance: ${sourceAtaInfo.value.uiAmountString} ${shop.tokenSymbol}`);
        const treeInfos = yield connection.getStateTreeInfos();
        const treeInfo = (0, stateless_js_1.selectStateTreeInfo)(treeInfos);
        const tokenPoolInfos = yield (0, compressed_token_1.getTokenPoolInfos)(connection, shopMintAddress);
        const tokenPoolInfo = (0, compressed_token_1.selectTokenPoolInfo)(tokenPoolInfos);
        const compressIx = yield compressed_token_1.CompressedTokenProgram.compress({
            payer: backendPayerKeypair.publicKey,
            owner: backendPayerKeypair.publicKey,
            source: sourceTokenAccount.address,
            toAddress: recipientPublicKey,
            amount: rewardAmount,
            mint: shopMintAddress,
            outputStateTreeInfo: treeInfo,
            tokenPoolInfo: tokenPoolInfo,
        });
        const { blockhash, lastValidBlockHeight } = yield connection.getLatestBlockhash("confirmed");
        const additionalSigners = (0, stateless_js_1.dedupeSigner)(backendPayerKeypair, [backendPayerKeypair]);
        const transaction = (0, stateless_js_1.buildAndSignTx)([web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 }), compressIx], backendPayerKeypair, blockhash, additionalSigners);
        const signature = yield (0, stateless_js_1.sendAndConfirmTx)(connection, transaction, { commitment: 'confirmed', skipPreflight: false }, { blockhash, lastValidBlockHeight });
        // Mark as claimed
        rewardClaim.claimed = true;
        rewardClaim.claimTransactionSignature = signature;
        yield rewardClaim.save();
        console.log(`[claimReward] Reward claimed for ID ${claimId}. Tx: ${signature}`);
        res.status(200).json({
            message: 'Reward claimed successfully!',
            transactionSignature: signature,
            claimId: rewardClaim._id.toString(),
            recipient: recipientPublicKey.toBase58(),
            mint: shopMintAddress.toBase58(),
            amount: rewardAmount.toString()
        });
    }
    catch (error) {
        console.error(`[claimReward] Error processing claim ID ${req.body.claimId}:`, error);
        next(error);
    }
});
exports.claimReward = claimReward;

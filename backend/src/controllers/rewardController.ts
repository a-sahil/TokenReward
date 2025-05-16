// backend/src/controllers/rewardController.ts
import { Request, Response, NextFunction } from 'express';
import { Keypair, PublicKey, ComputeBudgetProgram } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { 
    Rpc, 
    createRpc, 
    bn, 
    dedupeSigner, 
    sendAndConfirmTx, 
    buildAndSignTx,
    selectStateTreeInfo
} from '@lightprotocol/stateless.js';
import { 
    CompressedTokenProgram, 
    getTokenPoolInfos,
    selectTokenPoolInfo,
} from '@lightprotocol/compressed-token';
import Shop from '../model/Shop';
import RewardClaim from '../model/RewardClaim'; // Import the new model
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const PAYER_SECRET_KEY_STRING = process.env.PAYER_KEYPAIR;

if (!RPC_ENDPOINT) { /* ... */ process.exit(1); }
if (!PAYER_SECRET_KEY_STRING) { /* ... */ process.exit(1); }

const backendPayerKeypair = Keypair.fromSecretKey(bs58.decode(PAYER_SECRET_KEY_STRING));
const connection: Rpc = createRpc(RPC_ENDPOINT);

export const claimReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Now expects claimId and the claiming user's wallet address
    const { claimId, userWalletAddress } = req.body;

    if (!claimId || !userWalletAddress) {
      return res.status(400).json({ message: 'Claim ID and user wallet address are required.' });
    }

    const rewardClaim = await RewardClaim.findById(claimId);

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

    const shop = await Shop.findById(rewardClaim.shopId);
    if (!shop || !shop.mintAddress) {
      return res.status(404).json({ message: 'Associated shop or shop token mint not found for this claim.' });
    }

    const shopMintAddress = new PublicKey(shop.mintAddress);
    const recipientPublicKey = new PublicKey(rewardClaim.recipientWalletAddress); // Use address from stored claim
    const rewardAmount = bn(rewardClaim.amount);

    console.log(`[claimReward] Processing claim ID ${claimId}: ${rewardAmount.toString()} of ${shopMintAddress.toBase58()} to ${recipientPublicKey.toBase58()}`);
    
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, backendPayerKeypair, shopMintAddress, backendPayerKeypair.publicKey,
        false, "confirmed", undefined, TOKEN_PROGRAM_ID
    );
    console.log(`[claimReward] Using source ATA: ${sourceTokenAccount.address.toBase58()}`);

    const sourceAtaInfo = await connection.getTokenAccountBalance(sourceTokenAccount.address, "confirmed");
    if (BigInt(sourceAtaInfo.value.amount) < BigInt(rewardAmount.toString())) {
       const errorMessage = `Shop's reward distribution account (ATA: ${sourceTokenAccount.address.toBase58()}) has insufficient SPL token balance for mint ${shop.tokenSymbol}. Has: ${sourceAtaInfo.value.uiAmountString}, Needs: ${rewardAmount.toString()}.`;
       console.error(`[claimReward] ${errorMessage}`);
       return res.status(500).json({ message: errorMessage });
    }
    console.log(`[claimReward] Source ATA balance: ${sourceAtaInfo.value.uiAmountString} ${shop.tokenSymbol}`);

    const treeInfos = await connection.getStateTreeInfos();
    const treeInfo = selectStateTreeInfo(treeInfos);
    const tokenPoolInfos = await getTokenPoolInfos(connection, shopMintAddress);
    const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

    const compressIx = await CompressedTokenProgram.compress({
      payer: backendPayerKeypair.publicKey,       
      owner: backendPayerKeypair.publicKey,       
      source: sourceTokenAccount.address,       
      toAddress: recipientPublicKey,            
      amount: rewardAmount,                     
      mint: shopMintAddress,                    
      outputStateTreeInfo: treeInfo,
      tokenPoolInfo: tokenPoolInfo,
    });

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const additionalSigners = dedupeSigner(backendPayerKeypair, [backendPayerKeypair]); 
    
    const transaction = buildAndSignTx(
      [ ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }), compressIx ],
      backendPayerKeypair, blockhash, additionalSigners 
    );

    const signature = await sendAndConfirmTx(connection, transaction, {commitment: 'confirmed', skipPreflight: false }, { blockhash, lastValidBlockHeight });
    
    // Mark as claimed
    rewardClaim.claimed = true;
    rewardClaim.claimTransactionSignature = signature;
    await rewardClaim.save();

    console.log(`[claimReward] Reward claimed for ID ${claimId}. Tx: ${signature}`);

    res.status(200).json({ 
        message: 'Reward claimed successfully!', 
        transactionSignature: signature,
        claimId: rewardClaim._id.toString(),
        recipient: recipientPublicKey.toBase58(),
        mint: shopMintAddress.toBase58(),
        amount: rewardAmount.toString()
    });

  } catch (error) {
    console.error(`[claimReward] Error processing claim ID ${req.body.claimId}:`, error);
    next(error);
  }
};
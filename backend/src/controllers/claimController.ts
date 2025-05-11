// backend/src/controllers/claimController.ts
import { Request, Response, NextFunction } from 'express';
import Claim, { IClaim } from '../model/Claim';
import { decompressTokensForUser } from '../services/solanaService';
import { payer } from '../services/solanaService'; // Import payer to check against claiming wallet

interface ClaimTokensBody {
  claimingWalletAddress: string;
}

export const claimTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { claimId } = req.params;
  const { claimingWalletAddress }: ClaimTokensBody = req.body;

  if (!claimingWalletAddress) {
    res.status(400).json({ message: 'Claiming wallet address is required.' });
    return;
  }

  let claimRecord: IClaim | null = null;

  try {
    claimRecord = await Claim.findById(claimId);

    if (!claimRecord) {
      res.status(404).json({ message: 'Claim record not found.' });
      return;
    }
    if (claimRecord.buyerWalletAddress.toLowerCase() !== claimingWalletAddress.toLowerCase()) {
      res.status(403).json({ message: 'Unauthorized: Claim can only be processed by the purchasing wallet.' });
      return;
    }
    if (claimRecord.claimStatus === 'claimed') {
      res.status(400).json({ message: 'Tokens already claimed.' });
      return;
    }
    if (claimRecord.claimStatus === 'failed') {
      res.status(400).json({ message: 'Previous claim attempt failed. Contact support or try again if it was a temporary issue.' });
      return;
    }

    // --- IMPORTANT ---
    // The decompressTokensForUser function, as simplified, assumes the backend's `payer`
    // can sign for the `claimingWalletAddress` if they are different.
    // This is NOT secure for a production user claim flow.
    // For this example to proceed with a backend-only call:
    // 1. The `claimingWalletAddress` MUST be the same as `payer.publicKey` from `solanaService.ts`.
    // 2. OR, the `decompressTokensForUser` logic must be adapted for a frontend-signed transaction.
    // We will proceed assuming `claimingWalletAddress` is the `payer` for this simplified backend flow.
    // In a real application, you would return instructions to the frontend for the user to sign.
    if (claimingWalletAddress.toLowerCase() !== payer.publicKey.toBase58().toLowerCase()) {
        console.warn(`Attempting backend-driven decompress for ${claimingWalletAddress} using payer ${payer.publicKey.toBase58()}. This requires user's private key or a different flow for user-initiated claims.`);
        // For now, let's allow this for testing IF the solanaService is set up such that the payer owns the tokens or can act on behalf.
        // But this is where you'd throw an error or change the flow for production.
        // throw new Error("User signature flow not implemented for this claim. Backend payer cannot sign for a different user's compressed tokens.");
    }


    console.log(`Attempting to decompress ${claimRecord.amountToClaim} of mint ${claimRecord.shopTokenMintAddress} for ${claimingWalletAddress}`);

    const decompressionTxId = await decompressTokensForUser(
      claimingWalletAddress,
      claimRecord.shopTokenMintAddress,
      claimRecord.amountToClaim
    );

    claimRecord.claimStatus = 'claimed';
    claimRecord.claimTransactionId = decompressionTxId;
    await claimRecord.save();

    res.json({
      message: 'Tokens successfully claimed!',
      decompressionTransactionId: decompressionTxId,
      amountClaimed: claimRecord.amountToClaim,
    });

  } catch (error: any) {
    console.error(`Error claiming tokens for claimId ${claimId}:`, error);
     if (claimRecord && claimRecord.claimStatus === 'pending') {
        try {
            claimRecord.claimStatus = 'failed';
            await claimRecord.save();
        } catch (saveError) {
            console.error(`Failed to update claim status to 'failed' for claimId ${claimId}`, saveError);
        }
    }
    if (error.message.includes("User's signature required for decompression")) {
        res.status(403).json({ message: error.message + " Please ensure you are claiming with the correct wallet or the backend service is configured for this operation."})
        return;
    }
    // Add more specific error handling based on SDK errors
    if (error.message.includes("Insufficient compressed balance")) {
        res.status(400).json({ message: `Claim failed: ${error.message}. You might have already transferred or spent these compressed tokens.` });
        return;
    }
    if (error.message.includes("No compressed token accounts found")) {
        res.status(400).json({ message: `Claim failed: ${error.message}. Ensure you are using the correct wallet that received the tokens.` });
        return;
    }
    next(error);
  }
};
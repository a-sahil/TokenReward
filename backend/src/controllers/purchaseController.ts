// backend/src/controllers/purchaseController.ts
import { Request, Response, NextFunction } from 'express';
import Shop from '../model/Shop';
import Product from '../model/Product';
import Claim from '../model/Claim';
import { compressAndSendTokens } from '../services/solanaService';
import { generateQRCodeDataURL } from '../utils/qrCodeHelper';

interface CryptoPurchaseBody {
  buyerWalletAddress: string;
  productId: string;
  quantity?: number;
  paymentTransactionId: string; // Simulated: ID of the incoming payment transaction
}

export const handleCryptoPurchase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { buyerWalletAddress, productId, quantity = 1, paymentTransactionId }: CryptoPurchaseBody = req.body;

  if (!buyerWalletAddress || !productId || !paymentTransactionId) {
    res.status(400).json({ message: 'Buyer wallet, product ID, and payment transaction ID are required.' });
    return;
  }

  try {
    const product = await Product.findById(productId).populate('shop');
    if (!product || !product.shop) {
      res.status(404).json({ message: 'Product or associated shop not found.' });
      return;
    }

    // Type assertion for populated shop
    const shop = product.shop as InstanceType<typeof Shop>;

    if (!shop.tokenMintAddress) {
      console.error(`Shop ${shop.name} (ID: ${shop._id}) is missing tokenMintAddress.`);
      res.status(500).json({ message: 'Shop token not properly configured for rewards.' });
      return;
    }

    const tokensToAward = product.tokenReward * quantity;
    if (tokensToAward <= 0) {
      // Still proceed with purchase, just no token reward step
      console.log(`Purchase of ${product.name} for ${buyerWalletAddress} has no token reward.`);
       res.status(200).json({
        message: 'Purchase successful! No tokens awarded for this item.',
        claimId: null,
        tokensAwarded: 0,
        tokenSymbol: shop.tokenSymbol,
        claimUrl: null,
        qrCodeDataURL: null,
        compressionTxId: null,
      });
      return;
    }

    console.log(`Simulating payment verification for tx: ${paymentTransactionId}`);
    const isPaymentValid = true; // Replace with actual verification logic

    if (!isPaymentValid) {
      res.status(400).json({ message: 'Crypto payment verification failed.' });
      return;
    }

    console.log(`Attempting to compress ${tokensToAward} of ${shop.tokenName} (${shop.tokenMintAddress}) to ${buyerWalletAddress}`);
    const compressionTxId = await compressAndSendTokens(
      shop.tokenMintAddress,
      buyerWalletAddress,
      tokensToAward
    );

    const newClaim = new Claim({
      buyerWalletAddress,
      shop: shop._id,
      product: product._id,
      shopTokenMintAddress: shop.tokenMintAddress,
      amountToClaim: tokensToAward,
      purchaseTransactionId: paymentTransactionId,
      compressionTransactionId: compressionTxId,
      claimStatus: 'pending',
    });
    const savedClaim = await newClaim.save();

    const claimUrl = `${process.env.FRONTEND_URL}/claim-token?claimId=${savedClaim._id}`;
    const qrCodeDataURL = await generateQRCodeDataURL(claimUrl);

    res.status(201).json({
      message: 'Purchase successful! Compressed tokens awarded.',
      claimId: savedClaim._id,
      tokensAwarded: tokensToAward,
      tokenSymbol: shop.tokenSymbol,
      claimUrl,
      qrCodeDataURL,
      compressionTxId,
    });

  } catch (error: any) {
    console.error("Error handling crypto purchase:", error);
    if (error.message.includes("No active state trees found") || error.message.includes("No token pool info found")) {
        res.status(500).json({ message: `Failed to mint tokens: ${error.message}. Please check Solana network status or token registration.` });
        return;
    }
    next(error);
  }
};
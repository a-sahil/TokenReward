// backend/src/controllers/shopController.ts
import { Request, Response, NextFunction } from 'express';
import Shop from '../model/Shop';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'; // Added SystemProgram, Transaction
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { 
    Rpc, 
    createRpc,
    bn, 
    sendAndConfirmTx, // We'll use this for the SPL minting tx
    buildAndSignTx 
} from '@lightprotocol/stateless.js';
import { 
    createMint as createCompressedSPLMintAndPool, // Renamed for clarity
} from '@lightprotocol/compressed-token';
import { 
    getOrCreateAssociatedTokenAccount, 
    mintTo as mintSplTokensToATA, // Renamed for clarity
    TOKEN_PROGRAM_ID 
} from '@solana/spl-token'; // For regular SPL token operations

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT; 
const PAYER_SECRET_KEY_STRING = process.env.PAYER_KEYPAIR;

if (!RPC_ENDPOINT) {
    console.error("FATAL: RPC_ENDPOINT not found in .env file.");
    process.exit(1);
}
if (!PAYER_SECRET_KEY_STRING) {
  console.error("FATAL: PAYER_KEYPAIR not found in .env file.");
  process.exit(1);
}

const backendPayerKeypair = Keypair.fromSecretKey(bs58.decode(PAYER_SECRET_KEY_STRING));
const connection: Rpc = createRpc(RPC_ENDPOINT);

const INITIAL_SUPPLY_UNCOMPRESSED = 100; // Mint 100 SPL tokens initially (0 decimals)
const LOYALTY_TOKEN_DECIMALS = 0; // Loyalty tokens usually have 0 decimals

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, type, tokenName, tokenSymbol, ownerWalletAddress } = req.body;

    if (!name || !description || !type || !tokenName || !tokenSymbol || !ownerWalletAddress) {
      return res.status(400).json({ message: 'All fields are required (...)' });
    }

    const existingShop = await Shop.findOne({ ownerWalletAddress });
    if (existingShop) {
      return res.status(400).json({ message: 'A shop already exists for this wallet address.' });
    }
    
    let logoPath;
    if (req.file) {
      logoPath = `/uploads/${req.file.filename}`;
    }

    // --- Step 1: Create Compressed SPL Mint and its Pool ---
    // The backendPayerKeypair will be the mint authority for this shop's token.
    // This allows the backend to mint more tokens later if needed for rewards,
    // and to mint the initial supply.
    const mintKeypair = Keypair.generate(); // Keypair for the mint account itself
    console.log(`[createShop] Creating compressed SPL mint for ${name}... Mint Authority: ${backendPayerKeypair.publicKey.toBase58()}`);
    
    const { mint: newMintAddress, transactionSignature: mintSetupTxSignature } = await createCompressedSPLMintAndPool(
        connection,
        backendPayerKeypair,          // Payer for this setup transaction
        backendPayerKeypair.publicKey, // Mint Authority (backend controls this)
        LOYALTY_TOKEN_DECIMALS,                      
        mintKeypair,                  // Mint account's keypair
        { commitment: 'confirmed', skipPreflight: false },
        false // Using regular SPL Token Program for the mint itself
    );
    console.log(`[createShop] Compressed SPL Mint and Pool setup: ${newMintAddress.toBase58()}, Tx: ${mintSetupTxSignature}`);

    // --- Step 2: Mint Initial Supply of UNCOMPRESSED SPL Tokens to Backend's ATA ---
    console.log(`[createShop] Creating/getting ATA for backend payer for mint ${newMintAddress.toBase58()}`);
    const backendPayerAta = await getOrCreateAssociatedTokenAccount(
        connection,
        backendPayerKeypair,      // Payer for ATA creation if needed
        newMintAddress,           // The newly created mint
        backendPayerKeypair.publicKey, // Owner of this ATA is the backend payer
        false, // allowOwnerOffCurve
        "confirmed",
        undefined,
        TOKEN_PROGRAM_ID // Explicitly specify TOKEN_PROGRAM_ID
    );
    console.log(`[createShop] Backend Payer ATA: ${backendPayerAta.address.toBase58()}`);

    console.log(`[createShop] Minting initial ${INITIAL_SUPPLY_UNCOMPRESSED} SPL tokens to backend ATA...`);
    const mintSplTxSignature = await mintSplTokensToATA(
        connection,
        backendPayerKeypair,      // Payer for this minting transaction
        newMintAddress,           // The mint to add tokens to
        backendPayerAta.address,  // Destination ATA (owned by backend)
        backendPayerKeypair,      // Mint Authority (backendPayerKeypair)
        BigInt(INITIAL_SUPPLY_UNCOMPRESSED) // Amount (ensure it respects decimals if > 0)
                                            // Since decimals is 0, 100 means 100 tokens.
    );
    console.log(`[createShop] Initial ${INITIAL_SUPPLY_UNCOMPRESSED} SPL tokens minted. Tx: ${mintSplTxSignature}`);
    await connection.confirmTransaction(mintSplTxSignature, "confirmed");


    const shop = new Shop({
      name,
      description,
      type,
      tokenName,
      tokenSymbol: tokenSymbol.toUpperCase(),
      ownerWalletAddress, // Still store the original shop creator's address
      logo: logoPath,
      mintAddress: newMintAddress.toBase58(),
    });

    const savedShop = await shop.save();
    
    res.status(201).json({
      ...savedShop.toJSON(),
      mintAddress: newMintAddress.toBase58(),
      mintTransactionSignature: mintSetupTxSignature, // Or combine signatures if preferred
      initialSupplyTxSignature: mintSplTxSignature
    });

  } catch (error) {
    console.error("[createShop] Error:", error);
    if (error instanceof Error && 'code' in error && 'data' in error) {
        console.error("Solana JSON RPC Error details:", JSON.stringify(error, null, 2));
    }
    next(error);
  }
};

// ... (getAllShops and getShopById remain the same)
export const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shops = await Shop.find().select('-products');
    res.status(200).json(shops);
  } catch (error) {
    next(error);
  }
};

export const getShopById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }
    
    const shop = await Shop.findById(id).populate('products');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  } catch (error) {
    next(error);
  }
};
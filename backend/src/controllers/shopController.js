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
exports.getShopById = exports.getAllShops = exports.createShop = void 0;
const Shop_1 = __importDefault(require("../model/Shop"));
const web3_js_1 = require("@solana/web3.js"); // Added SystemProgram, Transaction
const bs58_1 = __importDefault(require("bs58"));
const dotenv_1 = __importDefault(require("dotenv"));
const stateless_js_1 = require("@lightprotocol/stateless.js");
const compressed_token_1 = require("@lightprotocol/compressed-token");
const spl_token_1 = require("@solana/spl-token"); // For regular SPL token operations
dotenv_1.default.config();
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
const backendPayerKeypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(PAYER_SECRET_KEY_STRING));
const connection = (0, stateless_js_1.createRpc)(RPC_ENDPOINT);
const INITIAL_SUPPLY_UNCOMPRESSED = 100; // Mint 100 SPL tokens initially (0 decimals)
const LOYALTY_TOKEN_DECIMALS = 0; // Loyalty tokens usually have 0 decimals
const createShop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, type, tokenName, tokenSymbol, ownerWalletAddress } = req.body;
        if (!name || !description || !type || !tokenName || !tokenSymbol || !ownerWalletAddress) {
            return res.status(400).json({ message: 'All fields are required (...)' });
        }
        const existingShop = yield Shop_1.default.findOne({ ownerWalletAddress });
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
        const mintKeypair = web3_js_1.Keypair.generate(); // Keypair for the mint account itself
        console.log(`[createShop] Creating compressed SPL mint for ${name}... Mint Authority: ${backendPayerKeypair.publicKey.toBase58()}`);
        const { mint: newMintAddress, transactionSignature: mintSetupTxSignature } = yield (0, compressed_token_1.createMint)(connection, backendPayerKeypair, // Payer for this setup transaction
        backendPayerKeypair.publicKey, // Mint Authority (backend controls this)
        LOYALTY_TOKEN_DECIMALS, mintKeypair, // Mint account's keypair
        { commitment: 'confirmed', skipPreflight: false }, false // Using regular SPL Token Program for the mint itself
        );
        console.log(`[createShop] Compressed SPL Mint and Pool setup: ${newMintAddress.toBase58()}, Tx: ${mintSetupTxSignature}`);
        // --- Step 2: Mint Initial Supply of UNCOMPRESSED SPL Tokens to Backend's ATA ---
        console.log(`[createShop] Creating/getting ATA for backend payer for mint ${newMintAddress.toBase58()}`);
        const backendPayerAta = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, backendPayerKeypair, // Payer for ATA creation if needed
        newMintAddress, // The newly created mint
        backendPayerKeypair.publicKey, // Owner of this ATA is the backend payer
        false, // allowOwnerOffCurve
        "confirmed", undefined, spl_token_1.TOKEN_PROGRAM_ID // Explicitly specify TOKEN_PROGRAM_ID
        );
        console.log(`[createShop] Backend Payer ATA: ${backendPayerAta.address.toBase58()}`);
        console.log(`[createShop] Minting initial ${INITIAL_SUPPLY_UNCOMPRESSED} SPL tokens to backend ATA...`);
        const mintSplTxSignature = yield (0, spl_token_1.mintTo)(connection, backendPayerKeypair, // Payer for this minting transaction
        newMintAddress, // The mint to add tokens to
        backendPayerAta.address, // Destination ATA (owned by backend)
        backendPayerKeypair, // Mint Authority (backendPayerKeypair)
        BigInt(INITIAL_SUPPLY_UNCOMPRESSED) // Amount (ensure it respects decimals if > 0)
        // Since decimals is 0, 100 means 100 tokens.
        );
        console.log(`[createShop] Initial ${INITIAL_SUPPLY_UNCOMPRESSED} SPL tokens minted. Tx: ${mintSplTxSignature}`);
        yield connection.confirmTransaction(mintSplTxSignature, "confirmed");
        const shop = new Shop_1.default({
            name,
            description,
            type,
            tokenName,
            tokenSymbol: tokenSymbol.toUpperCase(),
            ownerWalletAddress, // Still store the original shop creator's address
            logo: logoPath,
            mintAddress: newMintAddress.toBase58(),
        });
        const savedShop = yield shop.save();
        res.status(201).json(Object.assign(Object.assign({}, savedShop.toJSON()), { mintAddress: newMintAddress.toBase58(), mintTransactionSignature: mintSetupTxSignature, initialSupplyTxSignature: mintSplTxSignature }));
    }
    catch (error) {
        console.error("[createShop] Error:", error);
        if (error instanceof Error && 'code' in error && 'data' in error) {
            console.error("Solana JSON RPC Error details:", JSON.stringify(error, null, 2));
        }
        next(error);
    }
});
exports.createShop = createShop;
// ... (getAllShops and getShopById remain the same)
const getAllShops = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shops = yield Shop_1.default.find().select('-products');
        res.status(200).json(shops);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllShops = getAllShops;
const getShopById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Shop ID is required' });
        }
        const shop = yield Shop_1.default.findById(id).populate('products');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.status(200).json(shop);
    }
    catch (error) {
        next(error);
    }
});
exports.getShopById = getShopById;

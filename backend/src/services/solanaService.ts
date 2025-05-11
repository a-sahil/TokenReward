// // backend/src/services/solanaService.ts
// import { Keypair, PublicKey, ComputeBudgetProgram, TransactionSignature } from '@solana/web3.js';
// import {
//   createRpc,
//   buildAndSignTx,
//   sendAndConfirmTx,
//   bn, // from @lightprotocol/stateless.js
//   Rpc,
//   StateTreeInfo,
//   selectStateTreeInfo,
//   calculateComputeUnitPrice,
//   HashWithTree, // from @lightprotocol/stateless.js
// } from '@lightprotocol/stateless.js';
// import {
//   createMint as createCompressedSplMint, // from @lightprotocol/compressed-token
//   CompressedTokenProgram,
//   getTokenPoolInfos,
//   selectTokenPoolInfo,
//   TokenPoolInfo, // from @lightprotocol/compressed-token
//   selectMinCompressedTokenAccountsForTransfer,
//   selectTokenPoolInfosForDecompression, // from @lightprotocol/compressed-token
// } from '@lightprotocol/compressed-token';
// import {
//   getOrCreateAssociatedTokenAccount,
//   mintTo as mintSplTokensToAccount, // aliased to avoid confusion with compressed-token's mintTo
// } from '@solana/spl-token';
// import bs58 from 'bs58';
// import { ParsedTokenAccount } from '@lightprotocol/stateless.js'; // If this type is exposed by stateless

// const RPC_ENDPOINT = process.env.RPC_ENDPOINT!;
// const PAYER_KEYPAIR_BS58 = process.env.PAYER_KEYPAIR_BS58!;

// if (!RPC_ENDPOINT || !PAYER_KEYPAIR_BS58) {
//   throw new Error("RPC_ENDPOINT and PAYER_KEYPAIR_BS58 must be set in .env");
// }

// const connection: Rpc = createRpc(RPC_ENDPOINT);
// export const payer: Keypair = Keypair.fromSecretKey(bs58.decode(PAYER_KEYPAIR_BS58));
// console.log(`Backend Payer Address: ${payer.publicKey.toBase58()}`);

// interface InitializeShopTokenResult {
//   mintAddress: string;
//   sourceTokenAccountAddress: string;
//   createMintTxSig: TransactionSignature;
//   mintToTxSig: TransactionSignature;
// }

// export async function initializeShopToken(shopName: string, tokenDecimals = 9): Promise<InitializeShopTokenResult> {
//   try {
//     console.log(`Initializing token for shop: ${shopName}, Payer: ${payer.publicKey.toBase58()}`);

//     const { mint, transactionSignature: createMintTxSig } = await createCompressedSplMint(
//       connection,
//       payer,
//       payer.publicKey,
//       tokenDecimals
//     );
//     console.log(`Shop token mint created: ${mint.toBase58()}, Tx: ${createMintTxSig}`);

//     const sourceAta = await getOrCreateAssociatedTokenAccount(
//       connection,
//       payer,
//       mint,
//       payer.publicKey
//     );
//     console.log(`Source ATA for shop token ${mint.toBase58()}: ${sourceAta.address.toBase58()}`);

//     const initialSupply = BigInt(1_000_000_000) * BigInt(Math.pow(10, tokenDecimals));
//     const mintToTxSig = await mintSplTokensToAccount(
//       connection,
//       payer,
//       mint,
//       sourceAta.address,
//       payer.publicKey,
//       initialSupply
//     );
//     console.log(`Initial supply minted to ${sourceAta.address.toBase58()}, Tx: ${mintToTxSig}`);

//     return {
//       mintAddress: mint.toBase58(),
//       sourceTokenAccountAddress: sourceAta.address.toBase58(),
//       createMintTxSig,
//       mintToTxSig,
//     };
//   } catch (error) {
//     console.error("Error initializing shop token:", error);
//     throw error;
//   }
// }

// export async function compressAndSendTokens(
//   shopTokenMintAddress: string,
//   recipientWalletAddress: string,
//   amount: number // This is the token amount (not smallest unit)
// ): Promise<TransactionSignature> {
//   try {
//     const mintAddress = new PublicKey(shopTokenMintAddress);
//     const recipient = new PublicKey(recipientWalletAddress);
//     const amountBn = bn(amount.toString());

//     const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       payer,
//       mintAddress,
//       payer.publicKey,
//       true
//     );
//     console.log(`Using source ATA: ${sourceTokenAccount.address.toBase58()} for mint ${mintAddress.toBase58()} to compress tokens.`);

//     const treeInfos = await connection.getStateTreeInfos();
//     const treeInfo: StateTreeInfo = selectStateTreeInfo(treeInfos);

//     const tokenPools = await getTokenPoolInfos(connection, mintAddress);
//     const tokenPoolInfo: TokenPoolInfo = selectTokenPoolInfo(tokenPools);

//     const instructions = [];
//     const computeUnitLimit = 170_000; // For 1 recipient, as per guide example
//     const priorityFeeMicroLamports = 20_000;

//     instructions.push(
//       ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit }),
//       ComputeBudgetProgram.setComputeUnitPrice({
//         microLamports: calculateComputeUnitPrice(priorityFeeMicroLamports, computeUnitLimit),
//       })
//     );

//     const compressInstruction = await CompressedTokenProgram.compress({
//       payer: payer.publicKey,
//       owner: recipient, // The recipient wallet becomes the owner of the compressed tokens
//       source: sourceTokenAccount.address,
//       toAddress: [recipient], // API expects an array
//       amount: [amountBn],    // API expects an array
//       mint: mintAddress,
//       tokenPoolInfo: tokenPoolInfo,
//       outputStateTreeInfo: treeInfo,
//     });
//     instructions.push(compressInstruction);

//     const { blockhash } = await connection.getLatestBlockhash();
//     const tx = buildAndSignTx(instructions, payer, blockhash, []); // Payer owns source ATA
//     const txId = await sendAndConfirmTx(connection, tx, { skipPreflight: false, commitment: 'confirmed' });
//     console.log(`Compression txId: ${txId}`);
//     return txId;
//   } catch (error) {
//     console.error("Error compressing and sending tokens:", error);
//     throw error;
//   }
// }


// export async function decompressTokensForUser(
//   userWalletAddressString: string, // User who owns compressed tokens
//   shopTokenMintAddress: string,
//   amountToDecompress: number // Token amount (not smallest unit)
// ): Promise<TransactionSignature> {
//   try {
//     const owner = new PublicKey(userWalletAddressString);
//     const mint = new PublicKey(shopTokenMintAddress);
//     const amountBn = bn(amountToDecompress.toString());

//     const userAta = await getOrCreateAssociatedTokenAccount(
//       connection,
//       payer, // Backend pays for ATA creation if needed
//       mint,
//       owner    // User is the owner of this destination ATA
//     );
//     console.log(`User's destination ATA for decompressed tokens: ${userAta.address.toBase58()}`);

//     const compressedTokenAccountsResult = await connection.getCompressedTokenAccountsByOwner(owner, { mint });

//     if (!compressedTokenAccountsResult || compressedTokenAccountsResult.items.length === 0) {
//       throw new Error(`No compressed token accounts found for owner ${owner.toBase58()} and mint ${mint.toBase58()}`);
//     }

//     // Select compressed accounts to cover the amount
//     // The selectMinCompressedTokenAccountsForTransfer from @lightprotocol/compressed-token is suitable
//     const [inputAccounts, totalInputAmount] = selectMinCompressedTokenAccountsForTransfer(
//       compressedTokenAccountsResult.items as ParsedTokenAccount[], // Cast if necessary, ensure type compatibility
//       amountBn
//     );

//     if (totalInputAmount.lt(amountBn)) {
//       throw new Error(`Insufficient compressed balance. Found ${totalInputAmount.toString()}, need ${amountBn.toString()}`);
//     }
//     if (inputAccounts.length === 0) {
//       throw new Error("No suitable compressed token accounts selected for decompression.");
//     }

//     // Prepare input for getValidityProofV0
//     const proofInputs: HashWithTree[] = inputAccounts.map(account => ({
//         hash: account.compressedAccount.hash,
//         tree: account.compressedAccount.treeInfo.tree,
//         queue: account.compressedAccount.treeInfo.queue,
//     }));
//     const proof = await connection.getValidityProofV0(proofInputs);
//     if (!proof || !proof.compressedProof || !proof.compressedProof) {
//       throw new Error("Failed to fetch or invalid validity proof.");
//     }

//     const tokenPools = await getTokenPoolInfos(connection, mint);
//     const selectedTokenPoolInfos = selectTokenPoolInfosForDecompression(
//       tokenPools,
//       amountBn
//     );

//     if (!selectedTokenPoolInfos || selectedTokenPoolInfos.length === 0) {
//       throw new Error("Failed to select token pool infos for decompression.");
//     }
    
//     // IMPORTANT: The 'owner' (userWalletAddressString) MUST sign this transaction.
//     // This backend function cannot sign on behalf of the user without their private key.
//     // This function should ideally return the instructions to the frontend,
//     // where the user can sign with their wallet, and then the transaction can be submitted.
//     // For this example, we'll construct it, but it won't be sendable without user's signature
//     // if `payer` is not the same as `owner`.

//     const decompressInstruction = await CompressedTokenProgram.decompress({
//       payer: payer.publicKey, // Backend pays fees
//       inputCompressedTokenAccounts: inputAccounts as any, // Cast if types slightly differ from SDK expectation
//       toAddress: userAta.address,
//       amount: amountBn,
//       tokenPoolInfos: selectedTokenPoolInfos,
//       recentInputStateRootIndices: proof.rootIndices,
//       recentValidityProof: proof.compressedProof,
//       // owner: owner, // The SDK should automatically include the owner as a signer if necessary.
//                       // If owner is different from payer, the tx will need owner's signature.
//     });

//     const instructions = [
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
//       ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 25_000 }),
//       decompressInstruction
//     ];

//     const { blockhash } = await connection.getLatestBlockhash();

//     // If `owner` (user) is different from `payer` (backend), the `owner` Keypair is needed.
//     // This is a major security concern for backend signing. This part is illustrative.
//     // A real claim flow would involve the frontend.
//     let signers = [payer];
//     if (!payer.publicKey.equals(owner)) {
//         console.warn(`Decompress operation for ${owner.toBase58()} requires their signature. Payer ${payer.publicKey.toBase58()} cannot sign on their behalf without their private key.`);
//         // In a real app, you would NOT have the user's private key here.
//         // This transaction would be partially signed by the backend (payer) and then sent to frontend for user's signature.
//         // For this example to proceed as a backend-only action, we'd have to assume payer IS the owner,
//         // or that we are in a test environment where we have the user's key (which is not the case here).
//         throw new Error("User's signature required for decompression. Backend cannot sign on behalf of the user.");
//     }
//     // If payer is the owner, no additional signer is needed explicitly beyond `payer`.

//     const tx = buildAndSignTx(instructions, payer, blockhash, []); // `owner` is implicitly a signer if it's the one performing the action on their assets.
//                                                                    // The `CompressedTokenProgram.decompress` will list `owner` as a required signer if different from payer.
//     const txId = await sendAndConfirmTx(connection, tx, { skipPreflight: false, commitment: 'confirmed' });

//     console.log(`Decompression txId: ${txId}`);
//     return txId;

//   } catch (error) {
//     console.error(`Error decompressing tokens for user ${userWalletAddressString}:`, error);
//     if ((error as any).logs) {
//         console.error("Solana Transaction Logs:", (error as any).logs);
//     }
//     throw error;
//   }
// }
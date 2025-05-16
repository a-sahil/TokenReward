// frontend/src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useConnection, useWallet } from '@solana/wallet-adapter-react'; // Import useConnection
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js'; // Import Solana web3.js specifics
import {QRCodeSVG} from "qrcode.react";
import { finalizeOrder as callFinalizeOrderApi } from '@/services/api'; // New API service
import { Shop, Product, CartItem } from '@/data/mockData'; // Ensure CartItem is imported or defined

// Define the structure for the claim details we expect from the backend
interface ClaimDetail {
  claimId: string;
  shopName: string;
  tokenSymbol?: string; // Optional, as it might not be immediately available or needed for the URL
  amount: number;
  claimUrl: string;
}


const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { publicKey, connected, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection(); // Get Solana connection instance

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    walletAddress: '',
  });
  
  useEffect(() => {
    if (publicKey) {
      setFormData(prev => ({ ...prev, walletAddress: publicKey.toBase58() }));
    } else {
      setFormData(prev => ({ ...prev, walletAddress: '' }));
    }
  }, [publicKey]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [claimDetails, setClaimDetails] = useState<ClaimDetail[]>([]); // Updated type

  const MARKETPLACE_RECEIVING_WALLET = new PublicKey(import.meta.env.VITE_MARKETPLACE_WALLET_ADDRESS || "REPLACE_WITH_YOUR_MARKETPLACE_SOL_ADDRESS"); // Get from .env

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey || !signTransaction) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet.", variant: "destructive"});
      return;
    }
    if (formData.walletAddress !== publicKey.toBase58()) {
        toast({ title: "Wallet Mismatch", description: "The provided wallet address does not match the connected wallet.", variant: "destructive"});
        return;
    }

    setIsProcessing(true);
    setClaimDetails([]); // Clear previous claim details

    let paymentSignature = '';

    try {
      // --- Step 1: Simulate or Perform Real SOL Payment ---
      const lamportsToPay = Math.floor(cart.subtotal * 0.0001 * 10**9) || 1000000; // Example: 0.01 SOL or a small % of cart.subtotal
      
      console.log(`[Checkout] Preparing payment of ${lamportsToPay} lamports to ${MARKETPLACE_RECEIVING_WALLET.toBase58()}`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: MARKETPLACE_RECEIVING_WALLET, 
          lamports: lamportsToPay,
        })
      );
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // const signedTransaction = await signTransaction(transaction); // Wallet signs
      // paymentSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      // Using sendTransaction helper from wallet-adapter
      paymentSignature = await sendTransaction(transaction, connection, {skipPreflight: false, preflightCommitment: 'confirmed'});

      toast({ title: "Payment Submitted", description: `Tx: ${paymentSignature.substring(0,10)}... Waiting for confirmation.`, duration: 5000 });
      
      await connection.confirmTransaction({
        signature: paymentSignature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      toast({ title: "Payment Confirmed!", description: `Transaction: ${paymentSignature}`, duration: 5000});
      console.log(`[Checkout] Payment successful, tx: ${paymentSignature}`);

      // --- Step 2: Finalize Order with Backend ---
      const finalizePayload = {
        paymentTransactionSignature: paymentSignature,
        cartItems: cart.items.map(item => ({...item, shopId: item.shopId || "UNKNOWN_SHOP_ID" })), // Ensure shopId is passed
        payerWalletAddress: publicKey.toBase58(),
      };

      const finalizeResponse = await callFinalizeOrderApi(finalizePayload);
      
      if (finalizeResponse.claims && finalizeResponse.claims.length > 0) {
        const newClaimDetails = finalizeResponse.claims.map(claim => ({
            ...claim,
            claimUrl: `${window.location.origin}/claim-reward?claimId=${claim.claimId}`
        }));
        setClaimDetails(newClaimDetails);
        toast({
          title: "Order Finalized!",
          description: `You have ${newClaimDetails.length} reward(s) to claim.`,
          duration: 7000,
        });
      } else {
        toast({
          title: "Order Finalized!",
          description: finalizeResponse.message || "No specific rewards to claim for this order.",
          duration: 5000,
        });
      }
      clearCart();

    } catch (error: any) {
      console.error("[Checkout] Error:", error);
      toast({ title: "Checkout Failed", description: error?.message || 'An unknown error occurred during checkout.', variant: "destructive" });
      // If payment went through but finalization failed, this needs careful handling (e.g. retry mechanism for finalization)
    } finally {
      setIsProcessing(false);
    }
  };
  
  // If cart is empty AND no claim details are present (meaning a previous checkout wasn't just completed)
  if (cart.items.length === 0 && claimDetails.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">No Items to Checkout</h1>
          <p className="text-muted-foreground mb-8">
            Your cart is empty. Add some items before proceeding to checkout.
          </p>
          <Link to="/shops">
            <Button className="bg-accent hover:bg-accent/80 text-foreground">
              Browse Shops
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {claimDetails.length > 0 ? (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Claim Your Rewards!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your payment was successful. Scan the QR code(s) or use the link(s) below to claim your loyalty tokens.
            </p>
            <div className="space-y-6">
              {claimDetails.map((detail) => ( // Removed index as key, using claimId
                <div key={detail.claimId} className="p-4 border border-dashed border-accent rounded-md text-center">
                  <h3 className="text-lg font-medium mb-2">
                    {detail.amount} {detail.tokenSymbol || "Tokens"} from {detail.shopName}
                  </h3>
                  <div className="flex justify-center my-4">
                    <QRCodeSVG value={detail.claimUrl} size={128} level="H" />
                  </div>
                  <Link to={detail.claimUrl} className="text-accent-teal hover:underline block text-sm break-all">
                    {detail.claimUrl}
                  </Link>
                   <p className="text-xs text-muted-foreground mt-2">(Scan with a compatible wallet or click the link)</p>
                </div>
              ))}
            </div>
             <div className="mt-8 text-center">
                <Button onClick={() => { setClaimDetails([]); navigate('/shops'); }} variant="outline">Continue Shopping</Button>
            </div>
          </div>
        ) : (
          // ... (rest of the form and order summary as before)
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-6">Billing & Payment Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"/>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-accent"/>
                    </div>
                    <div>
                      <label htmlFor="walletAddress" className="block text-sm font-medium mb-1">Your Solana Wallet Address (for token rewards)</label>
                      <input 
                        type="text" 
                        id="walletAddress" 
                        name="walletAddress" 
                        value={formData.walletAddress} 
                        onChange={handleInputChange} 
                        placeholder="Connect wallet to auto-fill" 
                        required 
                        readOnly={!!publicKey} // Make read-only if wallet is connected
                        className={`w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-1 ${
                            (!connected && formData.walletAddress) || (connected && publicKey?.toBase58() !== formData.walletAddress && formData.walletAddress)
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-input focus:ring-accent'
                        } ${publicKey ? 'cursor-not-allowed opacity-70' : '' }`}
                      />
                       {connected && publicKey?.toBase58() !== formData.walletAddress && formData.walletAddress && (
                            <p className="text-xs text-red-500 mt-1">Address does not match connected wallet.</p>
                        )}
                        {!connected && <p className="text-xs text-muted-foreground mt-1">Please connect your wallet. This will be auto-filled.</p>}
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-base font-medium mb-4">Payment (Simulated SOL Transfer)</h3>
                     <p className="text-sm text-muted-foreground mb-4">
                       Clicking "Pay & Get Rewards" will simulate a small SOL transfer from your connected wallet to the marketplace address: <br/>
                       <span className="font-mono text-xs break-all">{MARKETPLACE_RECEIVING_WALLET.toBase58()}</span>
                     </p>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                  </div>
                  <ul className="space-y-3 max-h-60 overflow-auto">
                    {cart.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span >Est. SOL Payment</span><span>~0.0001 SOL (demo)</span></div>
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-semibold"><span>Total</span><span>${cart.subtotal.toFixed(2)}</span></div>
                  <div className="mt-1 flex justify-between text-sm"><span className="text-muted-foreground">Est. Token rewards</span><span className="text-accent">{cart.tokenRewards} tokens</span></div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/80 text-foreground" onClick={handleSubmit} disabled={isProcessing || !connected || (formData.walletAddress !== publicKey?.toBase58()) || !MARKETPLACE_RECEIVING_WALLET}>
                  {isProcessing ? 'Processing...' : 'Pay & Get Rewards'}
                </Button>
                <div className="mt-4"><Link to="/cart" className="text-sm text-accent hover:text-accent-teal">← Back to Cart</Link></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;    
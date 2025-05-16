// frontend/src/pages/ClaimPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added Link
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { claimReward as callClaimRewardApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton'; // If you want loading skeletons

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ClaimPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { publicKey, connected, disconnect } = useWallet();

  const claimId = query.get('claimId'); // Get claimId from URL

  const [isLoading, setIsLoading] = useState(false);
  const [claimAttempted, setClaimAttempted] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string; txSignature?: string } | null>(null);
  
  // Store initial claim details from URL if needed for display before API call, though backend will verify
  const [initialClaimDetails, setInitialClaimDetails] = useState<{amount?: string | null}>({});

  useEffect(() => {
    setInitialClaimDetails({
        amount: query.get('amount') // This might be removed if not needed for display before claim
    });
    if (!claimId) {
      toast({ title: "Invalid Claim Link", description: "Claim ID is missing.", variant: "destructive" });
      navigate('/');
    }
  }, [claimId, toast, navigate, query]);

  const handleClaim = async () => {
    if (!connected || !publicKey) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet to claim rewards.", variant: "destructive" });
      return;
    }

    if (!claimId) return; 

    setIsLoading(true);
    setClaimResult(null);

    try {
      const response = await callClaimRewardApi({
        claimId,
        userWalletAddress: publicKey.toBase58(), // Send connected wallet address for verification
      });
      
      setClaimResult({
        success: true,
        message: `Successfully claimed ${response.amount} tokens!`,
        txSignature: response.transactionSignature
      });
      toast({
        title: "Reward Claimed!",
        description: (
          <div>
            <p>Transaction: {response.transactionSignature.substring(0,10)}...</p>
            <a 
              href={`https://explorer.solana.com/tx/${response.transactionSignature}?cluster=devnet`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Explorer
            </a>
          </div>
        ),
        duration: 10000,
      });

    } catch (error: any) {
      console.error("Claim error:", error);
      setClaimResult({
        success: false,
        message: error.message || 'Unknown error during claim.',
      });
      toast({
        title: "Claim Failed",
        description: error.message || "Could not claim your reward.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setClaimAttempted(true);
    }
  };

  if (!claimId) { // Early exit if claimId is definitely missing
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Claim Link</h1>
          <p className="text-muted-foreground mb-6">This claim link is incomplete.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Claim Your Reward</h1>
        
        <div className="bg-card p-6 rounded-lg border border-border shadow-lg mb-6">
          <p className="text-lg mb-2">You are attempting to claim a reward.</p>
          {/* Displaying initial amount from URL, if present, is okay for UX */}
          {initialClaimDetails.amount && 
            <p className="text-2xl font-semibold text-accent-teal mb-1">{initialClaimDetails.amount} Tokens</p>
          }
          <p className="text-sm text-muted-foreground">
            This reward will be sent to your connected wallet if eligible.
          </p>
        </div>

        {!connected && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive text-sm font-medium">Wallet Not Connected</p>
            <p className="text-xs text-destructive/80">
              Please connect your Solana wallet to proceed with the claim.
            </p>
          </div>
        )}
        
        {/* This button triggers the API call */}
        {!claimAttempted && connected && (
             <Button 
                onClick={handleClaim} 
                disabled={isLoading || !connected}
                className="w-full bg-accent hover:bg-accent/80 text-foreground text-lg py-3"
                >
                {isLoading ? 'Processing Claim...' : 'Claim My Tokens'}
            </Button>
        )}

        {claimAttempted && claimResult && (
          <div className={`mt-6 p-4 rounded-md ${claimResult.success ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            <p className={`${claimResult.success ? 'text-green-400' : 'text-red-400'}`}>{claimResult.message}</p>
            {claimResult.success && claimResult.txSignature && (
              <a 
                href={`https://explorer.solana.com/tx/${claimResult.txSignature}?cluster=devnet`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-accent-teal hover:underline mt-2 block"
              >
                View Transaction on Explorer
              </a>
            )}
          </div>
        )}
        
        <div className="mt-8">
            <Button variant="outline" onClick={() => navigate('/shops')}>Explore More Shops</Button>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimPage;
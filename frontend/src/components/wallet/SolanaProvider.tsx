// frontend/src/components/wallet/SolanaProvider.tsx
"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet; // Keep as Devnet for testing

  const endpoint = useMemo(() => {
    const envEndpoint = import.meta.env.VITE_RPC_ENDPOINT;
    if (envEndpoint) {
      console.log("Using custom RPC endpoint from .env:", envEndpoint);
      return envEndpoint;
    }
    console.log("Using default clusterApiUrl for network:", network);
    return clusterApiUrl(network);
  }, [network]);

  // Wallets can be added here if you want specific ones, or leave empty for all supported by adapter-wallets
  const wallets = useMemo(
    () => [], // e.g. [new PhantomWalletAdapter()]
    []
  );


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
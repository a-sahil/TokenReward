"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletConnectButton = () => {
  return (
    <WalletMultiButton
      className="!bg-gp-mid-violet hover:!opacity-80 !text-white !font-semibold !py-2 !px-5 !rounded-lg
                 !transition-all !duration-300 !shadow-md hover:!shadow-gp-glow-sm" // Using gp-glow
    />
  );
};

export default WalletConnectButton;
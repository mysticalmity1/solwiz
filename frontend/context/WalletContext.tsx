'use client';

import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com', [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

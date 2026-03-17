'use client';

import dynamic from 'next/dynamic';

// Disable SSR for WalletMultiButton to avoid React hydration mismatch
// (the Solana wallet adapter renders differently server-side vs client-side)
export const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

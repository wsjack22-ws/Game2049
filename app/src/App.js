import React, { useEffect, useState, useMemo } from 'react';
import './css/App.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Router } from './router';
import { LotteryProvider } from './context/Lottery';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const App = () => {
  const endpoint = "https://api.devnet.solana.com"
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter()
    ],
    []
  );
  return (
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
              <LotteryProvider>
                <Router />
                </LotteryProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
  );
};

export default App;

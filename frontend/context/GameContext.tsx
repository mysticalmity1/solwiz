'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Socket } from 'socket.io-client';
import { WizardStats, User, BattleState } from '../types';
import { fetchWalletWizards } from '../services/solana';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';

interface GameContextType {
  walletAddress: string | null;
  user: User | null;
  ownedWizards: WizardStats[];
  activeWizard: WizardStats | null;
  currentRoomId: string | null;
  battleState: BattleState | null;
  mySide: "player1" | "player2" | null;
  socket: Socket | null;
  socketStatus: "connected" | "reconnecting" | "disconnected";
  pendingLevelUps: string[];
  setActiveWizard: (wizard: WizardStats) => void;
  refreshWizards: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState | null>>;
  setCurrentRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  setMySide: React.Dispatch<React.SetStateAction<"player1" | "player2" | null>>;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, disconnect } = useWallet();
  const { socket, socketStatus } = useSocket();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ownedWizards, setOwnedWizards] = useState<WizardStats[]>([]);
  const [activeWizard, setActiveWizardState] = useState<WizardStats | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [mySide, setMySide] = useState<"player1" | "player2" | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
      handleWalletConnect(publicKey.toBase58());
    } else {
      setWalletAddress(null);
      setUser(null);
      setOwnedWizards([]);
      setActiveWizardState(null);
    }
  }, [publicKey]);

  const handleWalletConnect = async (address: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/wallet/connect`, { walletAddress: address });
      setUser(res.data);
      await refreshWizards(address, res.data.activeWizardMint);
    } catch (err) {
      console.error("Failed to connect wallet to API", err);
    }
  };

  const refreshWizards = async (addressOverride?: string, activeMintOverride?: string | null) => {
    const address = addressOverride || walletAddress;
    if (!address) return;

    try {
      // Fetch pure NFTs from Solana
      const nfts = await fetchWalletWizards(address);
      
      const statsArray: WizardStats[] = [];
      let newActiveWizard: WizardStats | null = null;
      const mintToSync = activeMintOverride !== undefined ? activeMintOverride : user?.activeWizardMint;

      for (const nft of nfts) {
        // Sync or get each wizard stat from backend
        try {
          const syncRes = await axios.post(`${API_URL}/api/wizards/sync`, {
            mintAddress: nft.mintAddress,
            walletAddress: address,
            wizardType: nft.attributes.type,
            level: nft.attributes.level,
            baseStats: {
              attack: nft.attributes.attack,
              defense: nft.attributes.defense,
              speed: nft.attributes.speed,
              hp: nft.attributes.hp,
              mp: nft.attributes.mp
            }
          });

          // Fetch populated with selected attacks
          const populateRes = await axios.get(`${API_URL}/api/wizards/${nft.mintAddress}/${address}`);
          statsArray.push(populateRes.data);

          if (mintToSync && mintToSync === nft.mintAddress) {
            newActiveWizard = populateRes.data;
          }
        } catch (syncErr) {
          console.error(`Failed to sync wizard ${nft.mintAddress}`, syncErr);
        }
      }

      setOwnedWizards(statsArray);
      if (newActiveWizard) {
        setActiveWizardState(newActiveWizard);
      } else if (statsArray.length > 0) {
        // Default to first wizard if none is active
        setActiveWizardState(statsArray[0]);
      }
    } catch (err) {
      console.error("Failed to fetch wizards", err);
    }
  };

  const setActiveWizard = (wizard: WizardStats) => {
    setActiveWizardState(wizard);
    // Ideally, tell backend to store this active selection inside User model
    // This could be accomplished with another API endpoint if needed.
  };

  const connectWallet = async () => {
    // Phantom adapter auto-connect handles this in UI, but provided for interface
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const pendingLevelUps = ownedWizards.filter(w => w.levelUpPending).map(w => w.mintAddress);

  return (
    <GameContext.Provider
      value={{
        walletAddress,
        user,
        ownedWizards,
        activeWizard,
        currentRoomId,
        battleState,
        mySide,
        socket,
        socketStatus,
        pendingLevelUps,
        setActiveWizard,
        refreshWizards: () => refreshWizards(),
        connectWallet,
        disconnectWallet,
        setBattleState,
        setCurrentRoomId,
        setMySide
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

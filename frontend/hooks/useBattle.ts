'use client';

import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { BattleState, TurnResult } from '../types';
import { useRouter } from 'next/navigation';

export const useBattle = () => {
  const { 
    socket, 
    walletAddress, 
    activeWizard, 
    setBattleState, 
    battleState, 
    setCurrentRoomId, 
    setMySide,
    currentRoomId 
  } = useGame();
  
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', ({ roomId }) => {
      setCurrentRoomId(roomId);
      setMySide('player1'); // Creator is always player 1
      setBattleState(prev => ({
        ...prev!,
        roomId,
        state: 'waiting'
      }));
      router.push(`/battle/${roomId}`);
    });

    socket.on('battleReady', ({ roomId, player1, player2 }) => {
      setCurrentRoomId(roomId);
      const isPlayer1 = player1.walletAddress === walletAddress;
      setMySide(isPlayer1 ? 'player1' : 'player2');
      setBattleState({
        roomId,
        player1,
        player2,
        state: 'active'
      });
      router.push(`/battle/${roomId}`);
    });

    socket.on('turnResult', (result) => {
      setBattleState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          player1: { ...prev.player1, hpRemaining: result.p1HpAfter, mpRemaining: result.p1MpAfter },
          player2: { ...prev.player2, hpRemaining: result.p2HpAfter, mpRemaining: result.p2MpAfter },
          // Turn log handling is usually done by fetching the full battle or managing it in component state
        };
      });
    });

    socket.on('battleEnded', ({ winner, loser, xpGained, finalState }) => {
      setBattleState(finalState);
    });

    socket.on('opponentDisconnected', ({ countdown }) => {
       // Could trigger a toast or state flag
       console.log("Opponent disconnected, timeout in", countdown);
    });

    socket.on('opponentReconnected', ({ message }) => {
       console.log(message);
    });

    socket.on('opponentForfeited', ({ message }) => {
       console.log(message);
       // The server will also emit battleEnded shortly after
    });

    socket.on('roomNotFound', ({ message }) => {
      setError(message);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('battleReady');
      socket.off('turnResult');
      socket.off('battleEnded');
      socket.off('opponentDisconnected');
      socket.off('opponentReconnected');
      socket.off('opponentForfeited');
      socket.off('roomNotFound');
      socket.off('error');
    };
  }, [socket, walletAddress, router, setCurrentRoomId, setMySide, setBattleState]);

  const createRoom = () => {
    if (!socket || !walletAddress || !activeWizard) {
      setError("Cannot create room: Missing wallet or active wizard.");
      return;
    }
    setError(null);
    socket.emit('createRoom', { walletAddress, mintAddress: activeWizard.mintAddress });
  };

  const joinRoom = (roomId: string) => {
    if (!socket || !walletAddress || !activeWizard) {
      setError("Cannot join room: Missing wallet or active wizard.");
      return;
    }
    setError(null);
    socket.emit('joinRoom', { roomId, walletAddress, mintAddress: activeWizard.mintAddress });
  };

  const submitAction = (actionType: 'attack' | 'skill' | 'potion', attackId?: string) => {
    if (!socket || !walletAddress || !currentRoomId) return;
    socket.emit('submitAction', { roomId: currentRoomId, walletAddress, actionType, attackId });
  };

  const leaveRoom = () => {
    if (!socket || !walletAddress || !currentRoomId) return;
    socket.emit('leaveRoom', { roomId: currentRoomId, walletAddress });
    setCurrentRoomId(null);
    setBattleState(null);
  };

  return {
    createRoom,
    joinRoom,
    submitAction,
    leaveRoom,
    error,
    clearError: () => setError(null)
  };
};

'use client';

import { useState, useEffect } from 'react';
import { useBattle } from '../../hooks/useBattle';
import { useGame } from '../../context/GameContext';
import { useRouter } from 'next/navigation';

export const BattleLobby = () => {
  const { createRoom, joinRoom, error, clearError } = useBattle();
  const { walletAddress, activeWizard } = useGame();
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!walletAddress) router.push('/');
  }, [walletAddress, router]);

  if (!activeWizard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl text-[var(--warning)] mb-4 font-bold">No Wizard Selected</h2>
        <p className="mb-4 text-gray-400">Please select an active wizard to battle.</p>
        <button onClick={() => router.push('/profile')} className="btn-primary">Go to Profile</button>
      </div>
    );
  }

  if (activeWizard.selectedAttackIds.length !== 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl text-[var(--danger)] mb-4 font-bold">Invalid Attack Deck</h2>
        <p className="mb-4 text-gray-400">You must select exactly 4 attacks before entering the arena.</p>
        <button onClick={() => router.push('/profile')} className="btn-primary">Edit Deck</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 glass-card flex flex-col items-center text-center">
      <h2 className="heading-font text-2xl text-[var(--accent)] mb-8 drop-shadow-md">BATTLE ARENA</h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded mb-6 w-full flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold ml-2">×</button>
        </div>
      )}

      <div className="w-full flex justify-between bg-black/40 border border-[var(--border)] p-4 rounded mb-8">
        <div className="text-left flex flex-col">
          <span className="text-xs text-gray-400">Fighter</span>
          <span className="font-bold heading-font text-[10px] text-[var(--accent)]">{activeWizard.wizardType} Lvl.{activeWizard.level}</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-xs text-gray-400">Deck Status</span>
          <span className="font-bold text-[var(--success)]">Ready (4/4)</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={createRoom}
          className="w-full py-4 text-black font-bold text-lg heading-font rounded bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-[1.02] transition-all shadow-lg"
        >
          HOST MATCH
        </button>

        <div className="flex items-center gap-2 opacity-50 my-6">
          <hr className="flex-1 border-gray-600" />
          <span className="font-mono text-sm">OR</span>
          <hr className="flex-1 border-gray-600" />
        </div>

        <div className="flex gap-2 w-full">
          <input 
            type="text" 
            placeholder="ENTER ROOM CODE" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-grow bg-black/50 border border-[var(--border)] rounded px-4 py-3 font-mono text-center tracking-widest focus:outline-none focus:border-[var(--accent)] uppercase"
          />
          <button 
            onClick={() => joinRoom(joinCode)}
            disabled={joinCode.length < 6}
            className={`px-6 py-3 font-bold rounded transition-all ${
              joinCode.length >= 6 
                ? 'bg-[var(--accent)] text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
};

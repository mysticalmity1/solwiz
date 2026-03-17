'use client';

import { useGame } from '../../context/GameContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const ResultScreen = () => {
  const { battleState, walletAddress, mySide } = useGame();
  const router = useRouter();

  if (!battleState || battleState.state !== 'finished') {
    return <div className="p-8 text-center text-gray-500">No battle results to display.</div>;
  }

  const isWinner = battleState.winner === walletAddress;
  const xpGained = battleState.xpAwarded || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        className={`glass-card max-w-lg w-full p-8 text-center relative overflow-hidden ${
          isWinner ? 'border-[var(--success)] shadow-[0_0_40px_rgba(39,174,96,0.3)]' : 'border-[var(--danger)] shadow-[0_0_40px_rgba(192,57,43,0.3)]'
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        {/* Glow backdrop */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${
          isWinner ? 'bg-green-500/20' : 'bg-red-500/20'
        }`} />

        <h1 className={`heading-font text-3xl md:text-5xl mb-2 drop-shadow-md relative z-10 ${
          isWinner ? 'text-[var(--success)]' : 'text-[var(--danger)]'
        }`}>
          {isWinner ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        
        <p className="text-gray-400 mb-8 font-mono text-sm relative z-10">
          Room: {battleState.roomId}
        </p>

        <div className="bg-black/50 border border-[var(--border)] rounded-lg p-6 mb-8 relative z-10">
          <div className="text-4xl mb-4">
            {isWinner ? '🏆' : '💀'}
          </div>
          <div className="font-bold text-xl mb-2">
            EXPERIENCE GAINED
          </div>
          <div className="text-3xl font-bold text-[var(--accent)] heading-font drop-shadow-[0_0_8px_var(--accent)] animate-pulse">
            +{xpGained} XP
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <button 
            onClick={() => router.push('/profile')}
            className="flex-1 btn-secondary"
          >
            VIEW PROFILE
          </button>
          <button 
            onClick={() => router.push('/')}
            className="flex-1 btn-primary"
          >
            MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
};

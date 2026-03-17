'use client';

import { useState, useEffect } from 'react';
import { useBattle } from '../../hooks/useBattle';
import { useGame } from '../../context/GameContext';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { TurnTimer } from '../ui/TurnTimer';
import { HpMpBar } from '../ui/HpMpBar';
import { DialogueBox } from '../ui/DialogueBox';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Attack } from '../../types';

export const BattleScreen = () => {
  const { battleState, mySide, socketStatus } = useGame();
  const { submitAction, leaveRoom } = useBattle();
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAction, setSelectedAction] = useState<any>(null);

  useEffect(() => {
    if (!battleState) {
      router.push('/');
    }
  }, [battleState, router]);

  useEffect(() => {
    // Reset timer on turn state change, but wait we don't have a distinct "turn" flag except via logs.
    // For simplicity, reset whenever battleState changes (implying a turn resolved).
    setTimeLeft(60);
    setSelectedAction(null);
  }, [battleState?.turnLog?.length]);

  useEffect(() => {
    if (battleState?.state !== 'active') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto skip or fallback if timeout
          if (!selectedAction) submitAction('fallback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [battleState?.state, selectedAction]);

  if (!battleState || !mySide) return <div className="p-8 text-center animate-pulse">Loading Arena...</div>;

  if (battleState.state === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="heading-font text-xl text-[var(--accent)] mb-4">WAITING FOR CHALLENGER</h2>
        <div className="glass-card p-6 text-center max-w-sm w-full">
          <p className="text-sm text-gray-400 mb-2">Room Code:</p>
          <div className="text-4xl font-mono tracking-widest text-white mb-6 bg-black/50 py-3 rounded border border-[var(--border)]">
            {battleState.roomId}
          </div>
          <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <button onClick={() => { leaveRoom(); router.push('/battle'); }} className="text-red-400 text-sm underline">Cancel</button>
        </div>
      </div>
    );
  }

  // Active or Finished state rendering
  const isFinished = battleState.state === 'finished';
  if (isFinished) {
    // Small delay to let final turn animation play, then route to results
    setTimeout(() => {
      router.push(`/battle/${battleState.roomId}/result`);
    }, 3000);
  }

  const me = battleState[mySide];
  const oppSide = mySide === 'player1' ? 'player2' : 'player1';
  const opponent = battleState[oppSide]!;

  const handleAction = (type: 'attack', attackId: string) => {
    if (selectedAction) return; // already locked
    setSelectedAction(attackId);
    submitAction(type, attackId);
  };

  const currentLog = battleState.turnLog && battleState.turnLog.length > 0 
                     ? battleState.turnLog[battleState.turnLog.length - 1] 
                     : null;

  return (
    <div className="min-h-screen p-2 md:p-4 flex flex-col max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <ConnectionStatus status={socketStatus} />
        <div className="font-mono text-[var(--warning)] border border-[var(--warning)] px-3 py-1 rounded bg-yellow-900/20 text-xs font-bold">
          ROOM: {battleState.roomId}
        </div>
      </header>

      {/* ARENA LAYOUT */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 perspective-1000">
        
        {/* OPPONENT SIDE (Left or Top) */}
        <motion.div 
          className="glass-card relative border-red-900/50 bg-gradient-to-br from-black/80 to-red-900/10 flex flex-col"
          animate={{ x: isFinished && battleState.winner === opponent.walletAddress ? [0, -10, 10, -10, 0] : 0 }}
        >
          <div className="p-4 bg-black/40 border-b border-[var(--border)] flex justify-between items-center">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🔥</span>
               <div>
                 <div className="font-bold text-sm text-red-300">{opponent.wizardName}</div>
                 <div className="text-[10px] heading-font text-red-500 opacity-80">{opponent.wizardType} Lvl.{opponent.level}</div>
               </div>
             </div>
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between items-center">
            {/* SPRITE PLACEHOLDER */}
            <motion.div 
              className="w-32 h-32 md:w-48 md:h-48 bg-black border border-red-900 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] flex items-center justify-center text-6xl my-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              🧙‍♂️
            </motion.div>
            
            <div className="w-full mt-4">
               <HpMpBar 
                  hp={opponent.hpRemaining} maxHp={opponent.stats.hp} 
                  mp={opponent.mpRemaining} maxMp={opponent.stats.mp} 
               />
            </div>
          </div>
        </motion.div>

        {/* MY SIDE (Right or Bottom) */}
        <motion.div 
          className="glass-card relative border-blue-900/50 bg-gradient-to-br from-black/80 to-blue-900/10 flex flex-col pt-12 md:pt-0"
        >
          <div className="p-4 flex-grow flex flex-col justify-between items-center">
            {/* SPRITE PLACEHOLDER */}
            <motion.div 
              className="w-32 h-32 md:w-48 md:h-48 bg-black border border-blue-900 rounded-lg shadow-[0_0_20px_rgba(0,100,255,0.2)] flex items-center justify-center text-6xl my-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
            >
              🧙
            </motion.div>
            
            <div className="w-full mt-4">
               <HpMpBar 
                  hp={me.hpRemaining} maxHp={me.stats.hp} 
                  mp={me.mpRemaining} maxMp={me.stats.mp} 
               />
            </div>
          </div>
          <div className="p-4 bg-black/40 border-t border-[var(--border)] flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div>
                 <div className="font-bold text-sm text-blue-300">YOU ({me.wizardName})</div>
                 <div className="text-[10px] heading-font text-blue-500 opacity-80">{me.wizardType} Lvl.{me.level}</div>
               </div>
               <span className="text-2xl">✨</span>
             </div>
          </div>
        </motion.div>

      </div>

      {/* CENTER HUD: TURN TIMER & LOG */}
      <div className="w-full max-w-2xl mx-auto mb-6 relative z-10">
        {!isFinished && (
           <div className="mb-4">
             <div className="text-center text-xs text-gray-400 mb-1">TURN TIMEOUT</div>
             <TurnTimer seconds={timeLeft} maxSeconds={60} />
           </div>
        )}
        
        {currentLog && (
           <DialogueBox 
             speaker={currentLog.actingPlayer === mySide ? 'YOU' : 'OPPONENT'} 
             text={`Used ${currentLog.attackName}! Dealt ${currentLog.damageDealt} damage. ${currentLog.isCritical ? 'CRITICAL HIT!' : ''}`} 
           />
        )}
      </div>

      {/* ACTION DECK */}
      <div className="glass-card p-4">
        {selectedAction && !isFinished ? (
          <div className="text-center py-6 text-[var(--accent)] animate-pulse font-bold heading-font text-sm">
            WAITING FOR OPPONENT...
          </div>
        ) : isFinished ? (
          <div className="text-center py-6 text-white font-bold heading-font text-sm">
            BATTLE CONCLUDED
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {me.selectedAttacks.map((atk: any) => (
              <button
                key={atk._id}
                onClick={() => handleAction('attack', atk._id)}
                disabled={me.mpRemaining < atk.mpCost || selectedAction}
                className={`p-3 border rounded text-left transition-all relative overflow-hidden group ${
                  me.mpRemaining < atk.mpCost 
                    ? 'border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
                    : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)] hover:shadow-[0_0_10px_var(--accent)]'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1 text-sm">
                  <span>{atk.emoji} {atk.name}</span>
                  <span className="text-blue-400 text-xs font-mono">{atk.mpCost} MP</span>
                </div>
                <div className="text-xs text-gray-400">{atk.damage} DMG | {atk.attackType}</div>
                
                {/* Visual cooldown or flash effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity"></div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

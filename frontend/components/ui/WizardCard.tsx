'use client';

import { WizardStats } from '../../types';
import { HpMpBar } from './HpMpBar';
import { StatBar } from './StatBar';
import { motion } from 'framer-motion';

interface WizardCardProps {
  wizard: WizardStats;
  isActive: boolean;
  onSelect: (wizard: WizardStats) => void;
  onLevelUp?: (wizard: WizardStats) => void;
}

export const WizardCard = ({ wizard, isActive, onSelect, onLevelUp }: WizardCardProps) => {
  // We'll calculate mock max values for visual bars
  const maxHpAttr = 200;
  const maxMpAttr = 200;
  
  // Calculate total XP percentage
  const xpPercent = Math.max(0, Math.min(100, (wizard.totalXp / wizard.xpToNextLevel) * 100));

  return (
    <motion.div 
      className={`glass-card p-4 flex flex-col gap-4 relative transition-all duration-300 ${isActive ? 'ring-2 ring-[var(--accent)] shadow-[0_0_15px_var(--accent)] scale-[1.02]' : 'hover:border-gray-500'}`}
      whileHover={!isActive ? { scale: 1.02 } : {}}
    >
      <div className="flex gap-4">
        {/* Placeholder for NFT Image if it exists, otherwise color block */}
        <div className="w-24 h-24 rounded-lg bg-gray-800 border border-[var(--border)] overflow-hidden flex-shrink-0 flex items-center justify-center relative">
           <span className="text-4xl">🧙‍♂️</span>
           <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
             Lvl {wizard.level}
           </div>
        </div>
        
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-lg leading-tight truncate heading-font text-sm">{wizard.wizardType}</h3>
          <span className="text-xs text-gray-400 mb-2 font-mono">
            {wizard.mintAddress.substring(0,4)}...{wizard.mintAddress.substring(wizard.mintAddress.length-4)}
          </span>
          <HpMpBar 
            hp={wizard.computedStats.hp} maxHp={maxHpAttr}
            mp={wizard.computedStats.mp} maxMp={maxMpAttr}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-2">
        <StatBar label="Attack" value={wizard.computedStats.attack} max={150} color="#e74c3c" />
        <StatBar label="Defense" value={wizard.computedStats.defense} max={150} color="#3498db" />
        <StatBar label="Speed" value={wizard.computedStats.speed} max={150} color="#f1c40f" />
      </div>

      <div className="mt-2 text-xs">
        <div className="flex justify-between mb-1 opacity-80 font-bold">
          <span>XP</span>
          <span>{wizard.totalXp} / {wizard.xpToNextLevel}</span>
        </div>
        <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--success)]" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button 
          onClick={() => onSelect(wizard)}
          className={`flex-1 py-2 rounded text-xs font-bold transition-all ${isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] border border-[var(--border)] hover:bg-white/5'}`}
        >
          {isActive ? 'SELECTED' : 'SELECT'}
        </button>
        {wizard.levelUpPending && onLevelUp && (
          <button 
            onClick={() => onLevelUp(wizard)}
            className="flex-1 py-2 rounded text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse hover:scale-105 transition-all"
          >
            LEVEL UP ⬆️
          </button>
        )}
      </div>
    </motion.div>
  );
};

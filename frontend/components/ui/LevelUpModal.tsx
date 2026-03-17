'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardStats } from '../../types';
import { useState } from 'react';

interface LevelUpModalProps {
  wizard: WizardStats;
  isOpen: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export const LevelUpModal = ({ wizard, isOpen, onConfirm, isLoading }: LevelUpModalProps) => {
  if (!isOpen) return null;

  const nextLevel = wizard.level + 1;
  const multiplierOld = 1 + (wizard.level - 1) * 0.03;
  const multiplierNew = 1 + (nextLevel - 1) * 0.03;

  const getNewStat = (base: number) => Math.round(base * multiplierNew);
  const getOldStat = (base: number) => Math.round(base * multiplierOld);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="glass-card w-full max-w-md p-6 relative overflow-hidden flex flex-col items-center border border-[var(--warning)]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Background glowing effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-[50px] pointer-events-none" />

            <h2 className="heading-font text-xl text-[var(--warning)] text-center mb-6 leading-tight drop-shadow-[0_0_10px_var(--warning)]">
              LEVEL UP!
            </h2>

            <div className="text-center mb-6 z-10">
              <span className="text-sm font-mono text-gray-400">Level {wizard.level}</span>
              <span className="mx-4 text-white">→</span>
              <span className="text-2xl font-bold text-white drop-shadow-md">Level {nextLevel}</span>
            </div>

            <div className="w-full bg-black/40 rounded-xl p-4 mb-8 z-10 grid gap-3">
              <StatUpgradeRow label="HP" oldVal={getOldStat(wizard.baseStats.hp)} newVal={getNewStat(wizard.baseStats.hp)} />
              <StatUpgradeRow label="MP" oldVal={getOldStat(wizard.baseStats.mp)} newVal={getNewStat(wizard.baseStats.mp)} />
              <StatUpgradeRow label="ATTACK" oldVal={getOldStat(wizard.baseStats.attack)} newVal={getNewStat(wizard.baseStats.attack)} />
              <StatUpgradeRow label="DEFENSE" oldVal={getOldStat(wizard.baseStats.defense)} newVal={getNewStat(wizard.baseStats.defense)} />
              <StatUpgradeRow label="SPEED" oldVal={getOldStat(wizard.baseStats.speed)} newVal={getNewStat(wizard.baseStats.speed)} />
            </div>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full py-4 text-black font-bold text-lg heading-font rounded transition-all z-10 ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-[1.02] shadow-[0_0_15px_rgba(234,179,8,0.5)]'
              }`}
            >
              {isLoading ? 'UPDATING CHAIN...' : 'CONFIRM'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatUpgradeRow = ({ label, oldVal, newVal }: { label: string, oldVal: number, newVal: number }) => {
  const diff = newVal - oldVal;
  return (
    <div className="flex justify-between items-center text-sm font-mono">
      <span className="opacity-80 w-24">{label}</span>
      <span className="text-gray-400">{oldVal}</span>
      <span className="text-gray-500">→</span>
      <span className="text-white font-bold">{newVal}</span>
      <span className="text-[var(--success)] font-bold w-12 text-right">+{diff}</span>
    </div>
  );
};

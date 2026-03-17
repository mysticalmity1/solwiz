'use client';
import { motion } from 'framer-motion';

interface HpMpBarProps {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

export const HpMpBar = ({ hp, maxHp, mp, maxMp }: HpMpBarProps) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (mp / maxMp) * 100));

  let hpColor = 'var(--success)';
  if (hpPercent <= 50 && hpPercent > 25) hpColor = 'var(--warning)';
  else if (hpPercent <= 25) hpColor = 'var(--danger)';

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* HP Bar */}
      <div className="relative w-full h-4 bg-black/50 rounded overflow-hidden border border-[var(--border)] shadow-inner">
        <motion.div
          className="h-full"
          style={{ backgroundColor: hpColor }}
          initial={{ width: '100%' }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
          {hp} / {maxHp} HP
        </div>
      </div>
      
      {/* MP Bar */}
      <div className="relative w-full h-3 bg-black/50 rounded overflow-hidden border border-[var(--border)] shadow-inner">
        <motion.div
          className="h-full bg-[var(--accent)]"
          initial={{ width: '100%' }}
          animate={{ width: `${mpPercent}%` }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
          {mp} / {maxMp} MP
        </div>
      </div>
    </div>
  );
};

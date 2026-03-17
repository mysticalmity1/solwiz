'use client';
import { motion } from 'framer-motion';

interface TurnTimerProps {
  seconds: number;
  maxSeconds: number;
  onTimeout?: () => void;
}

export const TurnTimer = ({ seconds, maxSeconds, onTimeout }: TurnTimerProps) => {
  const percentage = Math.max(0, Math.min(100, (seconds / maxSeconds) * 100));
  
  let color = 'var(--accent)';
  if (seconds <= 10 && seconds > 5) color = 'var(--warning)';
  else if (seconds <= 5) color = 'var(--danger)';

  // Optional onTimeout caller could be here via deep effect listening, 
  // but mostly handled by generic battle engine timing

  return (
    <div className="w-full bg-black/40 rounded-full h-3 border border-[var(--border)] overflow-hidden relative">
      <motion.div 
        className="h-full"
        style={{ backgroundColor: color }}
        initial={{ width: '100%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider drop-shadow-md z-10 text-white leading-none">
        {seconds}s
      </div>
    </div>
  );
};

'use client';
import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export const StatBar = ({ label, value, max, color }: StatBarProps) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="flex flex-col gap-1 w-full text-xs">
      <div className="flex justify-between font-bold">
        <span className="opacity-80">{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-[var(--border)]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

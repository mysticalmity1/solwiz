import { FC } from 'react';

export const ConnectionStatus: FC<{ status: "connected" | "reconnecting" | "disconnected" }> = ({ status }) => {
  let colorClass = "bg-[var(--success)] shadow-[0_0_8px_var(--success)]";
  let text = "Connected";

  if (status === "reconnecting") {
    colorClass = "bg-[var(--warning)] shadow-[0_0_8px_var(--warning)] animate-pulse";
    text = "Reconnecting...";
  } else if (status === "disconnected") {
    colorClass = "bg-[var(--danger)] shadow-[0_0_8px_var(--danger)]";
    text = "Disconnected";
  }

  return (
    <div className="glass-card px-3 py-1 flex items-center gap-2 rounded-full text-xs font-medium border-none bg-black/40">
      <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
      <span>{text}</span>
    </div>
  );
};

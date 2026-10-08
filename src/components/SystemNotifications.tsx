import React from 'react';
import { SystemNotification } from '../types/protocol';
import { Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SystemNotificationsProps {
  notifications: SystemNotification[];
}

export const SystemNotifications: React.FC<SystemNotificationsProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;

  // Show the latest 3 notifications in reverse chronological order
  const recent = [...notifications].reverse().slice(0, 3);

  return (
    <aside
      aria-label="System Event Feed"
      className="fixed bottom-20 left-4 z-40 max-w-sm w-full flex flex-col space-y-1.5 pointer-events-none select-none"
    >
      {recent.map((n) => (
        <div
          key={n.id}
          className="bg-[#120c1f]/95 border border-[#3b2859] p-2 rounded-xs shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-between text-xs animate-[fadeIn_0.3s_ease-out]"
        >
          <div className="flex items-center gap-2">
            {n.level === 'authorization' || n.level === 'extraction' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
            )}
            <span className="font-tech tracking-wider text-[#ede7f7] text-[11px] font-semibold uppercase">
              {n.message}
            </span>
          </div>

          <span className="text-[9px] font-mono text-[#766594] shrink-0 pl-2">
            {n.timestamp}
          </span>
        </div>
      ))}
    </aside>
  );
};

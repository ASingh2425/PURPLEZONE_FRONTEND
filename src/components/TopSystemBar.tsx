import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ShieldCheck } from 'lucide-react';
import { PURPLE_CONFIG } from '../config/purpleConfig';
import { soundFx } from '../services/soundFx';

interface TopSystemBarProps {
  stage: string;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onReset: () => void;
}

export const TopSystemBar: React.FC<TopSystemBarProps> = ({
  audioMuted,
  onToggleAudio,
  onReset,
}) => {
  const [clock, setClock] = useState<string>('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClock(d.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 w-full border-b border-[#251b38] bg-[#0c0915]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Facility Identifiers */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#9333ea] rounded-xs animate-pulse" aria-hidden="true" />
          <span className="font-tech text-sm md:text-base font-bold tracking-wider text-[#f5f2fd]">
            {PURPLE_CONFIG.branding.facilityTitle}
          </span>
        </div>

        <span className="text-[#3b2d54]" aria-hidden="true">|</span>

        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#9f91ba]">
          <span className="text-[#c084fc] font-semibold">PURPLE</span>
          <span className="text-[#5f4e7c]">//</span>
          <span className="hidden sm:inline">TRANSIT FACILITY</span>
          <span className="sm:hidden">TRANSIT</span>
        </div>

        <div className="hidden lg:flex items-center text-[10px] font-mono text-[#6e5d8a] bg-[#171124] px-1.5 py-0.5 border border-[#2b1f40]">
          SEC-09 // PZ-E
        </div>
      </div>

      {/* Center: System Telemetry status & Audio/Reset controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-[#8b7ca8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
          <span>{PURPLE_CONFIG.branding.sanctuaryLinkStatus}</span>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onToggleAudio();
          }}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-[#a594c7] hover:text-[#f3e8ff] bg-[#140e21] hover:bg-[#1d1530] border border-[#2e2145] transition-colors focus:outline-none focus:ring-1 focus:ring-[#9333ea]"
          title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={audioMuted ? 'Enable Audio SFX' : 'Mute Audio SFX'}
        >
          {audioMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#e11d48]" />
              <span className="hidden sm:inline">AUDIO: OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#a855f7]" />
              <span className="hidden sm:inline">AUDIO: ON</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onReset();
          }}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-[#8f80ad] hover:text-[#f3e8ff] bg-[#140e21] hover:bg-[#1d1530] border border-[#2e2145] transition-colors focus:outline-none focus:ring-1 focus:ring-[#9333ea]"
          title="Reset Protocol Simulation"
          aria-label="Restart protocol simulation from Arrival state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8f80ad]" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>

      {/* Right: Facility clock & System Online status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-[10px] font-mono leading-tight">
          <span className="text-[#6d5b8c]">SYS_TIME (UTC)</span>
          <span className="text-[#cfc5e8] tabular-nums font-semibold">{clock}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#130d22] border border-[#2f2249] text-[10px] font-mono tracking-wider text-[#9d8cb8]">
          <ShieldCheck className="w-3 h-3 text-[#38bdf8]" />
          <span className="text-[#38bdf8] font-bold">ONLINE</span>
        </div>
      </div>
    </header>
  );
};

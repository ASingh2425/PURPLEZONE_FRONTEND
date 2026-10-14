import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ShieldCheck, AlertCircle, WifiOff } from 'lucide-react';
import { PURPLE_CONFIG } from '../config/purpleConfig';
import { soundFx } from '../services/soundFx';

interface TopSystemBarProps {
  stage: string;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onReset: () => void;
  teamInfo?: {
    teamId?: string;
    teamName?: string;
    delegateId?: string;
    points?: number;
  } | null;
}

export const TopSystemBar: React.FC<TopSystemBarProps> = ({
  audioMuted,
  onToggleAudio,
  onReset,
  teamInfo,
}) => {
  const [clock, setClock] = useState<string>('00:00:00 UTC');
  const [healthStatus, setHealthStatus] = useState<'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'CHECKING'>('CHECKING');

  // True UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setClock(d.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Arbiter Health Monitoring
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');
        const res = await fetch(`${apiBase}/api/health`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.status === 'ok' || data.ok || data.status === 'operational') {
            setHealthStatus('ONLINE');
          } else {
            setHealthStatus('DEGRADED');
          }
        } else {
          setHealthStatus('DEGRADED');
        }
      } catch (_) {
        setHealthStatus('OFFLINE');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
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

        {teamInfo?.teamId && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-[#1b122e] border border-[#7e3af2]/60 text-[10px] font-mono text-[#d8b4fe]">
            <span className="text-[#a855f7] font-bold">OPERATOR:</span>
            <span className="text-[#f5f2fe] font-semibold truncate max-w-[140px]">{teamInfo.teamName || teamInfo.teamId}</span>
          </div>
        )}

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
          title="Replay Visual Protocol Simulation (Preserves durable server evaluation records and quota)"
          aria-label="Replay visual protocol simulation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8f80ad]" />
          <span className="hidden sm:inline">REPLAY SIM</span>
        </button>

        {/* Central Map link */}
        <a
          href={teamInfo?.teamId ? `https://last-dataset.vercel.app/?team=${encodeURIComponent(teamInfo.teamId)}` : 'https://last-dataset.vercel.app/'}
          target="_top"
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-[#38bdf8] hover:text-white bg-[#0e1726] hover:bg-[#14233a] border border-[#0284c7]/50 transition-colors focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          title="Return to Central Command Map Hub"
        >
          <span>⬡ CENTRAL MAP</span>
        </a>
      </div>

      {/* Right: Facility clock & System Online status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-[10px] font-mono leading-tight">
          <span className="text-[#6d5b8c]">SYS_TIME</span>
          <span className="text-[#cfc5e8] tabular-nums font-semibold">{clock}</span>
        </div>

        <div className={`flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono tracking-wider ${
          healthStatus === 'ONLINE'
            ? 'bg-[#0d1a1f] border-[#0284c7]/50 text-[#38bdf8]'
            : healthStatus === 'CHECKING'
            ? 'bg-[#151124] border-[#7e3af2]/50 text-[#c084fc]'
            : healthStatus === 'DEGRADED'
            ? 'bg-[#291e0a] border-[#d97706]/50 text-[#f59e0b]'
            : 'bg-[#290d12] border-[#dc2626]/50 text-[#f87171]'
        }`}>
          {healthStatus === 'ONLINE' ? (
            <ShieldCheck className="w-3 h-3 text-[#38bdf8]" />
          ) : healthStatus === 'CHECKING' ? (
            <div className="w-2.5 h-2.5 rounded-full border border-t-transparent border-[#c084fc] animate-spin" />
          ) : healthStatus === 'DEGRADED' ? (
            <AlertCircle className="w-3 h-3 text-[#f59e0b]" />
          ) : (
            <WifiOff className="w-3 h-3 text-[#f87171]" />
          )}
          <span className="font-bold">HUB: {healthStatus}</span>
        </div>
      </div>
    </header>
  );
};

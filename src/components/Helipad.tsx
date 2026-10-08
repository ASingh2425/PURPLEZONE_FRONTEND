import React from 'react';
import { HelipadStatus } from '../types/protocol';

interface HelipadProps {
  status: HelipadStatus;
  children?: React.ReactNode;
}

export const Helipad: React.FC<HelipadProps> = ({ status, children }) => {
  const isStandby = status === 'STANDBY';
  const isInit = status === 'INITIALIZING';
  const isActive = status === 'ACTIVE' || status === 'EXTRACTION_HOT';

  return (
    <div className="relative w-80 sm:w-96 md:w-[420px] h-80 flex flex-col items-center justify-end select-none">
      {/* Upper Atmospheric/Open Air Sky Backdrop for Extraction */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080510] via-[#0d091a] to-[#120d22] pointer-events-none rounded-sm overflow-hidden">
        {/* Distant industrial floodlight glow in misty night */}
        <div className="absolute top-2 right-10 w-40 h-40 bg-[#7e22ce]/15 rounded-full blur-3xl" />
        <div className="absolute top-12 left-6 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-2xl" />

        {/* Industrial perimeter security fence silhouette */}
        <div className="absolute bottom-24 inset-x-0 h-10 border-b border-[#302047]/60 flex justify-between px-4 opacity-40">
          <div className="w-1 h-full bg-[#3d2a5a]" />
          <div className="w-1 h-full bg-[#3d2a5a]" />
          <div className="w-1 h-full bg-[#3d2a5a]" />
          <div className="w-1 h-full bg-[#3d2a5a]" />
          <div className="w-1 h-full bg-[#3d2a5a]" />
        </div>

        {/* Tactical Wind Direction & Mast */}
        <div className="absolute top-8 right-6 flex flex-col items-center opacity-70">
          <div className="w-1 h-16 bg-[#3d2b59]" />
          <div className="w-2.5 h-1.5 bg-[#e11d48] animate-strobe" />
          <div className="w-6 h-3 bg-[#f59e0b]/80 border border-[#b45309] rounded-r-sm -rotate-12 origin-left mt-[-10px]" />
        </div>
      </div>

      {/* Positioned Helicopter (Aircraft Sits Atop or Hovers Over Pad) */}
      <div className="absolute bottom-10 z-20 flex items-center justify-center">
        {children}
      </div>

      {/* Concrete Landing Pad Deck (Perspective Surface) */}
      <div className="relative w-full h-36 bg-[#161025] border-2 border-[#382754] rounded-sm p-2 flex flex-col items-center justify-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)] z-10">
        {/* Texture: Concrete seams & industrial drainage grating */}
        <div className="absolute inset-0 industrial-grid opacity-35 pointer-events-none" />

        {/* Helipad Status & Identifier Marker */}
        <div className="absolute top-2 inset-x-4 flex items-center justify-between text-[8px] font-mono text-[#8b79ad] tracking-widest z-10">
          <span className="font-tech text-[#c084fc] font-semibold">TACTICAL PAD 01</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive
                  ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] animate-ping'
                  : isInit
                  ? 'bg-[#f59e0b] animate-pulse'
                  : 'bg-[#4c3969]'
              }`}
            />
            <span
              className={
                isActive
                  ? 'text-[#38bdf8] font-bold'
                  : isInit
                  ? 'text-[#fbbf24]'
                  : 'text-[#6f5e8c]'
              }
            >
              {status}
            </span>
          </div>
        </div>

        {/* Circular Perimeter Marking & Strobe Lighting Array */}
        <div className="relative w-64 h-24 rounded-[50%] border-2 border-[#573d80] flex items-center justify-center">
          {/* Subtle glow ring when active */}
          <div
            className={`absolute inset-0 rounded-[50%] transition-opacity duration-1000 ${
              isActive
                ? 'opacity-80 shadow-[0_0_24px_rgba(168,85,247,0.4)] border-[#a855f7]'
                : isInit
                ? 'opacity-40 border-[#7e3af2]'
                : 'opacity-10 border-transparent'
            }`}
          />

          {/* Perimeter Amber/Purple Deck Strobe Lamps */}
          {/* Top, Bottom, Left, Right Beacons */}
          <div
            className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
              isActive
                ? 'bg-[#a855f7] shadow-[0_0_8px_#c084fc] animate-pulse'
                : 'bg-[#392652]'
            }`}
          />
          <div
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
              isActive
                ? 'bg-[#a855f7] shadow-[0_0_8px_#c084fc] animate-pulse'
                : 'bg-[#392652]'
            }`}
          />
          <div
            className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
              isActive
                ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]'
                : 'bg-[#392652]'
            }`}
          />
          <div
            className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
              isActive
                ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]'
                : 'bg-[#392652]'
            }`}
          />

          {/* Diagonals */}
          <div
            className={`absolute top-2 left-6 w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#c084fc] animate-strobe' : 'bg-[#291b3d]'
            }`}
          />
          <div
            className={`absolute top-2 right-6 w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#c084fc] animate-strobe' : 'bg-[#291b3d]'
            }`}
          />
          <div
            className={`absolute bottom-2 left-6 w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#c084fc] animate-strobe' : 'bg-[#291b3d]'
            }`}
          />
          <div
            className={`absolute bottom-2 right-6 w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#c084fc] animate-strobe' : 'bg-[#291b3d]'
            }`}
          />

          {/* Helipad Centered "H" / EXTRACTION Vector Designation */}
          <div className="flex flex-col items-center justify-center opacity-85">
            <span className="font-tech text-3xl font-black text-[#8565b5] tracking-widest leading-none">
              H
            </span>
            <span className="text-[7px] font-mono tracking-widest text-[#9c89be] uppercase -mt-1">
              EXTRACTION
            </span>
          </div>
        </div>

        {/* Approach Runway Light Bar (Front apron) */}
        <div className="absolute -bottom-2 inset-x-8 flex items-center justify-between px-3 py-0.5 bg-[#100b1c] border border-[#30204a] z-20">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#281c3c]'
            }`}
          />
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#281c3c]'
            }`}
          />
          <span className="text-[7px] font-mono text-[#6e5d8a] tracking-widest">
            APPROACH AZIMUTH 042°
          </span>
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#281c3c]'
            }`}
          />
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#281c3c]'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GateStatus } from '../types/protocol';

interface ExitGateProps {
  status: GateStatus;
}

export const ExitGate: React.FC<ExitGateProps> = ({ status }) => {
  const isLocked = status === 'LOCKED';
  const isAuthorizing = status === 'AUTHORIZING';
  const isOpening = status === 'OPENING';
  const isOpen = status === 'OPEN';

  return (
    <div className="relative w-56 sm:w-64 h-80 flex flex-col items-center justify-end select-none">
      {/* Overhead Gate Header & Hydraulic Housing */}
      <div className="w-full bg-[#1b1429] border-t-2 border-x-2 border-[#3c2a57] rounded-t-sm p-2 flex flex-col z-10 shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
        {/* Gate Identification Stencil */}
        <div className="flex items-center justify-between text-[9px] font-mono tracking-wider text-[#9f91bc] pb-1 border-b border-[#2d1e45]">
          <span className="font-tech font-bold text-[#f2eefb]">GATE 04 // PZ-EXIT</span>
          <span
            className={`font-mono text-[9px] px-1 py-0.2 tracking-wider ${
              isOpen
                ? 'text-[#38bdf8] bg-[#0c2333] border border-[#0ea5e9]/40'
                : isOpening || isAuthorizing
                ? 'text-[#fbbf24] bg-[#291e0a] border border-[#f59e0b]/40 animate-pulse'
                : 'text-[#f87171] bg-[#2d0e17] border border-[#e11d48]/40'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Hydraulic Pressure & Mechanical Status Indicators */}
        <div className="flex items-center justify-between pt-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                isOpen
                  ? 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                  : isAuthorizing || isOpening
                  ? 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'bg-[#991b1b]'
              }`}
            />
            <span className="text-[8px] font-mono text-[#8b79a8]">
              {isOpen ? 'CLEARANCE VERIFIED' : isAuthorizing ? 'UNLATCHING PNEUMATICS' : 'BLAST LOCK ENGAGED'}
            </span>
          </div>

          <div className="flex gap-1">
            <div className={`w-1 h-3 rounded-xs ${isOpen ? 'bg-[#38bdf8]' : 'bg-[#372650]'}`} />
            <div className={`w-1 h-3 rounded-xs ${isOpen || isOpening ? 'bg-[#38bdf8]' : 'bg-[#372650]'}`} />
            <div className={`w-1 h-3 rounded-xs ${isAuthorizing ? 'bg-[#f59e0b] animate-ping' : isLocked ? 'bg-[#7f1d1d]' : 'bg-[#38bdf8]'}`} />
          </div>
        </div>
      </div>

      {/* Main Structural Gate Frame & Aperture */}
      <div className="relative w-full h-64 bg-[#0d0917] border-2 border-[#2f2047] overflow-hidden flex flex-col justify-end">
        {/* Background Corridor Beyond the Gate (revealed as gate rises) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#1b0f2e] via-[#0f091a] to-[#080510]">
          {/* Distance Vanishing Lines towards Extraction Helipad */}
          <div className="w-full h-full flex flex-col items-center justify-center opacity-85">
            <div className="w-16 h-28 border border-[#4c3570]/50 relative flex items-center justify-center">
              <div className="absolute bottom-2 w-10 h-1 bg-[#a855f7]/30 blur-[1px]" />
              <span className="text-[7px] font-mono text-[#9f8ebf] tracking-widest uppercase">
                TO HELIPAD
              </span>
            </div>
            {/* Floor guide light stripe through gate opening */}
            <div
              className={`w-1 h-20 transition-all duration-700 ${
                isOpen
                  ? 'bg-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.9)]'
                  : 'bg-[#3d2a57]'
              }`}
            />
          </div>
        </div>

        {/* Sliding Blast Door Panels (Heavy Industrial Armor) */}
        {/* Upper Door Segment */}
        <div
          className={`absolute inset-x-0 top-0 h-32 bg-[#181126] border-b-2 border-[#412e5c] flex flex-col justify-between p-2.5 transition-transform duration-1000 ease-out z-10 ${
            isOpen ? '-translate-y-28' : isOpening ? '-translate-y-16' : 'translate-y-0'
          }`}
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #181126, #181126 14px, #130d20 14px, #130d20 16px)`,
          }}
        >
          {/* Hazard Chevron Strip on door bottom */}
          <div className="h-2 w-full hazard-stripes border border-[#3b2759]/40" />
          <div className="flex justify-between items-center px-1">
            <span className="text-[8px] font-mono text-[#776694]">ZONE BARRIER 04</span>
            <span className="text-[7px] font-mono text-[#5f4e7c]">STRUCTURAL REINFORCED</span>
          </div>
        </div>

        {/* Lower Door Segment (Interlocking blast teeth) */}
        <div
          className={`absolute inset-x-0 bottom-0 h-32 bg-[#1a1329] border-t-2 border-[#412e5c] flex flex-col justify-between p-2.5 transition-transform duration-1000 ease-out z-10 ${
            isOpen ? 'translate-y-28' : isOpening ? 'translate-y-16' : 'translate-y-0'
          }`}
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #1a1329, #1a1329 14px, #140d21 14px, #140d21 16px)`,
          }}
        >
          <div className="flex justify-between items-center px-1">
            <span className="text-[8px] font-mono text-[#776694]">INTERLOCK HYDRAULIC</span>
            <span className="text-[7px] font-mono text-[#5f4e7c]">FAILSAFE ENGAGED</span>
          </div>
          <div className="h-2 w-full hazard-stripes-purple border border-[#3b2759]/40" />
        </div>

        {/* Locking Bolt Clamps Overlay */}
        <div
          className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-3 z-20 pointer-events-none transition-opacity duration-500 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-4 h-6 bg-[#2a1d40] border border-[#523974] flex items-center justify-center">
            <div className="w-1.5 h-3 bg-[#e11d48]" />
          </div>
          <div className="px-2 py-0.5 bg-[#0f0a1b] border border-[#3f2a5e] text-[8px] font-mono text-[#a594c7]">
            {isLocked ? 'SEALED' : 'UNLATCHED'}
          </div>
          <div className="w-4 h-6 bg-[#2a1d40] border border-[#523974] flex items-center justify-center">
            <div className="w-1.5 h-3 bg-[#e11d48]" />
          </div>
        </div>
      </div>

      {/* Heavy Steel Threshold with Warning Beacons */}
      <div className="w-full bg-[#140e21] border-b-2 border-x-2 border-[#3c2a57] rounded-b-sm p-1.5 flex items-center justify-between z-10">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#5f1325]'
          }`}
        />
        <div className="text-[8px] font-mono text-[#72628d] tracking-widest">
          EVACUATION CORRIDOR ALPHA
        </div>
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#5f1325]'
          }`}
        />
      </div>
    </div>
  );
};

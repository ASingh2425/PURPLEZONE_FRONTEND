import React from 'react';
import { Send, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { ProtocolStage, HelicopterStatus } from '../types/protocol';
import { soundFx } from '../services/soundFx';

interface ExtractionPanelProps {
  stage: ProtocolStage;
  helicopterStatus: HelicopterStatus;
  onBeginExtraction: () => void;
}

export const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
  stage,
  helicopterStatus,
  onBeginExtraction,
}) => {
  const isReady = stage === 'EXTRACTION_READY' || helicopterStatus === 'READY';
  const isInProgress = stage === 'EXTRACTION_IN_PROGRESS';

  if (!isReady && !isInProgress) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-[#130d22] border-2 border-[#543b78] shadow-[0_12px_32px_rgba(0,0,0,0.85)] p-3 sm:p-4 rounded-sm flex flex-col space-y-3 z-30 select-none animate-[fadeIn_0.4s_ease-out]">
      {/* Header with tactical status */}
      <div className="flex items-center justify-between border-b border-[#2d1e44] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[#38bdf8] animate-pulse" />
          <span className="font-tech text-xs font-bold tracking-wider text-[#f5f2fd] uppercase">
            TACTICAL EXTRACTION DISPATCH
          </span>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-[#38bdf8] bg-[#0c202d] px-1.5 py-0.5 border border-[#0284c7]/40">
          <ShieldCheck className="w-3 h-3 text-[#38bdf8]" />
          <span>TRANSPORTER GROUNDED</span>
        </div>
      </div>

      {/* Flight info */}
      <div className="bg-[#19112c] border border-[#30204a] p-2 flex items-center justify-between text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#7d6c9c]">TRANSPORTER:</span>
          <span className="text-[#ede8f7] font-semibold">EX-09 PROTOCOL</span>
        </div>
        <div className="flex flex-col text-center">
          <span className="text-[9px] text-[#7d6c9c]">PAD:</span>
          <span className="text-[#a855f7] font-semibold">01 (HOT)</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[9px] text-[#7d6c9c]">SURVIVAL PERMIT:</span>
          <span className="text-[#38bdf8] font-semibold">VALIDATED</span>
        </div>
      </div>

      {/* Safety warning notice */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[#b39dc7] bg-[#1a122e] p-2 border border-[#372654]">
        <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
        <span>Rotor wash active. Clearance zone clear. Boarding protocol ready.</span>
      </div>

      {/* Primary Trigger Action */}
      <div className="pt-1 flex items-center justify-end">
        {isReady && !isInProgress && (
          <button
            onClick={() => {
              soundFx.playClick();
              soundFx.playExtractionSequence();
              onBeginExtraction();
            }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#381a6e] hover:bg-[#4d2596] active:bg-[#28114f] border-2 border-[#9333ea] text-[#fbfaff] font-tech text-sm font-bold tracking-widest uppercase transition-all duration-150 shadow-[0_0_20px_rgba(147,51,234,0.35)] focus:outline-none focus:ring-2 focus:ring-[#c084fc]"
          >
            <span>BEGIN EXTRACTION</span>
            <Send className="w-4 h-4 text-[#38bdf8]" />
          </button>
        )}

        {isInProgress && (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1e1333] border border-[#7e3af2] text-[#f3e8ff] font-tech text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span>EXTRACTION IN PROGRESS // AIRBORNE ASCENSION</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { PURPLE_CONFIG } from '../config/purpleConfig';
import { EvaluationResult } from '../types/protocol';
import { soundFx } from '../services/soundFx';

interface FinalEscapeScreenProps {
  evaluationResult: EvaluationResult | null;
  onRestart: () => void;
}

export const FinalEscapeScreen: React.FC<FinalEscapeScreenProps> = ({
  evaluationResult,
  onRestart,
}) => {
  const isQualified = !!evaluationResult?.qualifiesForEscape;
  const permitCode = evaluationResult?.systemVerificationCode ||
    (evaluationResult?.evaluationId ? `AUTH//${evaluationResult.evaluationId.slice(0, 8).toUpperCase()}` : null);
  const metricScore = evaluationResult?.r2Score !== undefined
    ? `${(evaluationResult.r2Score * 100).toFixed(2)}%`
    : evaluationResult?.primaryMetric?.value;

  return (
    <div className="fixed inset-0 z-50 bg-[#06040a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none animate-[fadeIn_1.4s_ease-out]">
      {/* Background ambient dark purple atmospheric glow */}
      <div className="absolute inset-0 bg-radial from-[#4a1d96]/15 via-transparent to-transparent pointer-events-none" />

      {/* Main Conclusion Dossier Panel */}
      <div className="relative max-w-lg w-full bg-[#100b1c] border-2 border-[#382654] shadow-[0_24px_64px_rgba(0,0,0,0.9)] p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Top classified marker */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#8b79a8] uppercase pb-4 border-b border-[#25193c] w-full justify-between">
          <span>FACILITY EXTRACTION DOSSIER</span>
          <span className={isQualified ? 'text-[#38bdf8]' : 'text-[#f87171]'}>
            {isQualified ? 'STATUS: VERIFIED EXTRACTION' : 'STATUS: UNVERIFIED SIMULATION'}
          </span>
        </div>

        {/* Brand & Zone Identifiers */}
        <div className="mt-6 flex flex-col items-center">
          <span className="font-tech text-base sm:text-lg font-bold tracking-widest text-[#a855f7]">
            {PURPLE_CONFIG.branding.facilityTitle}
          </span>
          <span className="text-xs font-mono tracking-widest text-[#7a6896] uppercase mt-0.5">
            {PURPLE_CONFIG.branding.zoneName} // {isQualified ? 'FINAL ESCAPE CONFIRMED' : 'UNVERIFIED RUN'}
          </span>
        </div>

        {/* Major Headline */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-tech font-extrabold tracking-wider text-[#f5f2fd] leading-tight">
          {isQualified ? PURPLE_CONFIG.narrative.extractionCompleteHeader : 'SIMULATION CONCLUDED (UNVERIFIED)'}
        </h1>

        <div className="mt-4 flex flex-col items-center space-y-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-[#181129] border text-xs font-mono tracking-wider ${
            isQualified ? 'border-[#3b2a59] text-[#38bdf8]' : 'border-[#7f1d1d] text-[#f87171]'
          }`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${isQualified ? 'text-[#38bdf8]' : 'text-[#f87171]'}`} />
            <span className="font-bold">
              {isQualified ? PURPLE_CONFIG.narrative.sanctuaryClearLabel : 'GROUND TRUTH VERIFICATION REQUIRED'}
            </span>
          </div>

          <span className="text-[11px] font-mono tracking-widest text-[#6c5b87] pt-2">
            {PURPLE_CONFIG.narrative.transmissionEndedLabel}
          </span>
        </div>

        {/* Debrief Telemetry Summary */}
        <div className="w-full mt-6 pt-4 border-t border-[#25193c] flex flex-col space-y-2 text-left text-xs font-mono text-[#9887b8] bg-[#140e24] p-3 border">
          <div className="flex justify-between">
            <span className="text-[#6d5b8c]">EVACUATION PERMIT:</span>
            <span className={`font-semibold ${isQualified ? 'text-[#f1edf8]' : 'text-[#f87171]'}`}>
              {permitCode || (isQualified ? 'AUTHORIZED // PERMIT ISSUED' : 'UNVERIFIED // PENDING SERVER EVAL')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6d5b8c]">MODEL EVALUATION:</span>
            <span className={`font-semibold ${isQualified ? 'text-[#38bdf8]' : 'text-[#f87171]'}`}>
              {isQualified
                ? `ACCEPTED (${metricScore || '≥80.00%'})`
                : (evaluationResult ? `UNQUALIFIED (${metricScore || '<80.00%'})` : 'NO SERVER EVALUATION')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6d5b8c]">EXTRACTION CRAFT:</span>
            <span className="text-[#e2daf5]">
              {isQualified ? 'EX-09 PROTOCOL (DEPARTED)' : 'STANDBY // CLEARANCE DENIED'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6d5b8c]">SANCTUARY PERIMETER:</span>
            <span className={isQualified ? 'text-[#a855f7]' : 'text-[#f59e0b]'}>
              {isQualified ? 'CLEARED / ISOLATED' : 'QUARANTINE ACTIVE'}
            </span>
          </div>
        </div>

        {/* Replay / Reset action */}
        <div className="mt-8">
          <button
            onClick={() => {
              soundFx.playClick();
              onRestart();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#23173d] hover:bg-[#322057] active:bg-[#1a1130] border border-[#5d3f8c] hover:border-[#9333ea] text-xs font-tech font-bold tracking-wider text-[#ede7f7] transition-all shadow-[0_0_16px_rgba(147,51,234,0.2)] focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>REPLAY SIMULATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};

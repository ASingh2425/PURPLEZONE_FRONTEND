import React, { useState } from 'react';
import { Play, CheckCircle2, Cpu, Database, ShieldAlert, Activity, ArrowRight, CornerDownRight } from 'lucide-react';
import { ProtocolStage, EvaluationResult, EvaluationStep } from '../types/protocol';
import { PURPLE_CONFIG } from '../config/purpleConfig';
import { soundFx } from '../services/soundFx';

interface MLEvaluationTerminalProps {
  stage: ProtocolStage;
  evaluationProgress: number;
  currentStepIndex: number;
  steps: EvaluationStep[];
  evaluationResult: EvaluationResult | null;
  onRunEvaluation: () => void;
  onProceedToExtraction?: () => void;
}

export const MLEvaluationTerminal: React.FC<MLEvaluationTerminalProps> = ({
  stage,
  evaluationProgress,
  currentStepIndex,
  steps,
  evaluationResult,
  onRunEvaluation,
  onProceedToExtraction,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isEvaluating = stage === 'SUBMITTING' || stage === 'EVALUATING';
  const isComplete =
    stage === 'EVALUATION_COMPLETE' ||
    stage === 'EXIT_AUTHORIZED' ||
    stage === 'HELIPAD_ACTIVE' ||
    stage === 'HELICOPTER_APPROACHING' ||
    stage === 'EXTRACTION_READY' ||
    stage === 'EXTRACTION_IN_PROGRESS' ||
    stage === 'EXTRACTED';

  const canRun = stage === 'ARRIVAL' || stage === 'READY';

  const activeStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="relative w-full max-w-xl bg-[#120d20] border-2 border-[#372752] shadow-[0_16px_40px_rgba(0,0,0,0.85)] rounded-sm p-4 sm:p-5 flex flex-col justify-between select-none">
      {/* Matte Terminal Chassis Corner Screws */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#473466]" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#473466]" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#473466]" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#473466]" />

      {/* Terminal Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#2a1e40] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-[#9333ea]" />
            <span className="text-[10px] font-mono tracking-widest text-[#9c89bf] uppercase">
              TERMINAL STATION // PZ-EVAL-01
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="text-[#6d5b8c]">ARBITER:</span>
            <span className="text-[#c084fc] font-semibold">STATIONARY</span>
          </div>
        </div>

        {/* Primary Screen Title & Narrative Callout */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-tech font-bold tracking-wide text-[#f5f2fd] leading-tight">
              SURVIVAL MODEL EVALUATION
            </h2>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-[#a796c7] mt-0.5">
            FINAL SYSTEM ASSESSMENT
          </p>
          <p className="text-xs text-[#8c7da8] mt-1.5 leading-relaxed">
            "{PURPLE_CONFIG.narrative.evaluationRequiredNotice}"
          </p>
        </div>

        {/* Industrial System Telemetry Status Matrix (when idle or initializing) */}
        {!isComplete && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#251a3a]">
            {/* Dataset state */}
            <div className="bg-[#18112b] border border-[#2c1f44] p-2 flex flex-col">
              <span className="text-[9px] font-mono text-[#766596] uppercase flex items-center gap-1">
                <Database className="w-2.5 h-2.5 text-[#a855f7]" />
                DATASET
              </span>
              <span className="text-xs font-mono font-semibold text-[#f1edfb] mt-1">
                READY
              </span>
              <span className="text-[8px] font-mono text-[#5f507a] truncate mt-0.5">
                #094-E / 12.4K
              </span>
            </div>

            {/* Model state */}
            <div className="bg-[#18112b] border border-[#2c1f44] p-2 flex flex-col">
              <span className="text-[9px] font-mono text-[#766596] uppercase flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-[#a855f7]" />
                MODEL
              </span>
              <span className="text-xs font-mono font-semibold text-[#f1edfb] mt-1">
                READY
              </span>
              <span className="text-[8px] font-mono text-[#5f507a] truncate mt-0.5">
                POLICY v7.2
              </span>
            </div>

            {/* Evaluation Engine */}
            <div className="bg-[#18112b] border border-[#2c1f44] p-2 flex flex-col">
              <span className="text-[9px] font-mono text-[#766596] uppercase flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-[#38bdf8]" />
                ENGINE
              </span>
              <span
                className={`text-xs font-mono font-semibold mt-1 ${
                  isEvaluating ? 'text-[#38bdf8] animate-pulse' : 'text-[#c084fc]'
                }`}
              >
                {isEvaluating ? 'EVALUATING' : 'STANDBY'}
              </span>
              <span className="text-[8px] font-mono text-[#5f507a] truncate mt-0.5">
                PURPLE ARBITER
              </span>
            </div>

            {/* Extraction state */}
            <div className="bg-[#18112b] border border-[#2c1f44] p-2 flex flex-col">
              <span className="text-[9px] font-mono text-[#766596] uppercase flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 text-[#f87171]" />
                EXTRACTION
              </span>
              <span className="text-xs font-mono font-semibold text-[#f87171] mt-1">
                LOCKED
              </span>
              <span className="text-[8px] font-mono text-[#5f507a] truncate mt-0.5">
                GATE 04 ENGAGED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center Dynamic Area: Pre-eval / Running Cinematic Progress / Result Card */}
      <div className="my-4">
        {/* State A: Idle Ready - Awaiting trigger */}
        {canRun && (
          <div className="bg-[#150f24] border border-[#2f214a] p-3.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#9382b3] pb-2 border-b border-[#25193c]">
              <span>SYSTEM ADAPTER: MOCK_EVAL_PIPELINE</span>
              <span className="text-[#38bdf8]">LINKED // DETERMINISTIC</span>
            </div>
            <p className="text-xs text-[#a394c2] mt-2 leading-relaxed">
              Model parameters & telemetry vectors are loaded into local buffer. Initiate evaluation to process survival feasibility through Sanctuary exit corridors.
            </p>
          </div>
        )}

        {/* State B: Cinematic Evaluation Progression */}
        {isEvaluating && (
          <div className="bg-[#150f25] border border-[#3b2a5a] p-3.5 flex flex-col space-y-3">
            {/* Step header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                <span className="text-xs font-tech font-bold tracking-wider text-[#38bdf8]">
                  {activeStep?.label || 'EVALUATING'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#c084fc] tabular-nums">
                {evaluationProgress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#201538] overflow-hidden border border-[#34244f]">
              <div
                className="h-full bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#38bdf8] transition-all duration-300 ease-out"
                style={{ width: `${evaluationProgress}%` }}
              />
            </div>

            {/* Diagnostic Step Description */}
            <div className="text-[11px] font-mono text-[#9887b8] flex items-start gap-1.5 bg-[#1a122e] p-2 border border-[#2d1f47]">
              <CornerDownRight className="w-3.5 h-3.5 text-[#a855f7] shrink-0 mt-0.5" />
              <span>{activeStep?.detail || 'Processing...'}</span>
            </div>

            {/* Pipeline Step Pips */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {steps.map((st, i) => (
                <div
                  key={st.id}
                  className={`h-1 rounded-xs transition-colors duration-300 ${
                    i < currentStepIndex
                      ? 'bg-[#a855f7]'
                      : i === currentStepIndex
                      ? 'bg-[#38bdf8] animate-pulse'
                      : 'bg-[#291c42]'
                  }`}
                  title={st.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* State C: Complete & Accepted Result Panel */}
        {isComplete && evaluationResult && (
          <div className="bg-[#161029] border border-[#3e2b5e] p-3.5 flex flex-col space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-[#2c1f44] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-[#38bdf8]">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                <span>EVALUATION COMPLETE — ACCEPTED</span>
              </div>
              <span className="text-[9px] font-mono text-[#8b7aa8]">
                {evaluationResult.timestamp}
              </span>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-[#1b1333] border border-[#332350] p-2 flex flex-col">
                <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                  MODEL STATUS
                </span>
                <span className="text-sm font-tech font-bold text-[#f5f2fe] mt-0.5">
                  ACCEPTED
                </span>
                <span className="text-[8px] font-mono text-[#38bdf8] mt-0.5">
                  Clearance Granted
                </span>
              </div>

              <div className="bg-[#1b1333] border border-[#332350] p-2 flex flex-col">
                <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                  {evaluationResult.primaryMetric.label}
                </span>
                <span className="text-base font-mono font-bold text-[#a855f7] tabular-nums mt-0.5">
                  {evaluationResult.primaryMetric.value}
                </span>
                <span className="text-[8px] font-mono text-[#766596] mt-0.5">
                  Req: {evaluationResult.primaryMetric.threshold}
                </span>
              </div>

              <div className="bg-[#1b1333] border border-[#332350] p-2 flex flex-col">
                <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                  EVALUATION ID
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#cfc5e8] truncate mt-1">
                  {evaluationResult.evaluationId}
                </span>
                <span className="text-[8px] font-mono text-[#5b4a78] mt-0.5">
                  HASH VERIFIED
                </span>
              </div>
            </div>

            {/* Diagnostic Invariants */}
            <div className="bg-[#130d22] border border-[#2b1e42] p-2 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-3">
                {evaluationResult.diagnostics.map(d => (
                  <div key={d.key} className="flex items-center gap-1">
                    <span className="text-[#756494]">{d.label}:</span>
                    <span className="text-[#f3e8ff] font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-[#38bdf8] font-bold">PERMIT ISSUED</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Physical System Control Button Area */}
      <div className="pt-2 border-t border-[#291d40] flex items-center justify-between">
        <div className="text-[9px] font-mono text-[#6c5b8a]">
          {isComplete
            ? 'CLEARANCE PERMIT: ACTIVE // ZONE OPEN'
            : isEvaluating
            ? 'SYSTEM RUNNING // DO NOT INTERRUPT'
            : 'READY FOR ARBITER INITIATION'}
        </div>

        {/* Primary Interactive System Button */}
        {canRun && (
          <button
            onClick={() => {
              soundFx.playClick();
              onRunEvaluation();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-[#23173d] hover:bg-[#322057] active:bg-[#1c1231] border-2 border-[#5a3e87] hover:border-[#9333ea] text-[#f5f2fd] font-tech font-bold text-sm tracking-wider uppercase transition-all duration-150 shadow-[0_4px_14px_rgba(110,40,230,0.25)] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
          >
            <div className="w-2 h-2 rounded-xs bg-[#a855f7] group-hover:bg-[#c084fc] group-hover:scale-125 transition-transform" />
            <span>RUN EVALUATION</span>
            <Play className="w-3.5 h-3.5 text-[#c084fc] fill-current ml-1" />
          </button>
        )}

        {isEvaluating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1b122e] border border-[#442f69] text-xs font-mono text-[#a855f7]">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span>EVALUATING MODEL...</span>
          </div>
        )}

        {isComplete && stage === 'EVALUATION_COMPLETE' && onProceedToExtraction && (
          <button
            onClick={() => {
              soundFx.playClick();
              onProceedToExtraction();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2d1b4c] hover:bg-[#3d2568] border border-[#7e3af2] text-[#f5f2fd] font-tech text-xs font-semibold tracking-wider transition-colors"
          >
            <span>AUTHORIZE EXIT ROUTE</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          </button>
        )}

        {isComplete && stage !== 'EVALUATION_COMPLETE' && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#38bdf8] px-2 py-1 bg-[#0c1f2e] border border-[#0284c7]/40">
            <CheckCircle2 className="w-3 h-3 text-[#38bdf8]" />
            <span>EXIT AUTHORIZED</span>
          </div>
        )}
      </div>
    </div>
  );
};

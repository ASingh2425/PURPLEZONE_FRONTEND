import React from 'react';
import { ProtocolStage, GateStatus, HelipadStatus, HelicopterStatus, EvaluationResult, EvaluationStep } from '../types/protocol';
import { ExitGate } from './ExitGate';
import { Helipad } from './Helipad';
import { Helicopter } from './Helicopter';
import { MLEvaluationTerminal } from './MLEvaluationTerminal';
import { ExtractionPanel } from './ExtractionPanel';

interface TransitEnvironmentProps {
  stage: ProtocolStage;
  gateStatus: GateStatus;
  helipadStatus: HelipadStatus;
  helicopterStatus: HelicopterStatus;
  evaluationProgress: number;
  currentStepIndex: number;
  steps: EvaluationStep[];
  evaluationResult: EvaluationResult | null;
  onRunEvaluation: (csvContent?: string, filename?: string) => void;
  onProceedToExtraction: () => void;
  onBeginExtraction: () => void;
}

export const TransitEnvironment: React.FC<TransitEnvironmentProps> = ({
  stage,
  gateStatus,
  helipadStatus,
  helicopterStatus,
  evaluationProgress,
  currentStepIndex,
  steps,
  evaluationResult,
  onRunEvaluation,
  onProceedToExtraction,
  onBeginExtraction,
}) => {
  return (
    <main className="relative w-full flex-1 min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#07050d] select-none">
      {/* =========================================================================
          BACKGROUND LAYER: DISTANT ARCHITECTURE, CONCRETE BULKHEADS, ATMOSPHERIC HAZE
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep Industrial Wall Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0713] via-[#0e0a1b] to-[#140e24]" />

        {/* Industrial Grid & Structural Beam Textures */}
        <div className="absolute inset-0 industrial-grid opacity-20" />

        {/* Overhead Conical Purple/Sodium Floodlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-b from-[#6b21a8]/12 via-[#581c87]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-b from-[#38bdf8]/8 via-[#6b21a8]/6 to-transparent blur-3xl pointer-events-none" />

        {/* Distant Sanctuary Conduit & Ventilation Pipes along ceiling */}
        <div className="absolute top-0 inset-x-0 h-8 border-b border-[#231936] flex items-center justify-between px-8 opacity-40">
          <div className="h-2 w-72 bg-[#1b132b] border-t border-[#34244f]" />
          <div className="h-3 w-96 bg-[#160f24] border-t border-[#34244f]" />
          <div className="h-2 w-64 bg-[#1b132b] border-t border-[#34244f]" />
        </div>

        {/* Slow Atmospheric Drift Mist */}
        <div className="absolute inset-0 animate-mist bg-gradient-to-r from-transparent via-[#7e22ce]/5 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          MIDGROUND / SPATIAL SECTORS:
          LEFT: Sanctuary Corridor
          CENTER: Terminal Zone
          RIGHT: Exit Gate
          FAR RIGHT: Helipad
          ========================================================================= */}
      <div className="relative w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 py-6 gap-6 z-10">
        
        {/* -------------------------------------------------------------
            LEFT / BACKGROUND: SANCTUARY TRANSIT CORRIDOR APERTURE
            ------------------------------------------------------------- */}
        <div className="hidden xl:flex flex-col items-center justify-center w-52 h-96 bg-[#0c0817] border-2 border-[#2b1e42] p-3 shadow-[inset_0_4px_20px_rgba(0,0,0,0.85)] relative shrink-0">
          {/* Corridor Perspective Lines receding towards Sanctuary */}
          <div className="w-full h-full border border-[#271a3d] flex flex-col items-center justify-between p-2 relative overflow-hidden">
            <div className="text-[8px] font-mono tracking-widest text-[#786694] uppercase pb-1 border-b border-[#211536] w-full text-center">
              SANCTUARY LINK
            </div>

            {/* Receding Bulkhead Rings */}
            <div className="w-36 h-56 border border-[#3b2857]/40 flex items-center justify-center relative">
              <div className="w-24 h-40 border border-[#4b336e]/40 flex items-center justify-center">
                <div className="w-14 h-24 border border-[#5d3f8a]/50 flex items-center justify-center bg-[#090612]">
                  <span className="text-[7px] font-mono text-[#5b4a78] tracking-widest uppercase rotate-90">
                    SECTOR 08
                  </span>
                </div>
              </div>
            </div>

            {/* Status sign at Sanctuary door */}
            <div className="w-full flex items-center justify-between text-[7px] font-mono pt-1 border-t border-[#211536]">
              <span className="text-[#6d5b8c]">AIRLOCK:</span>
              <span className="text-[#38bdf8] font-semibold">SEALED (REAR)</span>
            </div>
          </div>

          {/* Floor Hazard Stripes Leading Forward */}
          <div className="absolute -bottom-2 inset-x-2 h-2 hazard-stripes border border-[#382754]/50" />
        </div>

        {/* -------------------------------------------------------------
            CENTER: ML EVALUATION TERMINAL & INTERACTION ZONE
            ------------------------------------------------------------- */}
        <div className="flex-1 w-full max-w-2xl xl:max-w-3xl flex flex-col items-center justify-center z-20">
          <MLEvaluationTerminal
            stage={stage}
            evaluationProgress={evaluationProgress}
            currentStepIndex={currentStepIndex}
            steps={steps}
            evaluationResult={evaluationResult}
            onRunEvaluation={onRunEvaluation}
            onProceedToExtraction={onProceedToExtraction}
          />

          {/* Extraction Dispatch Panel (Reveals when helicopter lands on helipad) */}
          <div className="w-full mt-4 flex justify-center">
            <ExtractionPanel
              stage={stage}
              helicopterStatus={helicopterStatus}
              onBeginExtraction={onBeginExtraction}
            />
          </div>
        </div>

        {/* -------------------------------------------------------------
            RIGHT & FAR RIGHT: EXIT GATE & HELIPAD EXTRACTION PLATFORM
            ------------------------------------------------------------- */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6 shrink-0 z-20">
          {/* Industrial Exit Gate */}
          <div className="flex flex-col items-center">
            <ExitGate status={gateStatus} />
          </div>

          {/* Tactical Helipad with Vector SVG Helicopter */}
          <div className="flex flex-col items-center">
            <Helipad status={helipadStatus}>
              <Helicopter status={helicopterStatus} />
            </Helipad>
          </div>
        </div>

      </div>

      {/* =========================================================================
          FOREGROUND INDUSTRIAL FLOORING & CONDUIT TRACKS
          ========================================================================= */}
      <div className="relative w-full h-16 sm:h-20 bg-[#0d0918] border-t-2 border-[#2c1e45] flex items-center justify-between px-4 sm:px-8 z-20">
        {/* Floor panel pattern */}
        <div className="absolute inset-0 floor-panels opacity-25 pointer-events-none" />

        {/* Heavy High-Voltage Conduits Running Left to Right (Sanctuary to Extraction) */}
        <div className="absolute top-1 inset-x-0 h-1 bg-[#25193c] flex items-center">
          <div
            className={`h-full transition-all duration-1000 ${
              gateStatus === 'OPEN'
                ? 'w-full bg-gradient-to-r from-[#9333ea] via-[#c084fc] to-[#38bdf8]'
                : 'w-1/2 bg-[#5d3f8a]'
            }`}
          />
        </div>

        {/* Tactical Floor Markings & Hazard Guides */}
        <div className="flex items-center gap-3 text-[9px] font-mono text-[#7b6999] z-10">
          <div className="w-3 h-3 hazard-stripes border border-[#483366]" />
          <span className="hidden sm:inline">TRANSIT CORRIDOR 09 // HIGH VOLTAGE REINFORCED</span>
          <span className="sm:hidden">TRANSIT 09</span>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-mono text-[#8c7ca8] z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[#645380]">AZIMUTH:</span>
            <span className="text-[#ede7f7] font-semibold">284° NW</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#645380]">EVACUATION PERMIT:</span>
            <span
              className={`font-semibold ${
                evaluationResult ? 'text-[#38bdf8]' : 'text-[#f59e0b]'
              }`}
            >
              {evaluationResult ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

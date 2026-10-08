import React from 'react';
import { ProtocolStage, GateStatus, HelipadStatus, HelicopterStatus } from '../types/protocol';

interface EscapeRouteDiagramProps {
  stage: ProtocolStage;
  gateStatus: GateStatus;
  helipadStatus: HelipadStatus;
  helicopterStatus: HelicopterStatus;
}

export const EscapeRouteDiagram: React.FC<EscapeRouteDiagramProps> = ({
  stage,
  gateStatus,
  helipadStatus,
  helicopterStatus,
}) => {
  // Determine state for each node along the evacuation path
  const isEvalActive = stage === 'SUBMITTING' || stage === 'EVALUATING';
  const isEvalComplete = stage !== 'ARRIVAL' && stage !== 'READY' && stage !== 'SUBMITTING' && stage !== 'EVALUATING';

  const isGateOpen = gateStatus === 'OPEN' || gateStatus === 'OPENING';
  const isGateActive = gateStatus === 'AUTHORIZING';

  const isHelipadActive = helipadStatus === 'ACTIVE' || helipadStatus === 'EXTRACTION_HOT';
  const isHelipadInit = helipadStatus === 'INITIALIZING';

  const isExtractionActive = stage === 'EXTRACTION_IN_PROGRESS';
  const isExtracted = stage === 'EXTRACTED';
  const isExtractionReady = stage === 'EXTRACTION_READY' || helicopterStatus === 'READY';

  const nodes = [
    {
      id: 'sanctuary',
      label: 'SANCTUARY',
      statusText: 'CLEARED',
      state: 'complete' as const,
    },
    {
      id: 'transit',
      label: 'TRANSIT',
      statusText: 'TRAVERSED',
      state: 'complete' as const,
    },
    {
      id: 'ml_eval',
      label: 'ML EVALUATION',
      statusText: isEvalComplete ? 'ACCEPTED' : isEvalActive ? 'RUNNING' : 'ACTIVE',
      state: isEvalComplete ? 'complete' : 'active' as const,
    },
    {
      id: 'exit_gate',
      label: 'EXIT GATE',
      statusText: isGateOpen ? 'UNLOCKED' : isGateActive ? 'CLEARING' : 'LOCKED',
      state: isGateOpen ? 'complete' : isGateActive ? 'active' : isEvalComplete ? 'standby' : 'locked' as const,
    },
    {
      id: 'helipad',
      label: 'HELIPAD',
      statusText: isHelipadActive ? 'HOT / READY' : isHelipadInit ? 'INITIALIZING' : 'STANDBY',
      state: isHelipadActive ? 'complete' : isHelipadInit ? 'active' : isGateOpen ? 'standby' : 'locked' as const,
    },
    {
      id: 'extraction',
      label: 'EXTRACTION',
      statusText: isExtracted ? 'ESCAPED' : isExtractionActive ? 'ASCENDING' : isExtractionReady ? 'STANDBY' : 'LOCKED',
      state: isExtracted ? 'complete' : isExtractionActive || isExtractionReady ? 'active' : 'locked' as const,
    },
  ];

  return (
    <div className="w-full bg-[#0a0713]/85 border-b border-[#201730] px-4 py-2.5 backdrop-blur-sm select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#72628f] uppercase">
          <span className="w-1.5 h-1.5 bg-[#8b5cf6]" />
          <span>EVAC_VECTOR // PURPLE ESCAPE CORRIDOR</span>
        </div>

        {/* Route Node Pipeline */}
        <nav aria-label="Escape Route Progression" className="w-full xl:w-auto flex items-center justify-between sm:justify-start gap-1 sm:gap-2 md:gap-3 overflow-x-auto no-scrollbar py-0.5">
          {nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                {/* Node item */}
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  {/* Status Indicator Pip */}
                  {node.state === 'complete' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7] border border-[#d8b4fe] flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                  )}

                  {node.state === 'active' && (
                    <div className="relative w-2.5 h-2.5 rounded-full bg-[#9333ea] border border-[#c084fc] flex items-center justify-center">
                      <span className="absolute -inset-1 rounded-full bg-[#a855f7]/40 animate-ping" />
                      <div className="w-1 h-1 rounded-full bg-[#f3e8ff]" />
                    </div>
                  )}

                  {node.state === 'standby' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2a1d40] border border-[#6b4e99] flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-[#9d82c4]" />
                    </div>
                  )}

                  {node.state === 'locked' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#161022] border border-[#312547]" />
                  )}

                  {/* Node Label & Sub-status */}
                  <div className="flex flex-col text-left leading-none">
                    <span
                      className={`text-[10px] md:text-[11px] font-tech font-semibold tracking-wider ${
                        node.state === 'complete'
                          ? 'text-[#e9d5ff]'
                          : node.state === 'active'
                          ? 'text-[#f5f3ff]'
                          : node.state === 'standby'
                          ? 'text-[#a798c4]'
                          : 'text-[#4e4166]'
                      }`}
                    >
                      {node.label}
                    </span>
                    <span
                      className={`text-[8px] md:text-[9px] font-mono tracking-widest mt-0.5 uppercase ${
                        node.state === 'complete'
                          ? 'text-[#c084fc]'
                          : node.state === 'active'
                          ? 'text-[#38bdf8] font-semibold'
                          : 'text-[#504469]'
                      }`}
                    >
                      {node.statusText}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex items-center px-1 sm:px-1.5 shrink-0" aria-hidden="true">
                    <div
                      className={`h-[1px] w-3 sm:w-6 md:w-8 transition-colors duration-500 ${
                        node.state === 'complete'
                          ? 'bg-[#8b5cf6]'
                          : node.state === 'active'
                          ? 'bg-gradient-to-r from-[#9333ea] to-[#2c2044]'
                          : 'bg-[#251b38]'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="hidden 2xl:flex items-center gap-1.5 text-[10px] font-mono text-[#6d5c8c]">
          <span>STATUS:</span>
          <span className="text-[#a855f7] font-semibold uppercase">{stage.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProtocolStage,
  GateStatus,
  HelipadStatus,
  HelicopterStatus,
  EvaluationResult,
  EvaluationStep,
  SystemNotification,
} from './types/protocol';
import { mlEvaluationService, CANONICAL_EVALUATION_STEPS } from './services/mlAdapter';
import { soundFx } from './services/soundFx';
import { TopSystemBar } from './components/TopSystemBar';
import { EscapeRouteDiagram } from './components/EscapeRouteDiagram';
import { TransitEnvironment } from './components/TransitEnvironment';
import { SystemNotifications } from './components/SystemNotifications';
import { FinalEscapeScreen } from './components/FinalEscapeScreen';

export function App() {
  // Centralized State Model
  const [stage, setStage] = useState<ProtocolStage>('ARRIVAL');
  const [gateStatus, setGateStatus] = useState<GateStatus>('LOCKED');
  const [helipadStatus, setHelipadStatus] = useState<HelipadStatus>('STANDBY');
  const [helicopterStatus, setHelicopterStatus] = useState<HelicopterStatus>('HIDDEN');

  // Evaluation pipeline state
  const [evaluationSteps, setEvaluationSteps] = useState<EvaluationStep[]>([...CANONICAL_EVALUATION_STEPS]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [evaluationProgress, setEvaluationProgress] = useState<number>(0);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // Notifications feed
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Sound settings
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Guards against concurrent duplicate clicks
  const isExecutingRef = useRef<boolean>(false);

  // Audio mute toggle handler
  const handleToggleAudio = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    soundFx.setMuted(next);
  };

  // Helper to push system notification
  const pushNotification = useCallback((message: string, level: SystemNotification['level'] = 'system') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newNotice: SystemNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      message,
      level,
    };
    setNotifications((prev) => [...prev.slice(-8), newNotice]);
  }, []);

  // Reset simulation to arrival state
  const handleReset = useCallback(() => {
    isExecutingRef.current = false;
    setStage('ARRIVAL');
    setGateStatus('LOCKED');
    setHelipadStatus('STANDBY');
    setHelicopterStatus('HIDDEN');
    setCurrentStepIndex(0);
    setEvaluationProgress(0);
    setEvaluationResult(null);
    setEvaluationSteps(mlEvaluationService.getEvaluationSteps());
    setNotifications([]);
    pushNotification('PROTOCOL SIMULATION RESET // PURPLE TRANSIT INITIALIZED', 'info');
  }, [pushNotification]);

  // Initial welcome notification
  useEffect(() => {
    pushNotification('PURPLE ZONE TRANSIT REACHED // SANCTUARY LINK ACTIVE', 'info');
  }, [pushNotification]);

  // Initial sync with submissions API
  useEffect(() => {
    mlEvaluationService.syncSubmissions().catch(() => {});
  }, []);

  // --------------------------------------------------------------------------
  // STEP 1: RUN MODEL EVALUATION
  // --------------------------------------------------------------------------
  const handleRunEvaluation = async (csvContent?: string, rawFilename: string = 'submission.csv') => {
    if (isExecutingRef.current) return;
    if (stage !== 'ARRIVAL' && stage !== 'READY' && stage !== 'EVALUATION_COMPLETE') return;

    isExecutingRef.current = true;
    setStage('SUBMITTING');
    pushNotification(`MODEL EVALUATION TASK SUBMITTED (${rawFilename})`, 'system');

    // Slight transition pause into evaluating
    setTimeout(async () => {
      setStage('EVALUATING');

      try {
        const result = await mlEvaluationService.evaluateModel(
          csvContent,
          rawFilename,
          (stepIndex, updatedStep, progress) => {
            setCurrentStepIndex(stepIndex);
            setEvaluationProgress(progress);
            soundFx.playStepProgress();

            setEvaluationSteps((prev) => {
              const clone = [...prev];
              clone[stepIndex] = updatedStep;
              return clone;
            });
          }
        );

        setEvaluationResult(result);

        if (result.qualifiesForEscape) {
          setStage('EVALUATION_COMPLETE');
          soundFx.playAuthorized();
          const r2Pct = result.r2Score !== undefined ? (result.r2Score * 100).toFixed(2) : '80.00';
          pushNotification(`EVALUATION SUCCESS // R² = ${r2Pct}% CRUSHED 80% THRESHOLD`, 'authorization');
          pushNotification('GATE 04 BLAST SEALS UNLATCHING // DISPATCHING TRANSPORTER EX-09', 'authorization');

          // Automatically trigger exit gate authorization after brief inspection dwell
          setTimeout(() => {
            handleAuthorizeExit();
          }, 1400);
        } else {
          setStage('READY');
          soundFx.playWarning();
          const r2Pct = result.r2Score !== undefined ? (result.r2Score * 100).toFixed(2) : '0.00';
          pushNotification(`EVALUATION REJECTED // R² = ${r2Pct}% BELOW 80.00% BENCHMARK`, 'system');
          pushNotification(`GATE 04 SEALED // ${result.submissionsRemaining ?? 0} ATTEMPTS REMAINING`, 'system');
          isExecutingRef.current = false;
        }

      } catch (err: any) {
        console.error('Model evaluation error:', err);
        soundFx.playWarning();
        pushNotification(err.message || 'EVALUATION PIPELINE INTERRUPTED', 'system');
        setStage('READY');
        isExecutingRef.current = false;
      }
    }, 400);
  };

  // --------------------------------------------------------------------------
  // STEP 2: AUTHORIZE EXIT & ACTIVATE HELIPAD
  // --------------------------------------------------------------------------
  const handleAuthorizeExit = () => {
    setStage('EXIT_AUTHORIZED');
    pushNotification('EXTRACTION PROTOCOL AUTHORIZED', 'authorization');

    // 1. Unseal blast gate
    setGateStatus('AUTHORIZING');
    soundFx.playGateRelease();

    setTimeout(() => {
      setGateStatus('OPENING');
      pushNotification('GATE 04 BLAST SEALS UNLATCHING', 'system');

      setTimeout(() => {
        setGateStatus('OPEN');
        pushNotification('GATE 04 CLEARED // CORRIDOR UNSEALED', 'system');

        // 2. Initialize Helipad
        setHelipadStatus('INITIALIZING');
        pushNotification('HELIPAD SYSTEMS INITIALIZING', 'system');

        setTimeout(() => {
          setHelipadStatus('ACTIVE');
          setStage('HELIPAD_ACTIVE');
          pushNotification('HELIPAD STROBES ACTIVE // AZIMUTH 042° LOCKED', 'system');

          // 3. Dispatch Helicopter
          setTimeout(() => {
            handleHelicopterApproach();
          }, 800);
        }, 1200);
      }, 1000);
    }, 800);
  };

  // --------------------------------------------------------------------------
  // STEP 3: HELICOPTER APPROACH & TOUCHDOWN
  // --------------------------------------------------------------------------
  const handleHelicopterApproach = () => {
    setStage('HELICOPTER_APPROACHING');
    setHelicopterStatus('APPROACHING');
    pushNotification('EXTRACTION TRANSPORTER EX-09 INBOUND', 'extraction');

    // Wait for the 4-second approach flight animation to complete touchdown
    setTimeout(() => {
      setHelicopterStatus('LANDED');
      setHelipadStatus('EXTRACTION_HOT');
      pushNotification('TRANSPORTER TOUCHDOWN // PAD 01 HOT', 'extraction');

      setTimeout(() => {
        setHelicopterStatus('READY');
        setStage('EXTRACTION_READY');
        pushNotification('AWAITING EXTRACTION // BOARDING PERMIT ACTIVE', 'extraction');
        isExecutingRef.current = false; // Enable next action
      }, 800);
    }, 3800);
  };

  // --------------------------------------------------------------------------
  // STEP 4: BEGIN EXTRACTION (TAKEOFF & ESCAPE)
  // --------------------------------------------------------------------------
  const handleBeginExtraction = () => {
    if (stage !== 'EXTRACTION_READY' && helicopterStatus !== 'READY') return;
    if (isExecutingRef.current) return;

    isExecutingRef.current = true;
    setStage('EXTRACTION_IN_PROGRESS');
    setHelicopterStatus('DEPARTING');
    pushNotification('EXTRACTION CONFIRMED // ASCENDING FROM PAD 01', 'extraction');

    // After the departure flight animation settles (~4.2s)
    setTimeout(() => {
      setHelicopterStatus('DEPARTED');
      setStage('EXTRACTED');
      soundFx.playFinalComplete();
      pushNotification('AIRSPACE CLEARED // EXTRACTION COMPLETE', 'authorization');
      try {
        if (window.opener) window.opener.postMessage({ type: 'PURPLE_ESCAPE_QUALIFIED' }, '*');
        if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'PURPLE_ESCAPE_QUALIFIED' }, '*');
      } catch (e) {}
      isExecutingRef.current = false;
    }, 4200);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#07050d] text-[#ede8f5] overflow-x-hidden">
      {/* 1. Top System Bar */}
      <TopSystemBar
        stage={stage}
        audioMuted={audioMuted}
        onToggleAudio={handleToggleAudio}
        onReset={handleReset}
      />

      {/* 2. Persistent Industrial Escape Route Progression Diagram */}
      <EscapeRouteDiagram
        stage={stage}
        gateStatus={gateStatus}
        helipadStatus={helipadStatus}
        helicopterStatus={helicopterStatus}
      />

      {/* Persistent Helicopter Extraction Alert Banner (Visible when R² ≥ 0.80) */}
      {evaluationResult?.qualifiesForEscape && stage !== 'EXTRACTED' && (
        <div className="w-full bg-[#1b0f2e] border-y-2 border-[#9333ea] px-4 py-2 flex items-center justify-between shadow-[0_4px_20px_rgba(147,51,234,0.35)] z-20">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-bounce">🚁</span>
            <div>
              <h4 className="text-xs sm:text-sm font-tech font-extrabold text-[#f5f2fd] tracking-wider uppercase">
                EXTRACTION TRANSPORTER EX-09 AWAITING CREW AT TACTICAL HELIPAD 01
              </h4>
              <p className="text-[11px] font-mono text-[#c084fc]">
                R² threshold of 80.00% satisfied ({evaluationResult.primaryMetric.value}). Evacuation clearance verified. Blast Gate 04 unsealed.
              </p>
            </div>
          </div>
          {stage === 'EXTRACTION_READY' && (
            <button
              onClick={handleBeginExtraction}
              className="px-4 py-1.5 bg-[#10b981] hover:bg-[#059669] text-[#051f15] font-tech text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
            >
              BOARD CRAFT ↗
            </button>
          )}
        </div>
      )}

      {/* 3. Main 2D Purple Zone Facility Environment Canvas */}
      <TransitEnvironment
        stage={stage}
        gateStatus={gateStatus}
        helipadStatus={helipadStatus}
        helicopterStatus={helicopterStatus}
        evaluationProgress={evaluationProgress}
        currentStepIndex={currentStepIndex}
        steps={evaluationSteps}
        evaluationResult={evaluationResult}
        onRunEvaluation={handleRunEvaluation}
        onProceedToExtraction={handleAuthorizeExit}
        onBeginExtraction={handleBeginExtraction}
      />

      {/* 4. Subtle System Event Notification Feed */}
      <SystemNotifications notifications={notifications} />

      {/* 5. Final Escape Screen Overlay (Upon Completed Extraction) */}
      {stage === 'EXTRACTED' && (
        <FinalEscapeScreen
          evaluationResult={evaluationResult}
          onRestart={handleReset}
        />
      )}
    </div>
  );
}

export default App;

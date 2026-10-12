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

  // Authenticated Team Info
  const [teamInfo, setTeamInfo] = useState<{
    teamId?: string;
    teamName?: string;
    delegateId?: string;
    points?: number;
  } | null>(null);

  // Guards against concurrent duplicate clicks & active timers
  const isExecutingRef = useRef<boolean>(false);
  const timersRef = useRef<number[]>([]);

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

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

  const [isQuotaSynced, setIsQuotaSynced] = useState<boolean>(false);
  const [quotaSyncError, setQuotaSyncError] = useState<string | null>(null);
  const [syncedQuota, setSyncedQuota] = useState<{ used: number; remaining: number }>({ used: 0, remaining: 10 });

  const refreshQuota = useCallback(async () => {
    try {
      const q = await mlEvaluationService.syncSubmissions();
      setIsQuotaSynced(true);
      setQuotaSyncError(null);
      setSyncedQuota(q);
    } catch (err: any) {
      setIsQuotaSynced(false);
      setQuotaSyncError(err.message || 'Unable to connect to evaluation hub to verify quota.');
    }
  }, []);

  // Reset simulation to arrival state
  const handleReset = useCallback(() => {
    clearAllTimers();
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
    refreshQuota();
  }, [clearAllTimers, pushNotification, refreshQuota]);

  // Initial welcome notification
  useEffect(() => {
    pushNotification('PURPLE ZONE TRANSIT REACHED // SANCTUARY LINK ACTIVE', 'info');
  }, [pushNotification]);

  // Initial sync with submissions API and bootstrap
  useEffect(() => {
    refreshQuota();

    const fetchBootstrap = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');
        const res = await fetch(`${apiBase}/api/bootstrap`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.team) {
            setTeamInfo({
              teamId: data.team.id,
              teamName: data.team.name,
              delegateId: data.delegateId,
              points: data.team.points,
            });
            pushNotification(`AUTHENTICATED OPERATOR: ${data.team.name} [${data.team.id}]`, 'info');
          }
        }
      } catch (_) {}
    };
    fetchBootstrap();

    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers, pushNotification, refreshQuota]);

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
    safeTimeout(async () => {
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
        refreshQuota();

        if (result.qualifiesForEscape) {
          setStage('EVALUATION_COMPLETE');
          soundFx.playAuthorized();
          const r2Pct = result.r2Score !== undefined ? (result.r2Score * 100).toFixed(2) : '80.00';
          pushNotification(`EVALUATION SUCCESS // R² = ${r2Pct}% CRUSHED 80% THRESHOLD`, 'authorization');
          pushNotification('GATE 04 BLAST SEALS UNLATCHING // DISPATCHING TRANSPORTER EX-09', 'authorization');

          // Automatically trigger exit gate authorization after brief inspection dwell
          safeTimeout(() => {
            handleAuthorizeExit(result);
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
        refreshQuota();
      }
    }, 400);
  };

  // --------------------------------------------------------------------------
  // STEP 2: AUTHORIZE EXIT & ACTIVATE HELIPAD
  // --------------------------------------------------------------------------
  const handleAuthorizeExit = (explicitResult?: EvaluationResult) => {
    const activeResult = explicitResult || evaluationResult;
    if (!activeResult?.qualifiesForEscape) {
      pushNotification('AUTHORIZATION DENIED // MODEL R² DOES NOT SATISFY ≥ 80.00%', 'system');
      return;
    }

    setStage('EXIT_AUTHORIZED');
    pushNotification('EXTRACTION PROTOCOL AUTHORIZED', 'authorization');

    // 1. Unseal blast gate
    setGateStatus('AUTHORIZING');
    soundFx.playGateRelease();

    safeTimeout(() => {
      setGateStatus('OPENING');
      pushNotification('GATE 04 BLAST SEALS UNLATCHING', 'system');

      safeTimeout(() => {
        setGateStatus('OPEN');
        pushNotification('GATE 04 CLEARED // CORRIDOR UNSEALED', 'system');

        // 2. Initialize Helipad
        setHelipadStatus('INITIALIZING');
        pushNotification('HELIPAD SYSTEMS INITIALIZING', 'system');

        safeTimeout(() => {
          setHelipadStatus('ACTIVE');
          setStage('HELIPAD_ACTIVE');
          pushNotification('HELIPAD STROBES ACTIVE // AZIMUTH 042° LOCKED', 'system');

          // 3. Dispatch Helicopter
          safeTimeout(() => {
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
    safeTimeout(() => {
      setHelicopterStatus('LANDED');
      setHelipadStatus('EXTRACTION_HOT');
      pushNotification('TRANSPORTER TOUCHDOWN // PAD 01 HOT', 'extraction');

      safeTimeout(() => {
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
  const handleBeginExtraction = async () => {
    if (stage !== 'EXTRACTION_READY' || helicopterStatus !== 'READY') return;
    if (isExecutingRef.current) return;

    isExecutingRef.current = true;

    // Authoritative pre-departure server verification (STRICT FAIL-CLOSED)
    try {
      pushNotification('VERIFYING AUTHORITATIVE ESCAPE PERMIT WITH CENTRAL HUB...', 'system');
      const apiBase = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');
      const verifyRes = await fetch(`${apiBase}/api/bootstrap`, { credentials: 'include' });
      if (!verifyRes.ok) {
        throw new Error(`Central Hub returned HTTP ${verifyRes.status} (${verifyRes.statusText})`);
      }
      const boot = await verifyRes.json();
      if (!boot || !boot.authenticated) {
        throw new Error('Authentication required. Session is not active or recognized by central hub.');
      }
      const isEscapeUnlocked = Boolean(boot.ml?.escapeUnlocked);
      const isPurpleCleared = Boolean((boot.zones || []).some((z: any) => z.id === 'purple' && (z.state === 'cleared' || z.cleared)));

      if (!isEscapeUnlocked && !isPurpleCleared) {
        throw new Error('Escape clearance denied: Central hub has not confirmed qualifying ML score on record.');
      }
    } catch (err: any) {
      soundFx.playWarning();
      pushNotification(`EXTRACTION HALTED // SERVER VERIFICATION FAILED: ${err.message}`, 'system');
      isExecutingRef.current = false;
      return; // STRICT FAIL-CLOSED: Departure cannot proceed
    }

    setStage('EXTRACTION_IN_PROGRESS');
    setHelicopterStatus('DEPARTING');
    pushNotification('EXTRACTION CONFIRMED // ASCENDING FROM PAD 01', 'extraction');

    // After the departure flight animation settles (~4.2s)
    safeTimeout(() => {
      setHelicopterStatus('DEPARTED');
      setStage('EXTRACTED');
      soundFx.playFinalComplete();
      pushNotification('AIRSPACE CLEARED // EXTRACTION COMPLETE', 'authorization');
      try {
        const targetOrigin = window.location.origin;
        if (window.opener) window.opener.postMessage({ type: 'PURPLE_ESCAPE_QUALIFIED' }, targetOrigin);
        if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'PURPLE_ESCAPE_QUALIFIED' }, targetOrigin);
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
        teamInfo={teamInfo}
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
        quotaSyncError={quotaSyncError}
        isQuotaSynced={isQuotaSynced}
        syncedQuota={syncedQuota}
        onRetrySync={refreshQuota}
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

export type ProtocolStage =
  | 'ARRIVAL'
  | 'READY'
  | 'SUBMITTING'
  | 'EVALUATING'
  | 'EVALUATION_COMPLETE'
  | 'EXIT_AUTHORIZED'
  | 'HELIPAD_ACTIVE'
  | 'HELICOPTER_APPROACHING'
  | 'EXTRACTION_READY'
  | 'EXTRACTION_IN_PROGRESS'
  | 'EXTRACTED';

export type GateStatus = 'LOCKED' | 'AUTHORIZING' | 'OPENING' | 'OPEN';

export type HelipadStatus = 'STANDBY' | 'INITIALIZING' | 'ACTIVE' | 'EXTRACTION_HOT';

export type HelicopterStatus =
  | 'HIDDEN'
  | 'APPROACHING'
  | 'LANDED'
  | 'READY'
  | 'DEPARTING'
  | 'DEPARTED';

export interface EvaluationStep {
  id: string;
  label: string;
  detail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  durationMs: number;
}

export interface MetricDiagnostic {
  key: string;
  label: string;
  value: string;
  nominalRange: string;
  status: 'nominal' | 'verified';
}

export interface EvaluationResult {
  evaluationId: string;
  timestamp: string;
  modelFingerprint: string;
  datasetChecksum: string;
  status: 'ACCEPTED' | 'REJECTED';
  primaryMetric: {
    label: string;
    value: string;
    threshold: string;
    unit?: string;
  };
  diagnostics: MetricDiagnostic[];
  systemVerificationCode: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'system' | 'authorization' | 'extraction';
}

export interface FacilityState {
  stage: ProtocolStage;
  gateStatus: GateStatus;
  helipadStatus: HelipadStatus;
  helicopterStatus: HelicopterStatus;
  evaluationProgress: number; // 0 to 100
  currentStepIndex: number;
  evaluationResult: EvaluationResult | null;
  notifications: SystemNotification[];
  audioEnabled: boolean;
  transitTimerSeconds: number;
}

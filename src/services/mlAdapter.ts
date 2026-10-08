import { EvaluationResult, EvaluationStep } from '../types/protocol';

/**
 * =========================================================================
 * MANU PROTOCOL — ML EVALUATION SERVICE ADAPTER
 * =========================================================================
 * 
 * FRONTEND INTEGRATION BOUNDARY:
 * This interface and adapter decouple the Purple Zone frontend user interface
 * from the actual Machine Learning evaluation infrastructure.
 * 
 * FUTURE ML TEAM INTEGRATION:
 * When connecting a real model evaluation service:
 * 1. Implement this IMLEvaluationAdapter interface.
 * 2. Replace DefaultMLEvaluationAdapter with your network client (REST/gRPC/Wasm).
 * 3. The UI components will consume the streaming step updates and final
 *    EvaluationResult without requiring any UI redesign.
 */

export interface EvaluationProgressCallback {
  (stepIndex: number, currentStep: EvaluationStep, progressPercent: number): void;
}

export interface IMLEvaluationAdapter {
  /**
   * Returns the canonical diagnostic steps for the evaluation pipeline.
   */
  getEvaluationSteps(): EvaluationStep[];

  /**
   * Triggers the model evaluation sequence.
   * Dispatches periodic progress callbacks as the evaluation executes.
   * Resolves with the final EvaluationResult.
   */
  evaluateModel(onProgress?: EvaluationProgressCallback): Promise<EvaluationResult>;
}

export const CANONICAL_EVALUATION_STEPS: EvaluationStep[] = [
  {
    id: 'step_init',
    label: 'INITIALIZING SYSTEM',
    detail: 'Loading memory buffers, verifying cryptographic Sanctuary token',
    status: 'pending',
    durationMs: 700,
  },
  {
    id: 'step_dataset',
    label: 'LOADING DATASET',
    detail: 'Streaming telemetry vector batch #094-E (12,400 sensor records)',
    status: 'pending',
    durationMs: 850,
  },
  {
    id: 'step_model',
    label: 'VALIDATING MODEL',
    detail: 'Verifying weights integrity & inference pipeline graph',
    status: 'pending',
    durationMs: 750,
  },
  {
    id: 'step_eval',
    label: 'RUNNING EVALUATION',
    detail: 'Evaluating boundary escape survival policy against facility hazards',
    status: 'pending',
    durationMs: 1100,
  },
  {
    id: 'step_output',
    label: 'ANALYZING OUTPUT',
    detail: 'Computing convergence metrics, error distribution, decision latency',
    status: 'pending',
    durationMs: 800,
  },
  {
    id: 'step_assess',
    label: 'FINALIZING ASSESSMENT',
    detail: 'Matching exit protocol thresholds & generating extraction permit',
    status: 'pending',
    durationMs: 650,
  },
  {
    id: 'step_complete',
    label: 'EVALUATION COMPLETE',
    detail: 'Assessment verified by Purple Zone safety arbiter',
    status: 'pending',
    durationMs: 400,
  },
];

/**
 * Default Mock Adapter for Frontend Prototyping
 * NOTE: This mock generates deterministic demonstration data.
 * All metrics are marked as evaluation-provisional and do not claim to be actual ML inference.
 */
export class MockMLEvaluationAdapter implements IMLEvaluationAdapter {
  private steps: EvaluationStep[] = [...CANONICAL_EVALUATION_STEPS];

  getEvaluationSteps(): EvaluationStep[] {
    return this.steps.map(s => ({ ...s }));
  }

  async evaluateModel(onProgress?: EvaluationProgressCallback): Promise<EvaluationResult> {
    const totalSteps = this.steps.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = { ...this.steps[i], status: 'in_progress' as const };
      const percent = Math.round(((i) / totalSteps) * 100);
      onProgress?.(i, step, percent);

      // Await the step's simulated processing duration
      await new Promise(resolve => setTimeout(resolve, step.durationMs));

      // Mark step completed
      const completedStep = { ...step, status: 'completed' as const };
      const completedPercent = Math.round(((i + 1) / totalSteps) * 100);
      onProgress?.(i, completedStep, completedPercent);
    }

    // Generate deterministic demo result
    const now = new Date();
    const demoResult: EvaluationResult = {
      evaluationId: 'EVAL-094-PURPLE-' + Math.floor(now.getTime() % 100000).toString(16).toUpperCase().padStart(4, '0'),
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      modelFingerprint: 'SHA256:d8b4e7..19c3 (SURVIVAL_POLICY_V7)',
      datasetChecksum: 'CRC32:89F2A10D (BATCH_094_E)',
      status: 'ACCEPTED',
      primaryMetric: {
        label: 'SURVIVAL CONVERGENCE',
        value: '98.8%',
        threshold: '≥ 95.0%',
        unit: 'confidence',
      },
      diagnostics: [
        {
          key: 'exit_loss',
          label: 'Hazard Boundary Loss',
          value: '0.0118',
          nominalRange: '< 0.0500',
          status: 'verified',
        },
        {
          key: 'decision_lat',
          label: 'Path Decision Latency',
          value: '4.2 ms',
          nominalRange: '≤ 12.0 ms',
          status: 'nominal',
        },
        {
          key: 'containment_clear',
          label: 'Zone Transit Viability',
          value: 'VERIFIED',
          nominalRange: 'ACTIVE PASS',
          status: 'verified',
        },
      ],
      systemVerificationCode: 'PERMIT-AUTH//TRANSIT-PURPLE-PASS',
    };

    return demoResult;
  }
}

// Global default adapter singleton - easily swapped by tests or production backend wiring
export const mlEvaluationService: IMLEvaluationAdapter = new MockMLEvaluationAdapter();

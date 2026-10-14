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

  getSubmissionCount(): number;
  syncSubmissions(): Promise<{ used: number; remaining: number }>;
  evaluateModel(
    csvContentOrProgress?: string | EvaluationProgressCallback,
    filenameOrProgress?: string | EvaluationProgressCallback,
    onProgress?: EvaluationProgressCallback
  ): Promise<EvaluationResult>;
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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTeam = (urlParams.get('team') || urlParams.get('teamId') || '').trim().toUpperCase();
      let storedTeam = (localStorage.getItem('manu_team_id') || sessionStorage.getItem('manu_team_id') || '').trim().toUpperCase();
      if (storedTeam === 'TECHTEAM10328' && urlTeam !== 'TECHTEAM10328') {
        localStorage.removeItem('manu_team_id');
        sessionStorage.removeItem('manu_team_id');
        localStorage.removeItem('tld_launch_token');
        sessionStorage.removeItem('tld_launch_token');
        storedTeam = '';
      }
      const teamId = urlTeam || (storedTeam !== 'TECHTEAM10328' ? storedTeam : '');

      let launchToken = (urlParams.get('launchToken') || localStorage.getItem('tld_launch_token') || sessionStorage.getItem('tld_launch_token') || '').trim();
      if (launchToken && teamId && teamId !== 'TECHTEAM10328') {
        try {
          const payload = JSON.parse(atob(launchToken.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload && (payload.teamId === 'TECHTEAM10328' || payload.team === 'TECHTEAM10328')) {
            localStorage.removeItem('tld_launch_token');
            sessionStorage.removeItem('tld_launch_token');
            launchToken = '';
          }
        } catch (_) {}
      }

      const sessionId = (urlParams.get('sessionId') || localStorage.getItem('tld_session_id') || sessionStorage.getItem('tld_session_id') || '').trim();

      if (launchToken) {
        headers['x-launch-token'] = launchToken;
        try { localStorage.setItem('tld_launch_token', launchToken); } catch (_) {}
      }
      if (sessionId) {
        headers['x-session-id'] = sessionId;
        try { localStorage.setItem('tld_session_id', sessionId); } catch (_) {}
      }
      if (teamId) {
        headers['x-team-id'] = teamId;
        if (teamId !== 'TECHTEAM10328') {
          try { localStorage.setItem('manu_team_id', teamId); } catch (_) {}
        }
      }
    }
  } catch (_) {}
  return headers;
}

export class RealMLEvaluationAdapter implements IMLEvaluationAdapter {
  private steps: EvaluationStep[] = [...CANONICAL_EVALUATION_STEPS];
  private submissionCount: number = 0;

  getEvaluationSteps(): EvaluationStep[] {
    return this.steps.map(s => ({ ...s }));
  }

  getSubmissionCount(): number {
    return this.submissionCount;
  }

  async syncSubmissions(): Promise<{ used: number; remaining: number }> {
    const res = await fetch(`${API_BASE_URL}/api/ml/submissions`, {
      headers: { ...getAuthHeaders() },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Quota sync failed (HTTP ${res.status})`);
    }
    const data = await res.json();
    if (typeof data.submissionsUsed !== 'number') {
      throw new Error('Malformed quota response from server');
    }
    this.submissionCount = data.submissionsUsed;
    return {
      used: data.submissionsUsed,
      remaining: data.submissionsRemaining ?? Math.max(0, 10 - data.submissionsUsed),
    };
  }

  async evaluateModel(
    arg1?: string | EvaluationProgressCallback,
    arg2?: string | EvaluationProgressCallback,
    arg3?: EvaluationProgressCallback
  ): Promise<EvaluationResult> {
    let csvContent: string | undefined;
    let rawFilename = 'submission.csv';
    let onProgress: EvaluationProgressCallback | undefined;

    if (typeof arg1 === 'function') {
      onProgress = arg1;
    } else {
      csvContent = arg1;
      if (typeof arg2 === 'function') {
        onProgress = arg2;
      } else {
        if (typeof arg2 === 'string') rawFilename = arg2;
        if (typeof arg3 === 'function') onProgress = arg3;
      }
    }

    if (this.submissionCount >= 10) {
      throw new Error('Maximum submission quota reached (10/10 attempts used). Further submissions are locked.');
    }

    if (!csvContent || !csvContent.trim()) {
      throw new Error('Submission content cannot be empty.');
    }

    const totalSteps = this.steps.length;

    // Visual step progression
    for (let i = 0; i < totalSteps; i++) {
      const step = { ...this.steps[i], status: 'in_progress' as const };
      const percent = Math.round((i / totalSteps) * 100);
      onProgress?.(i, step, percent);
      await new Promise(resolve => setTimeout(resolve, Math.min(step.durationMs, 350)));
      const completedStep = { ...step, status: 'completed' as const };
      const completedPercent = Math.round(((i + 1) / totalSteps) * 100);
      onProgress?.(i, completedStep, completedPercent);
    }

    // Server-Authoritative Evaluation (Fail-Closed)
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/ml/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ csvContent, rawFilename })
      });
    } catch (networkErr: any) {
      throw new Error(`SCORING ARBITER UNREACHABLE — ATTEMPT PRESERVED: ${networkErr.message || 'Network connection failed'}`);
    }

    if (response.status === 429) {
      const errData = await response.json().catch(() => ({}));
      this.submissionCount = 10;
      if (errData.error === 'PURPLE_ALREADY_COMPLETED') {
        throw new Error(errData.message || 'Team has already completed the Purple Zone. Evacuation is authorized and submissions are permanently locked.');
      }
      throw new Error(errData.message || 'Maximum 10 submissions allowed per team. Submission quota exhausted.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (typeof errData.submissionsUsed === 'number') {
        this.submissionCount = errData.submissionsUsed;
      }
      throw new Error(errData.message || `Evaluation failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (
      !data ||
      !data.evaluationId ||
      typeof data.r2Score !== 'number' ||
      typeof data.submissionsUsed !== 'number' ||
      !data.timestamp
    ) {
      throw new Error('MALFORMED_SERVER_RESPONSE: Authoritative evaluation metadata missing from central hub response.');
    }

    this.submissionCount = data.submissionsUsed;
    const r2Pct = (data.r2Score * 100).toFixed(2);
    const attemptNum = data.attemptNumber || data.submissionsUsed;

    return {
      evaluationId: String(data.evaluationId),
      timestamp: String(data.timestamp).includes('UTC')
        ? String(data.timestamp)
        : String(data.timestamp).replace('T', ' ').substring(0, 19) + ' UTC',
      modelFingerprint: `SUBMISSION #${attemptNum} // ${rawFilename}`,
      datasetChecksum: 'GROUND_TRUTH_120_SURVIVORS',
      status: data.qualifiesForEscape ? 'ACCEPTED' : 'REJECTED',
      r2Score: data.r2Score,
      mseScore: data.mseScore,
      qualifiesForEscape: Boolean(data.qualifiesForEscape),
      submissionsUsed: data.submissionsUsed,
      submissionsRemaining: data.submissionsRemaining ?? Math.max(0, 10 - data.submissionsUsed),
      primaryMetric: {
        label: 'COEFFICIENT OF DETERMINATION (R²)',
        value: `${r2Pct}%`,
        threshold: '≥ 80.00%',
        unit: 'R² Score'
      },
      diagnostics: [
        {
          key: 'mse',
          label: 'Mean Squared Error (MSE)',
          value: typeof data.mseScore === 'number' ? data.mseScore.toFixed(6) : 'N/A',
          nominalRange: '< 0.0150',
          status: 'verified'
        },
        {
          key: 'count',
          label: 'Prediction Rows Evaluated',
          value: '120 / 120',
          nominalRange: 'EXACT 120',
          status: 'verified'
        },
        {
          key: 'status',
          label: 'Escape Route Authority',
          value: data.qualifiesForEscape ? 'UNLOCKED' : 'LOCKED',
          nominalRange: 'REQ R² ≥ 80%',
          status: data.qualifiesForEscape ? 'verified' : 'nominal'
        }
      ],
      systemVerificationCode: data.qualifiesForEscape ? 'PERMIT-AUTH//TRANSIT-PURPLE-PASS' : 'INSUFFICIENT-SIGNAL-CORRELATION'
    };
  }
}

export const mlEvaluationService = new RealMLEvaluationAdapter();

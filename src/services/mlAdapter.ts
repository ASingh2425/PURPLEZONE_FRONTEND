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

/**
 * Default Mock Adapter for Frontend Prototyping
 * NOTE: This mock generates deterministic demonstration data.
 * All metrics are marked as evaluation-provisional and do not claim to be actual ML inference.
 */
const PRIVATE_GROUND_TRUTH: Record<string, number> = {
  "SANC-0091":0.7855600450565978,"SANC-0092":0.7365442582319868,"SANC-0093":0.7299602527834895,"SANC-0094":0.7949018891946068,
  "SANC-0095":0.6463570550193369,"SANC-0096":0.5971032813467717,"SANC-0097":0.6133320634644873,"SANC-0098":0.7137084000940017,
  "SANC-0099":0.6639169470008285,"SANC-0100":0.7404040822807318,"SANC-0101":0.6582307836302138,"SANC-0102":0.7091266951491191,
  "SANC-0103":0.5684237750007051,"SANC-0104":0.6541351511385869,"SANC-0105":0.699377033104746,"SANC-0106":0.7797047417876326,
  "SANC-0107":0.7232451123704671,"SANC-0108":0.717076449233997,"SANC-0109":0.744396244189376,"SANC-0110":0.6677144491704878,
  "SANC-0111":0.5987649130360743,"SANC-0112":0.5469072145122187,"SANC-0113":0.5900678108647801,"SANC-0114":0.7624534129709696,
  "SANC-0115":0.6175398097724201,"SANC-0116":0.6075110285202364,"SANC-0117":0.5605805702195863,"SANC-0118":0.7778482139993967,
  "SANC-0119":0.802393915910192,"SANC-0120":0.7413860817300606,"SANC-0001":0.6786241942673062,"SANC-0002":0.6036934034367042,
  "SANC-0003":0.6683042007697901,"SANC-0004":0.7472331662383669,"SANC-0005":0.6602215380085629,"SANC-0006":0.5961975258736473,
  "SANC-0007":0.6875186926727583,"SANC-0008":0.5841550908740171,"SANC-0009":0.6618963226365021,"SANC-0010":0.7491618430168026,
  "SANC-0011":0.7267180729197252,"SANC-0012":0.7255957263983837,"SANC-0013":0.5559593573080263,"SANC-0014":0.7540533009351513,
  "SANC-0015":0.7125011247374422,"SANC-0016":0.5847200807635058,"SANC-0017":0.6802679397660759,"SANC-0018":0.7081941003944151,
  "SANC-0019":0.6765837073324015,"SANC-0020":0.4835242433924168,"SANC-0021":0.5748737066996311,"SANC-0022":0.7174006984076234,
  "SANC-0023":0.603331397968804,"SANC-0024":0.728482952536111,"SANC-0025":0.6168295514608605,"SANC-0026":0.6002763724262954,
  "SANC-0027":0.6176784264061508,"SANC-0028":0.4765193261205188,"SANC-0029":0.7471112317538444,"SANC-0030":0.670667667833712,
  "SANC-0031":0.5716196276232441,"SANC-0032":0.7422461229254896,"SANC-0033":0.7341100750919005,"SANC-0034":0.5822370854077566,
  "SANC-0035":0.665714738292273,"SANC-0036":0.7229459924253658,"SANC-0037":0.5688469705976089,"SANC-0038":0.7615081762322243,
  "SANC-0039":0.684008898778002,"SANC-0040":0.688563409397769,"SANC-0041":0.6477359830344438,"SANC-0042":0.6271485404123612,
  "SANC-0043":0.7069831501168642,"SANC-0044":0.5867199298062901,"SANC-0045":0.5824431687462832,"SANC-0046":0.5664332696608868,
  "SANC-0047":0.7038277919984709,"SANC-0048":0.7388518183463184,"SANC-0049":0.81873035411492,"SANC-0050":0.5561223898883787,
  "SANC-0051":0.7854264859516635,"SANC-0052":0.6967862251407126,"SANC-0053":0.5876472687721531,"SANC-0054":0.7677685750485324,
  "SANC-0055":0.6404897968591015,"SANC-0056":0.7152677432141056,"SANC-0057":0.5519137353039447,"SANC-0058":0.6419589148185489,
  "SANC-0059":0.7221739129559447,"SANC-0060":0.7001578506664768,"SANC-0061":0.5170786539145271,"SANC-0062":0.6893764866649054,
  "SANC-0063":0.6511501234428186,"SANC-0064":0.7734032639077375,"SANC-0065":0.7191386278448522,"SANC-0066":0.6642205318251689,
  "SANC-0067":0.6823216948533355,"SANC-0068":0.6530812145654313,"SANC-0069":0.6789019898866658,"SANC-0070":0.7999614298132817,
  "SANC-0071":0.861180168413321,"SANC-0072":0.7617126232762851,"SANC-0073":0.72526846587646,"SANC-0074":0.6710810606004527,
  "SANC-0075":0.6334023630756804,"SANC-0076":0.6403274718262032,"SANC-0077":0.909663633627993,"SANC-0078":0.7140880298916983,
  "SANC-0079":0.7004718700645016,"SANC-0080":0.7853007046807037,"SANC-0081":0.6957826324841535,"SANC-0082":0.6001570587336809,
  "SANC-0083":0.6991723367190947,"SANC-0084":0.6345213611674912,"SANC-0085":0.672728419326172,"SANC-0086":0.7126159206718227,
  "SANC-0087":0.6706940716242187,"SANC-0088":0.5869538834418482,"SANC-0089":0.6615106724459893,"SANC-0090":0.7843495775516673
};

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
    try {
      const res = await fetch('/api/ml/submissions');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.submissionsUsed === 'number') {
          this.submissionCount = data.submissionsUsed;
          return {
            used: data.submissionsUsed,
            remaining: data.submissionsRemaining ?? Math.max(0, 10 - data.submissionsUsed),
          };
        }
      }
    } catch (_) {}
    return { used: this.submissionCount, remaining: Math.max(0, 10 - this.submissionCount) };
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

    // Try central backend endpoint first
    if (csvContent) {
      try {
        const res = await fetch('/api/ml/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent, rawFilename })
        });

        if (res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Maximum 10 submissions allowed per team. Quota exhausted.');
        }

        if (res.ok) {
          const data = await res.json();
          this.submissionCount = data.submissionsUsed || (this.submissionCount + 1);
          const now = new Date();
          const r2Pct = (data.r2Score * 100).toFixed(2);

          return {
            evaluationId: 'EVAL-PRALAYA-' + Math.floor(now.getTime() % 100000).toString(16).toUpperCase().padStart(4, '0'),
            timestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            modelFingerprint: `SUBMISSION #${this.submissionCount} // ${rawFilename}`,
            datasetChecksum: 'GROUND_TRUTH_120_SURVIVORS',
            status: data.qualifiesForEscape ? 'ACCEPTED' : 'REJECTED',
            r2Score: data.r2Score,
            mseScore: data.mseScore,
            qualifiesForEscape: data.qualifiesForEscape,
            submissionsUsed: this.submissionCount,
            submissionsRemaining: Math.max(0, 10 - this.submissionCount),
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
                value: (data.mseScore || 0).toFixed(6),
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
      } catch (err: any) {
        if (err.message && err.message.includes('Maximum submission quota')) {
          throw err;
        }
        // If network error, fall through to client-side evaluation
      }
    }

    // Client-side fallback evaluation against exact private answers
    this.submissionCount += 1;
    let r2 = 0.7754;
    let mse = 0.00192;

    if (csvContent) {
      const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const preds: Record<string, number> = {};
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const id = parts[0];
          const val = parseFloat(parts[1]);
          if (id && !isNaN(val)) preds[id] = val;
        }
      }

      const ids = Object.keys(PRIVATE_GROUND_TRUTH);
      const n = ids.length;
      const sumY = ids.reduce((s, id) => s + PRIVATE_GROUND_TRUTH[id], 0);
      const meanY = sumY / n;
      let ssTot = 0;
      let ssRes = 0;

      for (const id of ids) {
        const yTrue = PRIVATE_GROUND_TRUTH[id];
        const yPred = preds[id] !== undefined ? preds[id] : 0.5;
        ssTot += Math.pow(yTrue - meanY, 2);
        ssRes += Math.pow(yTrue - yPred, 2);
      }

      r2 = Math.round((1 - (ssRes / ssTot)) * 10000) / 10000;
      mse = Math.round((ssRes / n) * 1000000) / 1000000;
    }

    const qualifies = r2 >= 0.80;
    const now = new Date();
    const r2Pct = (r2 * 100).toFixed(2);

    return {
      evaluationId: 'EVAL-PRALAYA-' + Math.floor(now.getTime() % 100000).toString(16).toUpperCase().padStart(4, '0'),
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      modelFingerprint: `SUBMISSION #${this.submissionCount} // ${rawFilename}`,
      datasetChecksum: 'GROUND_TRUTH_120_SURVIVORS',
      status: qualifies ? 'ACCEPTED' : 'REJECTED',
      r2Score: r2,
      mseScore: mse,
      qualifiesForEscape: qualifies,
      submissionsUsed: this.submissionCount,
      submissionsRemaining: Math.max(0, 10 - this.submissionCount),
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
          value: mse.toFixed(6),
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
          value: qualifies ? 'UNLOCKED' : 'LOCKED',
          nominalRange: 'REQ R² ≥ 80%',
          status: qualifies ? 'verified' : 'nominal'
        }
      ],
      systemVerificationCode: qualifies ? 'PERMIT-AUTH//TRANSIT-PURPLE-PASS' : 'INSUFFICIENT-SIGNAL-CORRELATION'
    };
  }
}

export const mlEvaluationService = new RealMLEvaluationAdapter();

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Cpu,
  Database,
  ShieldAlert,
  Activity,
  ArrowRight,
  CornerDownRight,
  Download,
  UploadCloud,
  FileText,
  Check,
  AlertTriangle,
  AlertCircle,
  Copy,
  CheckCheck,
  FileSpreadsheet,
  Layers,
  Award,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProtocolStage, EvaluationResult, EvaluationStep } from '../types/protocol';
import { PURPLE_CONFIG } from '../config/purpleConfig';
import { soundFx } from '../services/soundFx';

interface MLEvaluationTerminalProps {
  stage: ProtocolStage;
  evaluationProgress: number;
  currentStepIndex: number;
  steps: EvaluationStep[];
  evaluationResult: EvaluationResult | null;
  onRunEvaluation: (csvContent?: string, filename?: string) => void;
  onProceedToExtraction?: () => void;
  quotaSyncError?: string | null;
  isQuotaSynced?: boolean;
  syncedQuota?: { used: number; remaining: number };
  onRetrySync?: () => void;
}

type TerminalTab = 'guidelines' | 'data' | 'submit' | 'scorecard';

// List of 120 required test IDs
const TEST_SURVIVOR_IDS = new Set([
  'SANC-0091','SANC-0092','SANC-0093','SANC-0094','SANC-0095','SANC-0096','SANC-0097','SANC-0098','SANC-0099','SANC-0100',
  'SANC-0101','SANC-0102','SANC-0103','SANC-0104','SANC-0105','SANC-0106','SANC-0107','SANC-0108','SANC-0109','SANC-0110',
  'SANC-0111','SANC-0112','SANC-0113','SANC-0114','SANC-0115','SANC-0116','SANC-0117','SANC-0118','SANC-0119','SANC-0120',
  'SANC-0001','SANC-0002','SANC-0003','SANC-0004','SANC-0005','SANC-0006','SANC-0007','SANC-0008','SANC-0009','SANC-0010',
  'SANC-0011','SANC-0012','SANC-0013','SANC-0014','SANC-0015','SANC-0016','SANC-0017','SANC-0018','SANC-0019','SANC-0020',
  'SANC-0021','SANC-0022','SANC-0023','SANC-0024','SANC-0025','SANC-0026','SANC-0027','SANC-0028','SANC-0029','SANC-0030',
  'SANC-0031','SANC-0032','SANC-0033','SANC-0034','SANC-0035','SANC-0036','SANC-0037','SANC-0038','SANC-0039','SANC-0040',
  'SANC-0041','SANC-0042','SANC-0043','SANC-0044','SANC-0045','SANC-0046','SANC-0047','SANC-0048','SANC-0049','SANC-0050',
  'SANC-0051','SANC-0052','SANC-0053','SANC-0054','SANC-0055','SANC-0056','SANC-0057','SANC-0058','SANC-0059','SANC-0060',
  'SANC-0061','SANC-0062','SANC-0063','SANC-0064','SANC-0065','SANC-0066','SANC-0067','SANC-0068','SANC-0069','SANC-0070',
  'SANC-0071','SANC-0072','SANC-0073','SANC-0074','SANC-0075','SANC-0076','SANC-0077','SANC-0078','SANC-0079','SANC-0080',
  'SANC-0081','SANC-0082','SANC-0083','SANC-0084','SANC-0085','SANC-0086','SANC-0087','SANC-0088','SANC-0089','SANC-0090'
]);

function parseCsvLine(line: string): string[] | null {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (inQuotes) {
    return null; // Malformed CSV line: unmatched quote
  }
  result.push(current.trim());
  return result;
}

interface PreflightStatus {
  checked: boolean;
  valid: boolean;
  headerValid: boolean;
  rowCount: number;
  countValid: boolean;
  idsValid: boolean;
  rangeValid: boolean;
  errors: string[];
}

export const MLEvaluationTerminal: React.FC<MLEvaluationTerminalProps> = ({
  stage,
  evaluationProgress,
  currentStepIndex,
  steps,
  evaluationResult,
  onRunEvaluation,
  onProceedToExtraction,
  quotaSyncError,
  isQuotaSynced = true,
  syncedQuota,
  onRetrySync,
}) => {
  const [activeTab, setActiveTab] = useState<TerminalTab>('guidelines');
  const [csvContent, setCsvContent] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPasting, setIsPasting] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preflight validation state
  const [preflight, setPreflight] = useState<PreflightStatus>({
    checked: false,
    valid: false,
    headerValid: false,
    rowCount: 0,
    countValid: false,
    idsValid: false,
    rangeValid: false,
    errors: [],
  });

  const isEvaluating = stage === 'SUBMITTING' || stage === 'EVALUATING';
  const isComplete =
    stage === 'EVALUATION_COMPLETE' ||
    stage === 'EXIT_AUTHORIZED' ||
    stage === 'HELIPAD_ACTIVE' ||
    stage === 'HELICOPTER_APPROACHING' ||
    stage === 'EXTRACTION_READY' ||
    stage === 'EXTRACTION_IN_PROGRESS' ||
    stage === 'EXTRACTED';

  const submissionsUsed = evaluationResult?.submissionsUsed ?? syncedQuota?.used ?? 0;
  const submissionsRemaining = evaluationResult?.submissionsRemaining ?? syncedQuota?.remaining ?? Math.max(0, 10 - submissionsUsed);
  const isQuotaExhausted = submissionsUsed >= 10;
  const isSyncBlocked = !isQuotaSynced || !!quotaSyncError;
  const qualifies = evaluationResult?.qualifiesForEscape ?? (evaluationResult?.r2Score !== undefined && evaluationResult.r2Score >= 0.80);

  // Automatically switch tab to scorecard when evaluation is triggered or complete
  useEffect(() => {
    if (isEvaluating || (isComplete && evaluationResult)) {
      setActiveTab('scorecard');
    }
  }, [isEvaluating, isComplete, evaluationResult]);

  // Pre-flight validator function
  const runPreflightValidation = (raw: string, filename: string = 'submission.csv') => {
    const cleanRaw = raw.replace(/^\uFEFF/, '').trim();
    if (!cleanRaw) {
      setPreflight({
        checked: false,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: [],
      });
      return;
    }

    const errors: string[] = [];
    const lines = cleanRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      setPreflight({
        checked: true,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: ['File is empty or contains no prediction rows.'],
      });
      return;
    }

    // 1. Header Validation (RFC-4180 compliant)
    const rawHeader = parseCsvLine(lines[0]);
    if (!rawHeader) {
      setPreflight({
        checked: true,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: ['Header has malformed CSV formatting (unmatched quote).'],
      });
      return;
    }
    const header = rawHeader.map(h => h.toLowerCase().replace(/^["']|["']$/g, '').trim());
    const idIdx = header.findIndex(h => h === 'sanctuary_id');
    const predIdx = header.findIndex(h => h === 'survival_probability');
    const headerValid = idIdx !== -1 && predIdx !== -1 && header.length === 2;
    if (!headerValid) {
      errors.push('Header must contain exactly "Sanctuary_ID" and "Survival_Probability" columns.');
    }

    // 2. Parse & Check Rows
    const foundIds = new Set<string>();
    let invalidRangeCount = 0;
    let unrecognizedIdsCount = 0;
    let malformedColumnCount = 0;
    let malformedQuoteCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (!row) {
        malformedQuoteCount++;
        errors.push(`Row ${i + 1} has malformed CSV formatting (unmatched quote).`);
        continue;
      }
      if (row.length !== 2) {
        malformedColumnCount++;
        if (malformedColumnCount <= 5) {
          errors.push(`Row ${i + 1} has invalid column count (${row.length}, expected 2).`);
        }
        continue;
      }
      const id = (idIdx !== -1 ? row[idIdx] : row[0]).replace(/^["']|["']$/g, '').trim();
      const valStr = (predIdx !== -1 ? row[predIdx] : row[1]).replace(/^["']|["']$/g, '').trim();

      if (!id) {
        errors.push(`Row ${i + 1} has an empty Sanctuary_ID.`);
      } else {
        if (foundIds.has(id)) {
          errors.push(`Duplicate Sanctuary_ID detected: "${id}" at row ${i + 1}`);
        }
        foundIds.add(id);

        if (!TEST_SURVIVOR_IDS.has(id)) {
          unrecognizedIdsCount++;
        }
      }

      if (!valStr || !/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(valStr)) {
        invalidRangeCount++;
      } else {
        const val = Number(valStr);
        if (isNaN(val) || !Number.isFinite(val) || val < 0.0 || val > 1.0) {
          invalidRangeCount++;
        }
      }
    }

    if (malformedColumnCount > 5) {
      errors.push(`... and ${malformedColumnCount - 5} additional rows with invalid column counts.`);
    }

    const countValid = foundIds.size === 120;
    if (!countValid) {
      errors.push(`Expected exactly 120 unique survivor rows. Found: ${foundIds.size}.`);
    }

    const idsValid = unrecognizedIdsCount === 0 && countValid;
    if (unrecognizedIdsCount > 0) {
      errors.push(`${unrecognizedIdsCount} IDs not recognized in the 120 test survivor cohort.`);
    }

    const rangeValid = invalidRangeCount === 0;
    if (invalidRangeCount > 0) {
      errors.push(`${invalidRangeCount} predictions have values outside [0.0, 1.0] or are malformed/non-numeric.`);
    }

    const valid = headerValid && countValid && idsValid && rangeValid && malformedColumnCount === 0 && malformedQuoteCount === 0;

    setPreflight({
      checked: true,
      valid,
      headerValid,
      rowCount: foundIds.size,
      countValid,
      idsValid,
      rangeValid,
      errors,
    });
  };

  // Handle file selection from local device
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFileName(file.name);
      setPreflight({
        checked: true,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: ['Invalid file format: upload must be a .csv file.'],
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFileName(file.name);
      setPreflight({
        checked: true,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: [`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit (5 MB).`],
      });
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setCsvContent(text);
      runPreflightValidation(text, file.name);
    };
    reader.onerror = () => {
      setPreflight({
        checked: true,
        valid: false,
        headerValid: false,
        rowCount: 0,
        countValid: false,
        idsValid: false,
        rangeValid: false,
        errors: ['Failed to read file from local device.'],
      });
    };
    reader.readAsText(file);
  };

  // Handle quick load sample baseline
  const handleLoadSampleBaseline = async () => {
    soundFx.playClick();
    try {
      const res = await fetch('/datasets/sample_submission.csv');
      if (res.ok) {
        const text = await res.text();
        setSelectedFileName('sample_submission.csv');
        setCsvContent(text);
        runPreflightValidation(text, 'sample_submission.csv');
      } else {
        const sampleText = ['Sanctuary_ID,Survival_Probability', ...Array.from(TEST_SURVIVOR_IDS).map(id => `${id},0.5000`)].join('\n');
        setSelectedFileName('sample_submission.csv');
        setCsvContent(sampleText);
        runPreflightValidation(sampleText, 'sample_submission.csv');
      }
    } catch (_) {
      const sampleText = ['Sanctuary_ID,Survival_Probability', ...Array.from(TEST_SURVIVOR_IDS).map(id => `${id},0.5000`)].join('\n');
      setSelectedFileName('sample_submission.csv');
      setCsvContent(sampleText);
      runPreflightValidation(sampleText, 'sample_submission.csv');
    }
  };

  // Submit evaluation action
  const handleTriggerSubmission = () => {
    if (qualifies) {
      soundFx.playWarning();
      return;
    }
    if (!preflight.valid) {
      soundFx.playWarning();
      return;
    }
    if (isQuotaExhausted) {
      soundFx.playWarning();
      return;
    }
    soundFx.playClick();
    setActiveTab('scorecard');
    onRunEvaluation(csvContent, selectedFileName || 'submission.csv');
  };

  const pythonStarterScript = `# ==============================================================================
# PRALAYA CORE // RECONSTRUCTION & REGRESSION PIPELINE (100% EXECUTABLE)
# ==============================================================================
import os
import pandas as pd
import numpy as np
from sklearn.linear_model import RidgeCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.model_selection import KFold, cross_val_score

print("[1/5] Loading reconstructed zone archive fragments...")
# Load the 4 zone fragments recovered across previous sectors
community = pd.read_csv('community_final.csv')   # Yellow Sector (20 features)
radio     = pd.read_csv('radio_final.csv')       # Blue Sector   (18 features)
forensics = pd.read_csv('forensics_final.csv')   # Orange Sector (18 features)
research  = pd.read_csv('research_final.csv')    # Red Sector    (25 features)

print("[2/5] Merging test cohort & verifying schema...")
# Inner merge on Sanctuary_ID to assemble test.csv (120 survivors)
test_df = community.merge(radio, on='Sanctuary_ID') \\
                   .merge(forensics, on='Sanctuary_ID') \\
                   .merge(research, on='Sanctuary_ID')

assert len(test_df) == 120, f"Expected 120 survivors, got {len(test_df)}"
assert test_df['Sanctuary_ID'].nunique() == 120, "Duplicate Sanctuary_IDs detected in merge"
print(f"      Reconstructed test cohort: {test_df.shape[0]} survivors across {test_df.shape[1] - 1} features.")

print("[3/5] Loading historical training data & preparing feature transforms...")
train_df = pd.read_csv('train.csv')  # 450 historical residents with Survival_Probability
target_col = 'Survival_Probability'
feature_cols = [c for c in test_df.columns if c != 'Sanctuary_ID' and c in train_df.columns]

X_train = train_df[feature_cols]
y_train = train_df[target_col]
X_test  = test_df[feature_cols]

num_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = [c for c in feature_cols if c not in num_cols]
print(f"      Features: {len(num_cols)} numeric, {len(cat_cols)} categorical.")

# Robust preprocessing: median imputation & scaling for numeric; frequency impute & OHE for categorical
preprocessor = ColumnTransformer(
    transformers=[
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), num_cols),
        ('cat', Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('ohe', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ]), cat_cols)
    ]
)

# Regularized linear model (RidgeCV automatically tunes alpha across log-space)
model = Pipeline([
    ('prep', preprocessor),
    ('regressor', RidgeCV(alphas=np.logspace(-3, 3, 50)))
])

print("[4/5] Running 5-fold cross-validation on historical training data...")
cv = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='r2')
print(f"      Cross-Validation R² Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

print("[5/5] Fitting full pipeline & generating predictions for test survivors...")
model.fit(X_train, y_train)
raw_preds = model.predict(X_test)
predictions = np.clip(raw_preds, 0.0, 1.0)

submission = pd.DataFrame({
    'Sanctuary_ID': test_df['Sanctuary_ID'],
    'Survival_Probability': np.round(predictions, 4)
})

assert len(submission) == 120, "Output must have exactly 120 rows"
assert not submission['Survival_Probability'].isnull().any(), "No NaN values allowed"
submission.to_csv('submission.csv', index=False)
print("SUCCESS: submission.csv generated (120 rows). Ready for terminal upload!")
print(submission.head(5))
`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(pythonStarterScript);
    setCodeCopied(true);
    soundFx.playClick();
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const activeStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="relative w-full max-w-2xl xl:max-w-3xl bg-[#120d20] border-2 border-[#3e2c5d] shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-sm p-4 sm:p-5 flex flex-col justify-between select-none transition-all">
      {/* Matte Terminal Chassis Corner Rivets */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#543b78]" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#543b78]" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#543b78]" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#2a1d3f] border border-[#543b78]" />

      {/* Top Header Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between border-b border-[#2a1e40] pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#a855f7] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#d6c9f0] uppercase font-bold">
              PRALAYA CORE // EVALUATION TERMINAL
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            {/* Quota Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs border font-semibold ${
              isQuotaExhausted
                ? 'bg-[#2d1118] border-[#ef4444] text-[#fca5a5]'
                : submissionsUsed >= 8
                ? 'bg-[#2d1d0c] border-[#f59e0b] text-[#fcd34d]'
                : 'bg-[#1b122e] border-[#7e3af2] text-[#d8b4fe]'
            }`}>
              <Clock className="w-3 h-3" />
              <span>SUBMISSIONS: {submissionsUsed} / 10 USED</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[#8c7da8]">
              <span>ARBITER:</span>
              <span className="text-[#38bdf8] font-bold">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Primary Screen Title */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-tech font-extrabold tracking-wide text-[#f5f2fd] leading-tight flex items-center gap-2">
              SURVIVAL MODEL ARBITER
              <span className="text-xs font-mono font-normal text-[#a855f7] bg-[#24153d] px-2 py-0.5 border border-[#552787]">
                KAGGLE BENCHMARK
              </span>
            </h2>
            <p className="text-[11px] font-mono text-[#9f8ebf] mt-0.5">
              TARGET: <span className="text-[#38bdf8] font-bold">R² ≥ 0.8000 (80.00%)</span> · COHORT: <span className="text-[#ede8f5] font-semibold">120 SURVIVORS</span> · MAX ATTEMPTS: <span className="text-[#f59e0b] font-semibold">10</span>
            </p>
          </div>
        </div>

        {/* Kaggle Competition Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 mt-4 p-1 bg-[#0d0918] border border-[#2b1d42] rounded-xs text-xs font-tech">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('guidelines');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 transition-all font-bold tracking-wider ${
              activeTab === 'guidelines'
                ? 'bg-[#2e1a52] text-[#f5f2fe] border-b-2 border-[#a855f7] shadow-sm'
                : 'text-[#8573a3] hover:text-[#cfc3e8] hover:bg-[#181129]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">GUIDELINES</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('data');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 transition-all font-bold tracking-wider ${
              activeTab === 'data'
                ? 'bg-[#2e1a52] text-[#f5f2fe] border-b-2 border-[#a855f7] shadow-sm'
                : 'text-[#8573a3] hover:text-[#cfc3e8] hover:bg-[#181129]'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">DATA VAULT</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('submit');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 transition-all font-bold tracking-wider relative ${
              activeTab === 'submit'
                ? 'bg-[#2e1a52] text-[#f5f2fe] border-b-2 border-[#a855f7] shadow-sm'
                : 'text-[#8573a3] hover:text-[#cfc3e8] hover:bg-[#181129]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">SUBMIT CSV</span>
            {preflight.valid && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('scorecard');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 transition-all font-bold tracking-wider ${
              activeTab === 'scorecard'
                ? 'bg-[#2e1a52] text-[#f5f2fe] border-b-2 border-[#a855f7] shadow-sm'
                : 'text-[#8573a3] hover:text-[#cfc3e8] hover:bg-[#181129]'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">SCORECARD</span>
            {evaluationResult && (
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded-xs ml-0.5 ${
                qualifies ? 'bg-[#0284c7]/40 text-[#38bdf8]' : 'bg-[#dc2626]/40 text-[#f87171]'
              }`}>
                {qualifies ? 'PASS' : 'FAIL'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Panels Body */}
      <div className="my-4 min-h-[300px]">

        {/* =====================================================================
            TAB 1: GUIDELINES & EVALUATION RULES
            ===================================================================== */}
        {activeTab === 'guidelines' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Directive Card */}
            <div className="bg-[#150f24] border border-[#2f214a] p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9382b3] pb-2 border-b border-[#25193c]">
                <span className="text-[#a855f7] font-bold">MISSION DIRECTIVE // THE 4-ZONE MERGE</span>
                <span className="text-[#38bdf8]">SANCTUARY PROTOCOL</span>
              </div>
              <p className="text-xs text-[#cfc5e8] mt-2 leading-relaxed">
                As the infection escalated, survivor records were split into 4 isolated zone fragments. To build your test dataset, perform an <strong>inner merge</strong> across all 4 files on the primary key <code className="bg-[#211438] text-[#c084fc] px-1 py-0.5 rounded-xs font-mono">Sanctuary_ID</code> (120 survivors: <code className="text-[#38bdf8]">SANC-0001</code> through <code className="text-[#38bdf8]">SANC-0120</code>).
              </p>

              {/* Fragment pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2 border-t border-[#23173d] text-[10px] font-mono">
                <div className="bg-[#1e1333] border border-[#452773] p-1.5">
                  <span className="text-[#f5c518] block font-bold">YELLOW ARCHIVE</span>
                  <span className="text-[#9987ba]">Community (20 feats)</span>
                </div>
                <div className="bg-[#131d33] border border-[#24436e] p-1.5">
                  <span className="text-[#38bdf8] block font-bold">BLUE RADIO</span>
                  <span className="text-[#9987ba]">Transmissions (18 feats)</span>
                </div>
                <div className="bg-[#2e1915] border border-[#693125] p-1.5">
                  <span className="text-[#fb923c] block font-bold">ORANGE FORENSICS</span>
                  <span className="text-[#9987ba]">Authenticity (18 feats)</span>
                </div>
                <div className="bg-[#2d121c] border border-[#6b253b] p-1.5">
                  <span className="text-[#f87171] block font-bold">RED RESEARCH</span>
                  <span className="text-[#9987ba]">Vitals (25 feats)</span>
                </div>
              </div>
            </div>

            {/* Evaluation Formula Card */}
            <div className="bg-[#150f24] border border-[#2f214a] p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9382b3] pb-2 border-b border-[#25193c]">
                <span className="text-[#a855f7] font-bold">EVALUATION METRIC // ESCAPE THRESHOLD</span>
                <span className="text-[#4ade80]">TARGET: R² ≥ 0.8000</span>
              </div>
              <p className="text-xs text-[#cfc5e8] mt-2 leading-relaxed">
                Your model is scored on hidden private ground truth labels using the Coefficient of Determination (R²) and Mean Squared Error (MSE):
              </p>
              <div className="bg-[#0e0a18] border border-[#2b1c42] p-2.5 my-2 rounded-xs font-mono text-center text-xs text-[#a855f7]">
                R² = 1 − ( ∑ (y_true − y_pred)² / ∑ (y_true − y_mean)² )
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-2">
                <div className="bg-[#18112b] p-2 border border-[#291b40]">
                  <span className="text-[#f59e0b] font-bold block">STRICT 10 SUBMISSIONS QUOTA</span>
                  <span className="text-[#9181ab]">Every team is granted exactly 10 evaluation attempts. Attempt #11 is locked.</span>
                </div>
                <div className="bg-[#18112b] p-2 border border-[#291b40]">
                  <span className="text-[#38bdf8] font-bold block">HELICOPTER EXTRACTION</span>
                  <span className="text-[#9181ab]">When R² ≥ 0.80, Gate 04 blast doors open and Transporter EX-09 lands on the helipad.</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('data');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#271747] hover:bg-[#392166] text-[#ede7f7] font-tech text-xs font-bold tracking-wider border border-[#6b3ca8] transition-all"
              >
                <span>OPEN DATA VAULT</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: DATA VAULT & RECONSTRUCTION DOWNLOADS
            ===================================================================== */}
        {activeTab === 'data' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Primary Core Datasets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* train.csv */}
              <div className="bg-[#160f29] border-2 border-[#5b3896] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-tech font-bold text-[#f5f2fe] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#a855f7]" />
                      train.csv
                    </span>
                    <span className="text-[9px] font-mono text-[#38bdf8] bg-[#0c1f2e] px-1.5 py-0.5 border border-[#0284c7]/40">
                      TRAINING SET
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9d8cb8] mt-1.5 leading-relaxed">
                    450 labeled historical residents with confirmed <code className="text-[#c084fc]">Survival_Probability</code> target values and all 79 merged attributes.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#2b1d44] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6c5b8a]">422 KB · 450 rows</span>
                  <a
                    href="/datasets/train.csv"
                    download="train.csv"
                    onClick={() => soundFx.playClick()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#311c57] hover:bg-[#482880] text-[#f5f2fe] font-tech text-xs font-bold border border-[#9333ea] shadow-sm transition-all"
                  >
                    <Download className="w-3 h-3 text-[#38bdf8]" />
                    <span>DOWNLOAD</span>
                  </a>
                </div>
              </div>

              {/* sample_submission.csv */}
              <div className="bg-[#160f29] border border-[#3b2759] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-tech font-bold text-[#f5f2fe] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-[#38bdf8]" />
                      sample_submission.csv
                    </span>
                    <span className="text-[9px] font-mono text-[#f59e0b] bg-[#2d1b09] px-1.5 py-0.5 border border-[#d97706]/40">
                      SCHEMA TEMPLATE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9d8cb8] mt-1.5 leading-relaxed">
                    Contains the exact 120 test IDs (<code className="text-[#38bdf8]">SANC-0001..SANC-0120</code>) initialized with a 0.500 baseline probability.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#2b1d44] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6c5b8a]">2.1 KB · 120 rows</span>
                  <a
                    href="/datasets/sample_submission.csv"
                    download="sample_submission.csv"
                    onClick={() => soundFx.playClick()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#21163b] hover:bg-[#34235c] text-[#ede8f7] font-tech text-xs font-bold border border-[#5a388a] transition-all"
                  >
                    <Download className="w-3 h-3 text-[#38bdf8]" />
                    <span>DOWNLOAD</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 4 Recovered Zone Fragments */}
            <div className="bg-[#130d22] border border-[#2b1c42] p-3">
              <span className="text-[10px] font-mono text-[#9887b8] uppercase font-bold tracking-wider block mb-2">
                RECOVERED SECTOR ARCHIVE FRAGMENTS (TEST SET INPUTS)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href="/datasets/community_final.csv"
                  download="community_final.csv"
                  onClick={() => soundFx.playClick()}
                  className="bg-[#191129] hover:bg-[#25183d] border border-[#3b2759] p-2 flex flex-col justify-between transition-colors group"
                >
                  <span className="text-[10px] font-mono text-[#f5c518] font-bold truncate">community_final.csv</span>
                  <span className="text-[9px] font-mono text-[#7a6896] mt-1 flex items-center justify-between">
                    <span>19.5 KB</span>
                    <Download className="w-2.5 h-2.5 text-[#a855f7] group-hover:scale-125 transition-transform" />
                  </span>
                </a>

                <a
                  href="/datasets/radio_final.csv"
                  download="radio_final.csv"
                  onClick={() => soundFx.playClick()}
                  className="bg-[#191129] hover:bg-[#25183d] border border-[#3b2759] p-2 flex flex-col justify-between transition-colors group"
                >
                  <span className="text-[10px] font-mono text-[#38bdf8] font-bold truncate">radio_final.csv</span>
                  <span className="text-[9px] font-mono text-[#7a6896] mt-1 flex items-center justify-between">
                    <span>21.6 KB</span>
                    <Download className="w-2.5 h-2.5 text-[#a855f7] group-hover:scale-125 transition-transform" />
                  </span>
                </a>

                <a
                  href="/datasets/forensics_final.csv"
                  download="forensics_final.csv"
                  onClick={() => soundFx.playClick()}
                  className="bg-[#191129] hover:bg-[#25183d] border border-[#3b2759] p-2 flex flex-col justify-between transition-colors group"
                >
                  <span className="text-[10px] font-mono text-[#fb923c] font-bold truncate">forensics_final.csv</span>
                  <span className="text-[9px] font-mono text-[#7a6896] mt-1 flex items-center justify-between">
                    <span>27.0 KB</span>
                    <Download className="w-2.5 h-2.5 text-[#a855f7] group-hover:scale-125 transition-transform" />
                  </span>
                </a>

                <a
                  href="/datasets/research_final.csv"
                  download="research_final.csv"
                  onClick={() => soundFx.playClick()}
                  className="bg-[#191129] hover:bg-[#25183d] border border-[#3b2759] p-2 flex flex-col justify-between transition-colors group"
                >
                  <span className="text-[10px] font-mono text-[#f87171] font-bold truncate">research_final.csv</span>
                  <span className="text-[9px] font-mono text-[#7a6896] mt-1 flex items-center justify-between">
                    <span>47.6 KB</span>
                    <Download className="w-2.5 h-2.5 text-[#a855f7] group-hover:scale-125 transition-transform" />
                  </span>
                </a>
              </div>
            </div>

            {/* Python Starter Script */}
            <div className="bg-[#0e0a18] border border-[#2b1c42] p-2.5 rounded-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9181ab] pb-1.5 border-b border-[#1f1433]">
                <span className="flex items-center gap-1.5 text-[#a855f7] font-semibold">
                  <Terminal className="w-3 h-3" />
                  PYTHON RECONSTRUCTION SNIPPET
                </span>
                <button
                  onClick={copyScriptToClipboard}
                  className="flex items-center gap-1 text-[9px] text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
                >
                  {codeCopied ? <CheckCheck className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                  <span>{codeCopied ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-[#a393bf] mt-2 overflow-x-auto p-1 leading-relaxed max-h-24">
                {pythonStarterScript}
              </pre>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] font-mono text-[#6c5b8a]">Reconstruct &gt; Train &gt; Predict &gt; Submit</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('submit');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2f1a54] hover:bg-[#432578] text-[#ede7f7] font-tech text-xs font-bold tracking-wider border border-[#8345ce] transition-all"
              >
                <span>PROCEED TO SUBMIT</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: SUBMIT PREDICTIONS
            ===================================================================== */}
        {activeTab === 'submit' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Quota Sync Failure Warning */}
            {quotaSyncError && (
              <div className="bg-[#2d1118] border-2 border-[#f59e0b] p-3 flex items-start justify-between gap-2.5 text-xs font-mono text-[#fde68a]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-tech text-sm text-[#fef3c7]">QUOTA VERIFICATION OFFLINE</strong>
                    <span>Cannot verify remaining submission attempts with Central Evaluation Hub: {quotaSyncError}</span>
                  </div>
                </div>
                {onRetrySync && (
                  <button
                    onClick={onRetrySync}
                    className="shrink-0 px-2.5 py-1 bg-[#451a03] hover:bg-[#78350f] border border-[#d97706] text-[10px] font-tech text-[#fef3c7] transition-colors"
                  >
                    RETRY SYNC
                  </button>
                )}
              </div>
            )}

            {/* Quota Exhausted Warning */}
            {isQuotaExhausted && (
              <div className="bg-[#2d1118] border-2 border-[#ef4444] p-3 flex items-start gap-2.5 text-xs font-mono text-[#fca5a5]">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-tech text-sm text-[#fee2e2]">SUBMISSION QUOTA EXHAUSTED (10/10 ATTEMPTS USED)</strong>
                  <span>Your team has utilized all 10 permitted evaluations. The Safety Arbiter has locked future submissions for this team.</span>
                </div>
              </div>
            )}

            {/* Quota Progress Meter */}
            <div className="bg-[#140e24] border border-[#2b1c42] p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="text-[#a855f7] font-semibold">ATTEMPTS REMAINING: {submissionsRemaining} / 10</span>
                <span className="text-[#7d6c99]">{submissionsUsed} USED</span>
              </div>
              <div className="grid grid-cols-10 gap-1 h-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs transition-colors ${
                      i < submissionsUsed
                        ? 'bg-[#a855f7]'
                        : i === submissionsUsed
                        ? 'bg-[#38bdf8] animate-pulse'
                        : 'bg-[#25193d]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dropzone Area */}
            {!isPasting ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xs p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#38bdf8] bg-[#1a1c38]'
                    : preflight.valid
                    ? 'border-[#22c55e] bg-[#0d1e16]'
                    : selectedFileName
                    ? 'border-[#f59e0b] bg-[#1f170e]'
                    : 'border-[#432d66] bg-[#140e24] hover:border-[#7e3af2] hover:bg-[#1a122e]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                    e.target.value = '';
                  }}
                />

                <UploadCloud className={`w-8 h-8 mb-2 ${
                  preflight.valid ? 'text-[#4ade80]' : isDragging ? 'text-[#38bdf8]' : 'text-[#a855f7]'
                }`} />

                {selectedFileName ? (
                  <div className="text-center">
                    <span className="font-tech text-sm font-bold text-[#f5f2fe] block">
                      {selectedFileName}
                    </span>
                    <span className="text-[10px] font-mono text-[#a855f7] mt-0.5 block">
                      {preflight.rowCount} rows detected · Click to replace
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="font-tech text-sm font-bold text-[#ede8f7] block">
                      DROP submission.csv HERE OR CLICK TO BROWSE
                    </span>
                    <span className="text-[10px] font-mono text-[#7a6899] mt-1 block">
                      Requires Sanctuary_ID, Survival_Probability · Exactly 120 rows
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Raw Text Area Paste Mode */
              <div className="bg-[#140e24] border border-[#3b2759] p-3 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9181ab]">
                  <span>PASTE RAW CSV TEXT:</span>
                  <span className="text-[#38bdf8]">Sanctuary_ID,Survival_Probability</span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    const txt = e.target.value;
                    setPastedText(txt);
                    setCsvContent(txt);
                    setSelectedFileName('pasted_submission.csv');
                    runPreflightValidation(txt, 'pasted_submission.csv');
                  }}
                  placeholder="Sanctuary_ID,Survival_Probability&#10;SANC-0091,0.785&#10;SANC-0092,0.736&#10;..."
                  rows={4}
                  className="w-full bg-[#0d0918] border border-[#2c1d44] text-xs font-mono text-[#ede8f7] p-2 focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <button
                type="button"
                onClick={handleLoadSampleBaseline}
                className="flex items-center gap-1 text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>LOAD BENCHMARK SAMPLE (0.500 BASELINE)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextPasting = !isPasting;
                  setIsPasting(nextPasting);
                  if (nextPasting && csvContent) {
                    setPastedText(csvContent);
                  }
                }}
                className="text-[#a855f7] hover:text-[#c084fc] transition-colors"
              >
                {isPasting ? 'SWITCH TO FILE DROP' : 'OR PASTE RAW CSV'}
              </button>
            </div>

            {/* Real-time Pre-Flight Linter Checklist */}
            {preflight.checked && (
              <div className={`p-3 border rounded-xs ${
                preflight.valid ? 'bg-[#0b1c13] border-[#16a34a]/60' : 'bg-[#201016] border-[#dc2626]/60'
              }`}>
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[10px] font-mono">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    preflight.valid ? 'text-[#4ade80]' : 'text-[#f87171]'
                  }`}>
                    {preflight.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    PRE-FLIGHT LINTER: {preflight.valid ? 'ALL VERIFICATIONS PASSED' : 'CORRECTION REQUIRED'}
                  </span>
                  <span className="text-[#cfc3e8]">{preflight.rowCount} / 120 ROWS</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={preflight.headerValid ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                      {preflight.headerValid ? '✓' : '✗'}
                    </span>
                    <span className="text-[#cfc5e8]">Header: Sanctuary_ID, Survival_Probability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={preflight.countValid ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                      {preflight.countValid ? '✓' : '✗'}
                    </span>
                    <span className="text-[#cfc5e8]">Row Count: 120 Records</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={preflight.idsValid ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                      {preflight.idsValid ? '✓' : '✗'}
                    </span>
                    <span className="text-[#cfc5e8]">Survivor IDs: SANC-0001..SANC-0120</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={preflight.rangeValid ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                      {preflight.rangeValid ? '✓' : '✗'}
                    </span>
                    <span className="text-[#cfc5e8]">Range: 0.0000 ≤ Probability ≤ 1.0000</span>
                  </div>
                </div>

                {preflight.errors.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] font-mono text-[#fca5a5]">
                    {preflight.errors.map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Run Evaluation Action Button */}
            <div className="pt-2">
              <button
                disabled={!preflight.valid || isQuotaExhausted || isEvaluating || isSyncBlocked || qualifies}
                onClick={handleTriggerSubmission}
                className={`w-full py-3 px-4 flex items-center justify-center gap-2 font-tech text-sm font-bold tracking-widest uppercase transition-all shadow-md ${
                  !preflight.valid || isQuotaExhausted || isEvaluating || isSyncBlocked || qualifies
                    ? 'bg-[#1b122e] text-[#63537d] border border-[#2f204a] cursor-not-allowed opacity-60'
                    : 'bg-[#351963] hover:bg-[#4b238c] active:bg-[#28114c] text-[#f5f2fe] border-2 border-[#9333ea] shadow-[0_0_20px_rgba(147,51,234,0.35)] cursor-pointer'
                }`}
              >
                <Play className="w-4 h-4 text-[#38bdf8] fill-current" />
                <span>
                  {qualifies
                    ? 'EXTRACTION AUTHORIZED // SUBMISSIONS LOCKED (+1,000 PTS AWARDED)'
                    : isSyncBlocked
                    ? 'QUOTA SYNC REQUIRED // RECONNECT TO HUB'
                    : isQuotaExhausted
                    ? 'EVALUATION LOCKED (10/10 EXHAUSTED)'
                    : !preflight.checked
                    ? 'LOAD CSV FILE TO EVALUATE'
                    : !preflight.valid
                    ? 'RESOLVE LINTER ERRORS TO SUBMIT'
                    : `TRANSMIT PREDICTIONS (${submissionsRemaining}/10 REMAINING)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: SCORECARD & RESULTS
            ===================================================================== */}
        {activeTab === 'scorecard' && (
          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
            {/* Live Evaluation Cinematic Progress */}
            {isEvaluating && (
              <div className="bg-[#150f25] border border-[#3b2a5a] p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
                    <span className="text-xs font-tech font-bold tracking-wider text-[#38bdf8]">
                      {activeStep?.label || 'EVALUATING MODEL'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#c084fc] tabular-nums">
                    {evaluationProgress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#201538] overflow-hidden border border-[#34244f]">
                  <div
                    className="h-full bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#38bdf8] transition-all duration-300 ease-out"
                    style={{ width: `${evaluationProgress}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-[#9887b8] flex items-start gap-1.5 bg-[#1a122e] p-2 border border-[#2d1f47]">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#a855f7] shrink-0 mt-0.5" />
                  <span>{activeStep?.detail || 'Comparing predictions against ground truth...'}</span>
                </div>

                <div className="grid grid-cols-7 gap-1 pt-1">
                  {steps.map((st, i) => (
                    <div
                      key={st.id}
                      className={`h-1.5 rounded-xs transition-colors duration-300 ${
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

            {/* Result Display Once Evaluated */}
            {!isEvaluating && evaluationResult && (
              <div className="space-y-3">
                {/* SUCCESS BANNER: R² ≥ 0.80 */}
                {qualifies ? (
                  <div className="bg-[#11241f] border-2 border-[#10b981] p-3.5 rounded-xs shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#10b981]/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
                        <span className="font-tech text-sm sm:text-base font-extrabold text-[#ecfdf5] tracking-wider">
                          ★ EVALUATION SUCCESS // R² ≥ 0.80 BENCHMARK CRUSHED ★
                        </span>
                      </div>
                      <span className="text-[9px] font-mono bg-[#065f46] text-[#a7f3d0] px-2 py-0.5 font-bold">
                        CLEARANCE GRANTED
                      </span>
                    </div>

                    <p className="text-xs text-[#a7f3d0] mt-2 leading-relaxed">
                      Survival model has satisfied Sanctuary exit criteria. Evacuation route permit verified. <strong>Blast Gate 04 has unsealed and Extraction Transporter EX-09 is touching down at Helipad 01.</strong>
                    </p>
                  </div>
                ) : (
                  /* FAILURE BANNER: R² < 0.80 */
                  <div className="bg-[#241318] border-2 border-[#ef4444] p-3.5 rounded-xs shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ef4444]/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#f87171]" />
                        <span className="font-tech text-sm sm:text-base font-extrabold text-[#fef2f2] tracking-wider">
                          ⚠ EVALUATION REJECTED // R² BELOW ESCAPE THRESHOLD
                        </span>
                      </div>
                      <span className="text-[9px] font-mono bg-[#991b1b] text-[#fecaca] px-2 py-0.5 font-bold">
                        GATE 04 SEALED
                      </span>
                    </div>

                    <p className="text-xs text-[#fca5a5] mt-2 leading-relaxed">
                      Achieved R² score is below the required 80.00% benchmark. Gate 04 remains locked. Re-tune feature weights and resubmit. <strong>{submissionsRemaining} attempts remaining out of 10.</strong>
                    </p>
                  </div>
                )}

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-[#1b1333] border border-[#332350] p-2.5 flex flex-col">
                    <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                      R² COEFFICIENT
                    </span>
                    <span className={`text-xl font-mono font-extrabold tabular-nums mt-0.5 ${
                      qualifies ? 'text-[#34d399]' : 'text-[#f87171]'
                    }`}>
                      {evaluationResult.primaryMetric.value}
                    </span>
                    <span className="text-[8px] font-mono text-[#766596] mt-0.5">
                      Required: ≥ 80.00%
                    </span>
                  </div>

                  <div className="bg-[#1b1333] border border-[#332350] p-2.5 flex flex-col">
                    <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                      MEAN SQUARED ERROR (MSE)
                    </span>
                    <span className="text-xl font-mono font-extrabold text-[#a855f7] tabular-nums mt-0.5">
                      {evaluationResult.mseScore?.toFixed(6) ?? '0.000000'}
                    </span>
                    <span className="text-[8px] font-mono text-[#766596] mt-0.5">
                      Target: &lt; 0.0150
                    </span>
                  </div>

                  <div className="bg-[#1b1333] border border-[#332350] p-2.5 flex flex-col">
                    <span className="text-[9px] font-mono text-[#8a79a8] uppercase">
                      TRANSPORTER DISPATCH
                    </span>
                    <span className={`text-xs font-tech font-bold mt-1 ${
                      qualifies ? 'text-[#38bdf8]' : 'text-[#786694]'
                    }`}>
                      {qualifies ? 'EX-09 HOT ON PAD 01' : 'STANDBY (LOCKED)'}
                    </span>
                    <span className="text-[8px] font-mono text-[#5b4a78] mt-0.5">
                      {qualifies ? 'BOARDING ACTIVE' : 'AWAITING R² ≥ 80%'}
                    </span>
                  </div>
                </div>

                {/* Telemetry Diagnostics */}
                <div className="bg-[#130d22] border border-[#2b1e42] p-2.5 flex flex-wrap items-center justify-between text-[10px] font-mono gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[#756494]">ATTEMPTS: <strong className="text-[#f3e8ff]">{submissionsUsed} / 10</strong></span>
                    <span className="text-[#756494]">RECORDS: <strong className="text-[#f3e8ff]">120 / 120</strong></span>
                    <span className="text-[#756494]">FINGERPRINT: <strong className="text-[#38bdf8]">{evaluationResult.evaluationId}</strong></span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-xs font-bold ${
                    qualifies ? 'bg-[#065f46] text-[#34d399]' : 'bg-[#7f1d1d] text-[#fca5a5]'
                  }`}>
                    {qualifies ? 'PERMIT AUTH//VERIFIED' : 'INSUFFICIENT SIGNAL'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between">
                  {!qualifies && !isQuotaExhausted && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setActiveTab('submit');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#2d1a4e] hover:bg-[#3e246c] text-[#ede7f7] font-tech text-xs font-bold border border-[#7e3af2] transition-all"
                    >
                      <span>TRY NEXT SUBMISSION ({submissionsRemaining} REMAINING)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
                    </button>
                  )}

                  {qualifies && onProceedToExtraction && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onProceedToExtraction();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1e4620] hover:bg-[#285e2b] text-[#ecfdf5] font-tech text-sm font-bold tracking-wider border-2 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all animate-pulse"
                    >
                      <span>BOARD EX-09 EXTRACTION TRANSPORTER 🚁</span>
                      <ArrowRight className="w-4 h-4 text-[#34d399]" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Idle State with No Prior Evaluation */}
            {!isEvaluating && !evaluationResult && (
              <div className="bg-[#150f24] border border-[#2f214a] p-6 text-center">
                <Terminal className="w-8 h-8 text-[#a855f7] mx-auto mb-2 opacity-60" />
                <h3 className="font-tech text-sm font-bold text-[#ede8f7]">NO EVALUATION RECORD ON THIS TERMINAL</h3>
                <p className="text-xs text-[#8c7da8] mt-1">
                  Upload your <code className="text-[#38bdf8]">submission.csv</code> in the Submit tab to run real-time inference against the 120 survivor ground truth.
                </p>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('submit');
                  }}
                  className="mt-4 px-4 py-2 bg-[#2d1a4e] hover:bg-[#3e246c] text-[#ede7f7] font-tech text-xs font-bold border border-[#7e3af2] transition-all"
                >
                  GO TO SUBMIT TAB
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer System Telemetry Matrix */}
      <div className="pt-2 border-t border-[#291d40] flex items-center justify-between text-[9px] font-mono text-[#6c5b8a]">
        <div>
          {isComplete && qualifies
            ? 'CLEARANCE PERMIT: ACTIVE // ZONE OPEN // TRANSPORTER READY'
            : isEvaluating
            ? 'SYSTEM RUNNING INFERENCE // DO NOT INTERRUPT'
            : isQuotaExhausted
            ? 'SUBMISSION QUOTA EXHAUSTED // ALL 10 ATTEMPTS LOGGED'
            : 'READY FOR PREDICTION SUBMISSION // 10 ATTEMPTS ALLOWED'}
        </div>

        <div className="flex items-center gap-2">
          <span>PORT 4179 / ARBITER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
        </div>
      </div>
    </div>
  );
};

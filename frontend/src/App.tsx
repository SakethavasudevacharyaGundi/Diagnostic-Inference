import { useState, useRef, useCallback } from "react";
import SpecularButton from "./components/SpecularButton";
import { analyzeLabs } from "./services/api.js";

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons = {
  Dna: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6" /><path d="M9 22c1.798-3.333 5.518-3.333 7-6" />
      <path d="M2 9c6.667-6 13.333 0 20-6" /><path d="M15 2c-1.798 3.333-5.518 3.333-7 6" />
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Beaker: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v8l4.5 7.5A1 1 0 0118.63 20H5.37a1 1 0 01-.87-1.5L9 11V3z" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m13.16 13.16l.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Spinner: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M12 2v4" strokeOpacity="1" /><path d="M12 18v4" strokeOpacity=".25" /><path d="M4.93 4.93l2.83 2.83" strokeOpacity=".75" /><path d="M16.24 16.24l2.83 2.83" strokeOpacity=".25" /><path d="M2 12h4" strokeOpacity=".5" /><path d="M18 12h4" strokeOpacity=".25" /><path d="M4.93 19.07l2.83-2.83" strokeOpacity=".25" /><path d="M16.24 7.76l2.83-2.83" strokeOpacity=".5" />
    </svg>
  ),
  RotateCcw: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-5.24" />
    </svg>
  ),
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "CRITICAL" | "WARNING" | "NORMAL" | "UNKNOWN" | "INVALID";
type Source = "LOCAL" | "MCP" | "N/A";
type AppState = "idle" | "analyzing" | "results";

interface LabRow { id: string; testName: string; value: string; unit: string; }
interface ReferenceRange { low: number; high: number; unit: string; source: Source; }
interface AnalysisResult {
  id: string; testName: string; value: number | null; rawValue: string; unit: string;
  severity: Severity; range: ReferenceRange | null;
  explanation: string; nextStep: string; knowledgeSources: string[];
}

// ─── Reference data ───────────────────────────────────────────────────────────

const LOCAL: Record<string, ReferenceRange> = {
  hemoglobin: { low: 12.0, high: 16.0, unit: "g/dL", source: "LOCAL" },
  platelet: { low: 150, high: 450, unit: "×10³/µL", source: "LOCAL" },
  "platelet count": { low: 150, high: 450, unit: "×10³/µL", source: "LOCAL" },
  ferritin: { low: 12, high: 150, unit: "ng/mL", source: "LOCAL" },
  wbc: { low: 4.5, high: 11.0, unit: "×10³/µL", source: "LOCAL" },
  "white blood cell": { low: 4.5, high: 11.0, unit: "×10³/µL", source: "LOCAL" },
  glucose: { low: 70, high: 100, unit: "mg/dL", source: "LOCAL" },
  creatinine: { low: 0.6, high: 1.2, unit: "mg/dL", source: "LOCAL" },
  sodium: { low: 136, high: 145, unit: "mEq/L", source: "LOCAL" },
};
const MCP: Record<string, ReferenceRange> = {
  potassium: { low: 3.5, high: 5.0, unit: "mEq/L", source: "MCP" },
  chloride: { low: 98, high: 106, unit: "mEq/L", source: "MCP" },
  bicarbonate: { low: 22, high: 29, unit: "mEq/L", source: "MCP" },
  albumin: { low: 3.5, high: 5.0, unit: "g/dL", source: "MCP" },
  bilirubin: { low: 0.2, high: 1.2, unit: "mg/dL", source: "MCP" },
  alt: { low: 7, high: 56, unit: "U/L", source: "MCP" },
  ast: { low: 10, high: 40, unit: "U/L", source: "MCP" },
  tsh: { low: 0.4, high: 4.0, unit: "mIU/L", source: "MCP" },
  calcium: { low: 8.5, high: 10.5, unit: "mg/dL", source: "MCP" },
  hba1c: { low: 0, high: 5.7, unit: "%", source: "MCP" },
};

const TEST_METADATA: Record<string, string> = {
  "Ferritin": "ug/L",
  "Glikozile Hemoglobin (HbA1c)": "%",
  "Total IgE": "KU/L",
  "Insulin": "mU/L",
  "Serbest T4": "ng/dL",
  "Platelet": "10^3/uL",
  "WBC": "10^3/uL",
  "Hemoglobin": "g/dL",
  "Eritrosit": "10^6/uL",
  "RDW-SD": "fL",
  "RDW": "%",
  "PDW": "fL",
  "PCT": "%",
  "Nötrofil%": "%",
  "Monosit%": "%",
  "Lenfosit%": "%",
  "Hematokrit": "%"
};

const KNOWN_TESTS = Object.keys(TEST_METADATA);

const KNOWLEDGE: Record<string, string[]> = {
  hemoglobin: ["Hematology Reference Manual, 4th Ed.", "CLSI H26-A2"],
  platelet: ["Hematology Reference Manual, 4th Ed.", "Williams Hematology, 9th Ed."],
  potassium: ["Electrolyte Physiology Reference", "Clinical Chemistry Standards Vol. 3"],
  ferritin: ["Iron Studies Reference Handbook", "CLSI C28-A3"],
  wbc: ["Hematology Reference Manual, 4th Ed.", "Leukocyte Classification Guide"],
  glucose: ["ADA Standards of Care 2024", "Clinical Chemistry Standards Vol. 3"],
  default: ["Clinical Laboratory Reference Handbook", "Standard Laboratory Values, 12th Ed."],
};

const SEV_ORDER: Severity[] = ["CRITICAL", "WARNING", "INVALID", "UNKNOWN", "NORMAL"];

// ─── Severity styles ──────────────────────────────────────────────────────────

const S: Record<Severity, {
  label: string; dot: string;
  badgeBg: string; badgeBorder: string; badgeText: string;
  headerGrad: string; headerText: string;
  listActiveBg: string; listActiveBorder: string;
  sourceBg: string; sourceBorder: string; sourceText: string;
}> = {
  CRITICAL: {
    label: "Critical", dot: "#ef4444",
    badgeBg: "rgba(254,226,226,0.9)", badgeBorder: "rgba(252,165,165,0.7)", badgeText: "#dc2626",
    headerGrad: "linear-gradient(135deg, #991b1b 0%, #dc2626 60%, #ef4444 100%)", headerText: "#fff",
    listActiveBg: "rgba(254,242,242,0.9)", listActiveBorder: "#fca5a5",
    sourceBg: "rgba(8,145,178,0.08)", sourceBorder: "rgba(8,145,178,0.2)", sourceText: "#0891b2",
  },
  WARNING: {
    label: "Warning", dot: "#f59e0b",
    badgeBg: "rgba(254,243,199,0.9)", badgeBorder: "rgba(252,211,77,0.6)", badgeText: "#b45309",
    headerGrad: "linear-gradient(135deg, #92400e 0%, #d97706 60%, #f59e0b 100%)", headerText: "#fff",
    listActiveBg: "rgba(255,251,235,0.9)", listActiveBorder: "#fcd34d",
    sourceBg: "rgba(8,145,178,0.08)", sourceBorder: "rgba(8,145,178,0.2)", sourceText: "#0891b2",
  },
  NORMAL: {
    label: "Normal", dot: "#10b981",
    badgeBg: "rgba(209,250,229,0.9)", badgeBorder: "rgba(110,231,183,0.6)", badgeText: "#047857",
    headerGrad: "linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)", headerText: "#fff",
    listActiveBg: "rgba(236,253,245,0.9)", listActiveBorder: "#6ee7b7",
    sourceBg: "rgba(8,145,178,0.08)", sourceBorder: "rgba(8,145,178,0.2)", sourceText: "#0891b2",
  },
  UNKNOWN: {
    label: "Unknown", dot: "#94a3b8",
    badgeBg: "rgba(226,232,240,0.9)", badgeBorder: "rgba(148,163,184,0.5)", badgeText: "#475569",
    headerGrad: "linear-gradient(135deg, #1e293b 0%, #334155 60%, #475569 100%)", headerText: "#fff",
    listActiveBg: "rgba(241,245,249,0.9)", listActiveBorder: "#cbd5e1",
    sourceBg: "rgba(8,145,178,0.08)", sourceBorder: "rgba(8,145,178,0.2)", sourceText: "#0891b2",
  },
  INVALID: {
    label: "Invalid", dot: "#f97316",
    badgeBg: "rgba(255,237,213,0.9)", badgeBorder: "rgba(253,186,116,0.6)", badgeText: "#c2410c",
    headerGrad: "linear-gradient(135deg, #9a3412 0%, #ea580c 60%, #f97316 100%)", headerText: "#fff",
    listActiveBg: "rgba(255,247,237,0.9)", listActiveBorder: "#fdba74",
    sourceBg: "rgba(8,145,178,0.08)", sourceBorder: "rgba(8,145,178,0.2)", sourceText: "#0891b2",
  },
};

// ─── Classification ───────────────────────────────────────────────────────────

function getRef(name: string) {
  const k = name.trim().toLowerCase();
  return LOCAL[k] ?? MCP[k] ?? null;
}
function classify(v: number, r: ReferenceRange): Severity {
  const span = r.high - r.low;
  if (v < r.low) return (r.low - v) / span > 0.3 ? "CRITICAL" : "WARNING";
  if (v > r.high) return (v - r.high) / span > 0.3 ? "CRITICAL" : "WARNING";
  return "NORMAL";
}
function buildExplanation(name: string, v: number, sev: Severity, r: ReferenceRange) {
  if (sev === "NORMAL") return `${name} at ${v} ${r.unit} sits within the reference interval of ${r.low}–${r.high} ${r.unit}. No clinically significant deviation is indicated.`;
  const dir = v < r.low ? "below" : "above";
  const deg = sev === "CRITICAL" ? "substantially" : "mildly";
  return `${name} at ${v} ${r.unit} is ${deg} ${dir} the reference interval of ${r.low}–${r.high} ${r.unit}.${sev === "CRITICAL" ? " This degree of deviation is clinically significant and warrants prompt evaluation." : " Clinical correlation with the patient's presentation is recommended."}`;
}
function buildNextStep(name: string, sev: Severity, v: number, r: ReferenceRange) {
  const k = name.toLowerCase();
  if (sev === "NORMAL") return "No immediate action required. Continue routine monitoring per clinical protocol.";
  if (sev === "CRITICAL" && v < r.low) {
    if (k === "hemoglobin") return "Repeat CBC to confirm. Assess for active blood loss, hemolysis, or nutritional deficiency. Evaluate transfusion threshold and consider hematology referral.";
    if (k === "platelet" || k === "platelet count") return "Repeat CBC to confirm thrombocytopenia. Evaluate bleeding risk and marrow function. Hematology referral warranted.";
    if (k === "potassium") return "Urgent ECG monitoring. Assess for diuretic use or GI losses. Potassium replacement and cardiology notification as indicated.";
    return `Urgent clinical review. Repeat ${name} to confirm and investigate underlying cause.`;
  }
  if (sev === "CRITICAL" && v > r.high) {
    if (k === "potassium") return "Urgent hyperkalemia assessment. ECG monitoring, evaluate renal function and medication list. Nephrology consultation as indicated.";
    return `Urgent review recommended. Repeat ${name} and assess for underlying pathology.`;
  }
  return `Repeat ${name} and correlate with clinical findings. Consider further evaluation if the result persists.`;
}
function analyzeRow(row: LabRow): AnalysisResult {
  const num = parseFloat(row.value);
  const k = row.testName.trim().toLowerCase();
  if (!row.value.trim() || isNaN(num) || num < 0)
    return {
      id: row.id, testName: row.testName || "Unknown", value: isNaN(num) ? null : num, rawValue: row.value, unit: row.unit,
      severity: "INVALID", range: null,
      explanation: "The supplied value is not a valid clinical measurement. Negative or non-numeric values cannot be classified against a reference interval.",
      nextStep: "Verify the entered value and unit, then re-submit for analysis.", knowledgeSources: []
    };
  const range = getRef(row.testName);
  if (!range)
    return {
      id: row.id, testName: row.testName, value: num, rawValue: row.value, unit: row.unit,
      severity: "UNKNOWN", range: null,
      explanation: "No reference interval is available for this test in the local dictionary or MCP knowledge base. The result cannot be classified without a valid reference range.",
      nextStep: "Verify the test name against standard laboratory nomenclature. Provide a reference range manually if available.", knowledgeSources: []
    };
  const sev = classify(num, range);
  return {
    id: row.id, testName: row.testName, value: num, rawValue: row.value, unit: row.unit,
    severity: sev, range,
    explanation: buildExplanation(row.testName, num, sev, range),
    nextStep: buildNextStep(row.testName, sev, num, range),
    knowledgeSources: KNOWLEDGE[k] ?? KNOWLEDGE["default"]
  };
}

// ─── Shared badge ─────────────────────────────────────────────────────────────

function SeverityBadge({ sev, small }: { sev: Severity; small?: boolean }) {
  const s = S[sev];
  return (
    <span style={{ background: s.badgeBg, border: `1px solid ${s.badgeBorder}`, color: s.badgeText }}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-widest uppercase ${small ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}`}>
      <span style={{ background: s.dot }} className="w-1.5 h-1.5 rounded-full shrink-0" />
      {s.label}
    </span>
  );
}

function SourceTag({ source }: { source: Source }) {
  if (source === "MCP") {
    return (
      <span style={{ background: "rgba(237,233,254,0.9)", border: "1px solid rgba(167,139,250,0.6)", color: "#6d28d9" }}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase">
        <span style={{ background: "#8b5cf6" }} className="w-1.5 h-1.5 rounded-full shrink-0" />
        Source: MCP
      </span>
    );
  }
  if (source === "LOCAL") {
    return (
      <span style={{ background: "rgba(207,250,254,0.9)", border: "1px solid rgba(103,232,249,0.6)", color: "#0e7490" }}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase">
        <span style={{ background: "#06b6d4" }} className="w-1.5 h-1.5 rounded-full shrink-0" />
        Source: Local
      </span>
    );
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase font-mono" style={{ background: "rgba(148,163,184,0.15)", border: "1px solid rgba(148,163,184,0.3)", color: "#64748b" }}>N/A</span>;
}

// ─── Range bar ────────────────────────────────────────────────────────────────

function RangeBar({ value, range }: { value: number; range: ReferenceRange }) {
  const span = range.high - range.low;
  // Ensure the dot always fits on the line by dynamically expanding the bounds
  const minDisplay = Math.min(range.low - span * 0.3, value - span * 0.15);
  const maxDisplay = Math.max(range.high + span * 0.3, value + span * 0.15);
  const tot = maxDisplay - minDisplay;

  const pct = Math.max(0, Math.min(100, ((value - minDisplay) / tot) * 100));
  const inR = value >= range.low && value <= range.high;

  const nL = ((range.low - minDisplay) / tot) * 100;
  const nW = (span / tot) * 100;

  return (
    <div className="pt-5 pb-1">
      <div className="relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
        {/* Reference interval segment */}
        <div className="absolute top-0 h-full rounded-full" style={{ left: `${nL}%`, width: `${nW}%`, background: "rgba(255,255,255,0.35)" }} />

        {/* Value dot and label */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 z-10 shadow"
          style={{ left: `${pct}%`, background: inR ? "#fff" : "#fecaca", borderColor: "rgba(255,255,255,0.5)" }}>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,1)" }}>
            {value}
          </div>
        </div>

        {/* Label for range.low */}
        <div className="absolute top-3 -translate-x-1/2 text-[10px] font-mono" style={{ left: `${nL}%`, color: "rgba(255,255,255,0.6)" }}>
          {range.low}
        </div>

        {/* Label for range.high */}
        <div className="absolute top-3 -translate-x-1/2 text-[10px] font-mono" style={{ left: `${nL + nW}%`, color: "rgba(255,255,255,0.6)" }}>
          {range.high}
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>reference interval</span>
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ result }: { result: AnalysisResult }) {
  const s = S[result.severity];
  return (
    <div className="rounded-2xl overflow-hidden animate-fade-up"
      style={{ background: "rgba(255,255,255,0.52)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.82)", boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}>

      {/* Strong color header */}
      <div className="px-7 py-6" style={{ background: s.headerGrad }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Result</p>
            <h2 className="text-2xl font-bold" style={{ color: s.headerText }}>{result.testName}</h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SeverityBadge sev={result.severity} />
            {result.range && (
              <SourceTag source={result.range.source} />
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold font-mono" style={{ color: s.headerText }}>
            {result.value !== null ? result.value : result.rawValue}
          </span>
          <span className="text-lg font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{result.unit || "—"}</span>
        </div>

        {result.range && (
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Reference Range</p>
              <p className="text-sm font-mono font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{result.range.low} – {result.range.high} {result.range.unit}</p>
            </div>
          </div>

        )}

        {result.range && result.value !== null && <RangeBar value={result.value} range={result.range} />}
      </div>

      {/* Body */}
      <div className="px-7 py-6 space-y-5" style={{ background: "rgba(255,255,255,0.18)" }}>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#94a3b8" }}>Explanation</p>
          <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{result.explanation}</p>
        </div>

        <div style={{ borderTop: "1px solid rgba(203,213,225,0.5)" }} className="pt-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#94a3b8" }}>Recommended Action</p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: "#1e293b" }}>{result.nextStep}</p>
        </div>

        {result.knowledgeSources.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(203,213,225,0.5)" }} className="pt-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#94a3b8" }}>Knowledge Sources</p>
            <div className="space-y-1.5">
              {result.knowledgeSources.map(src => (
                <div key={src} className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                  <span className="text-emerald-500"><Icons.Check /></span>{src}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results layout ───────────────────────────────────────────────────────────

function ResultsLayout({ results }: { results: AnalysisResult[] }) {
  const [selectedId, setSelectedId] = useState(results[0]?.id ?? "");
  const active = results.find(r => r.id === selectedId) ?? results[0];

  return (
    <div className="flex h-full animate-fade-in">

      {/* ── Left list ── */}
      <div className="w-72 shrink-0 px-5 py-6 overflow-y-auto glass-scrollbar"
        style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.4)",
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}>
        {/* Header */}
        <div className="mb-6 px-1 shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#64748b" }}>Results</p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: "#1e293b" }}>{results.length} test{results.length !== 1 ? "s" : ""} · ranked by criticality</p>
        </div>

        {/* List — individual separated cards */}
        <div className="space-y-3 pb-8">
          {results.map((r) => {
            const isActive = r.id === selectedId;
            return (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className="w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 block border"
                style={{
                  background: isActive ? S[r.severity].listActiveBg : "rgba(255,255,255,0.45)",
                  borderColor: isActive ? S[r.severity].listActiveBorder : "rgba(255,255,255,0.6)",
                  boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)"
                }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold truncate" style={{ color: isActive ? "#0f172a" : "#334155" }}>
                    {r.testName}
                  </span>
                  <SeverityBadge sev={r.severity} small />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold" style={{ color: S[r.severity].badgeText }}>
                    {r.value !== null ? r.value : r.rawValue}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{r.unit}</span>
                  {r.range && (
                    <>
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      <span className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>{r.range.low}–{r.range.high}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SEV_ORDER.filter(sev => results.some(r => r.severity === sev)).map(sev => {
            const n = results.filter(r => r.severity === sev).length;
            return (
              <span key={sev} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                style={{ background: S[sev].badgeBg, border: `1px solid ${S[sev].badgeBorder}`, color: S[sev].badgeText }}>
                {n} {S[sev].label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Right detail ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6"
        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        {active && <DetailPanel key={active.id} result={active} />}
      </div>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => `r${++_id}`;
const emptyRow = (): LabRow => ({ id: uid(), testName: "", value: "", unit: "" });
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

type Step = "ranges" | "classifying" | "explaining";
const STEPS: Array<{ key: Step; label: string }> = [
  { key: "ranges", label: "Resolving reference ranges" },
  { key: "classifying", label: "Classifying results" },
  { key: "explaining", label: "Generating clinical guidance" },
];

function parseCSV(text: string): Partial<LabRow>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  const start = lines[0].toLowerCase().includes("test") ? 1 : 0;
  return lines.slice(start).map(line => {
    const p = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
    return { testName: p[0] ?? "", value: p[1] ?? "", unit: p[2] ?? "" };
  }).filter(r => r.testName);
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [rows, setRows] = useState<LabRow[]>([emptyRow()]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [step, setStep] = useState<Step | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateRow = (id: string, f: keyof LabRow, v: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, [f]: v };
      if (f === "testName" && TEST_METADATA[v]) {
        next.unit = TEST_METADATA[v];
      }
      return next;
    }));
  };
  const addRow = () => setRows(prev => [...prev, emptyRow()]);
  const removeRow = (id: string) =>
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);

  const loadCSV = useCallback((text: string) => {
    const parsed = parseCSV(text);
    if (parsed.length) setRows(parsed.map(p => ({ id: uid(), testName: p.testName ?? "", value: p.value ?? "", unit: p.unit ?? "" })));
  }, []);

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = e => loadCSV(e.target?.result as string);
    r.readAsText(file);
  };

  const handleAnalyze = async () => {
    const valid = rows.filter(r => r.testName.trim() || r.value.trim());
    if (!valid.length) return;
    setAppState("analyzing");
    setStep("ranges");

    try {
      const payload = valid.map(r => ({
        test_name: r.testName,
        value: parseFloat(r.value) || 0,
        unit: r.unit
      }));

      let isDone = false;
      // Cycle through the loading steps while the backend processes
      const loadingSequence = async () => {
        await delay(1500);
        if (!isDone) setStep("classifying");
        await delay(2000);
        if (!isDone) setStep("explaining");
      };
      loadingSequence();

      const response = await analyzeLabs(payload);
      isDone = true;
      const data = response.results || response;

      const mappedResults: AnalysisResult[] = data.map((r: any, i: number) => {
        return {
          id: "mapped" + i,
          testName: r.test_name,
          value: r.value,
          rawValue: String(r.value),
          unit: r.unit,
          severity: r.status.toUpperCase() as Severity,
          range: r.ref ? { low: r.ref.min, high: r.ref.max, unit: r.ref.unit, source: r.reference_source === 'MCP' ? 'MCP' : 'LOCAL' } : null,
          explanation: r.explanation,
          nextStep: r.next_step,
          knowledgeSources: []
        };
      });

      setResults(mappedResults);
      setStep(null);
      setAppState("results");
    } catch (err) {
      console.error(err);
      setAppState("idle");
    }
  };

  const stepIdx = STEPS.findIndex(s => s.key === step);
  const isAnalyzing = appState === "analyzing";

  // ── Render ──

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* Floating navbar */}
      <nav className="fixed top-4 left-1/2 z-30 flex items-center justify-between px-5 h-14"
        style={{
          transform: "translateX(-50%)",
          width: "min(calc(100vw - 32px), 900px)",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.82)",
          borderRadius: "20px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
        }}>

        {/* Left — back button (results only) or spacer */}
        <div className="w-24 flex items-center">
          {appState === "results" && (
            <button
              onClick={() => { setAppState("idle"); setResults([]); }}
              className="flex items-center gap-1.5 text-xs font-medium transition-all group"
              style={{ color: "#64748b" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")}
              onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:-translate-x-0.5 transition-transform">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          )}
        </div>

        {/* Center — brand */}
        <button
          onClick={() => { setAppState("idle"); setResults([]); }}
          className="flex items-center gap-2.5 group"
        >
          <img src="/logo.png" alt="logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1 }}
            className="group-hover:opacity-80 transition-opacity">
            Diagnostic Inference
          </span>
        </button>

        {/* Right — spacer (mirrors left) */}
        <div className="w-24" />
      </nav>

      {/* Body — padded below floating nav */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0, paddingTop: "80px" }}>

        {/* ── Results layout ── */}
        {appState === "results" && (
          <ResultsLayout results={results} />
        )}

        {/* ── Idle / Analyzing ── */}
        {appState !== "results" && (
          <div className="h-full overflow-y-auto flex items-start justify-center py-12 px-6">
            <div className="w-full max-w-lg space-y-4">

              {/* Input card */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.82)", boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)" }}>

                <div className="px-6 pt-6 pb-2 border-b" style={{ borderColor: "rgba(203,213,225,0.3)" }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#94a3b8" }}>Configuration</p>
                  <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>Enter Lab Results</h2>
                </div>

                <div className="px-6 pt-4 pb-2">
                  {/* CSV drop */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) handleFile(f); }}
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer rounded-xl mb-4 flex items-center gap-3 px-4 py-3 transition-all duration-200"
                    style={{ border: `1.5px dashed ${dragging ? "#0891b2" : "rgba(8,145,178,0.2)"}`, background: dragging ? "rgba(8,145,178,0.05)" : "rgba(248,250,252,0.5)" }}>
                    <span style={{ color: dragging ? "#0891b2" : "#94a3b8" }}><Icons.Upload /></span>
                    <div>
                      <p className="text-xs font-medium" style={{ color: dragging ? "#0891b2" : "#64748b" }}>Drop CSV or click to upload</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>Format: TestName, Value, Unit</p>
                    </div>
                    <input ref={fileRef} type="file" accept=".csv" className="hidden"
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>

                  {/* Col headers */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_20px] gap-2.5 mb-2 pr-2">
                    {["Test Name", "Value", "Unit", ""].map(h => (
                      <p key={h} className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#94a3b8" }}>{h}</p>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "400px" }}>
                    {rows.map(row => (
                      <div key={row.id} className="grid grid-cols-[2fr_1fr_1fr_20px] gap-2.5 items-center">
                        <div>
                          <input list={`tl-${row.id}`} value={row.testName}
                            onChange={e => updateRow(row.id, "testName", e.target.value)}
                            placeholder="e.g. Hemoglobin"
                            className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all"
                            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(203,213,225,0.7)", color: "#0f172a", caretColor: "#0891b2" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#0891b2")}
                            onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,213,225,0.7)")} />
                          <datalist id={`tl-${row.id}`}>{KNOWN_TESTS.map(t => <option key={t} value={t} />)}</datalist>
                        </div>
                        <input type="number" value={row.value} onChange={e => updateRow(row.id, "value", e.target.value)}
                          placeholder="0.0"
                          className="w-full px-3 py-2 text-sm rounded-lg outline-none font-mono transition-all"
                          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(203,213,225,0.7)", color: "#0f172a", caretColor: "#0891b2" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#0891b2")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,213,225,0.7)")} />
                        <input type="text" value={row.unit} onChange={e => updateRow(row.id, "unit", e.target.value)}
                          placeholder="g/dL"
                          className="w-full px-3 py-2 text-sm rounded-lg outline-none font-mono transition-all"
                          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(203,213,225,0.7)", color: "#0f172a", caretColor: "#0891b2" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#0891b2")}
                          onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,213,225,0.7)")} />
                        <button onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                          className="w-5 h-5 flex items-center justify-center rounded transition-all disabled:opacity-0"
                          style={{ color: "#cbd5e1" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}>
                          <Icons.X />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={addRow} className="flex items-center gap-2 text-xs transition-colors"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#0891b2")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                      <span className="w-5 h-5 rounded border flex items-center justify-center" style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}>
                        <Icons.Plus />
                      </span>
                      Add result
                    </button>

                    <button onClick={() => setRows([emptyRow()])} className="flex items-center gap-2 text-xs transition-colors"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                      <span className="w-5 h-5 rounded border flex items-center justify-center" style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}>
                        <Icons.RotateCcw />
                      </span>
                      Clear all
                    </button>
                  </div>

                  <button
                    disabled={isAnalyzing}
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-800"
                    style={{
                      background: "#0f172a",
                      boxShadow: "0 4px 16px rgba(15,23,42,0.28), 0 1px 3px rgba(0,0,0,0.12)",
                    }}
                  >
                    {isAnalyzing
                      ? <><Icons.Spinner /><span>Analyzing…</span></>
                      : <><Icons.Beaker /><span>Analyze Results</span><Icons.ArrowRight /></>
                    }
                  </button>
                </div>
              </div>

              {/* Processing steps */}
              {isAnalyzing && (
                <div className="rounded-2xl px-5 py-4 space-y-3 animate-fade-in"
                  style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.75)" }}>
                  {STEPS.map((s, i) => {
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                          style={{ background: done ? "#10b981" : active ? "rgba(8,145,178,0.1)" : "rgba(203,213,225,0.3)", border: `1px solid ${done ? "#10b981" : active ? "#0891b2" : "#e2e8f0"}` }}>
                          {done ? <span style={{ color: "white" }}><Icons.Check /></span>
                            : active ? <Icons.Spinner />
                              : <span className="w-1 h-1 rounded-full" style={{ background: "#cbd5e1" }} />}
                        </div>
                        <span className="text-xs" style={{ color: done ? "#94a3b8" : active ? "#0f172a" : "#cbd5e1", fontWeight: active ? 500 : 400, textDecoration: done ? "line-through" : "none" }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

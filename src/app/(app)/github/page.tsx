"use client";
import { useState } from "react";
import {
  GitBranch,
  Webhook,
  CheckCircle2,
  XCircle,
  Play,
  AlertTriangle,
  GitMerge,
  MessageSquare,
  Shield,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

const WEBHOOK_PAYLOAD = JSON.stringify(
  {
    action: "opened",
    number: 142,
    pull_request: {
      number: 142,
      title: "feat: AI-generated ProductCard with DB integration",
      user: { login: "cursor-ai[bot]" },
      head: { ref: "feat/ai-product-card" },
      base: { ref: "main" },
    },
    repository: {
      full_name: "acme-corp/ecommerce-platform",
    },
  },
  null,
  2
);

const VIBESHIFT_COMMENT = `## 🛡️ VibeShift Analysis — PR #142

**Integrity Score: 23/100** · Decision: 🔴 **NO-GO — Merge Blocked**

---

### Critical Violations (3)
| Severity | Rule | File | Line |
|----------|------|------|------|
| 🔴 CRITICAL | \`NO_DB_IN_UI\` | \`ProductCard.tsx\` | 8 |
| 🔴 CRITICAL | \`NO_HALLUCINATED_PACKAGES\` | \`ProductCard.tsx\` | 3 |
| 🔴 CRITICAL | \`NO_SQL_INJECTION\` | \`ProductCard.tsx\` | 24 |
| 🟠 HIGH | \`USE_API_CLIENT\` | \`ProductCard.tsx\` | 17 |
| 🟠 HIGH | \`REQUIRE_UNIT_TESTS\` | \`ProductCard.test.tsx\` | 1 |
| 🟡 MEDIUM | \`NO_CONSOLE_LOG\` | \`ProductCard.tsx\` | 19 |

### Agents Summary
- **Pattern Drift**: 3 violations (2847ms)
- **Security Sentinel**: 1 violation — SQL injection CWE-89 (3412ms)  
- **Dependency Guardian**: 1 hallucinated package (1923ms)
- **Test Gap Finder**: 1 untested component, coverage -13% (2201ms)

### Auto-Fix Available
Run \`vibeshift fix pr-142\` or click **Apply Fixes** in the VibeShift dashboard.

---
*Powered by [VibeShift](https://vibeshift.dev) — IBM Bob 2.0 × Granite AI*`;

type SimStep = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "running" | "done" | "error";
  icon: React.ElementType;
  color: string;
};

const INITIAL_STEPS: SimStep[] = [
  {
    id: "webhook",
    label: "Webhook Received",
    description: "GitHub sends PR event to VibeShift endpoint",
    status: "pending",
    icon: Webhook,
    color: "text-indigo-400",
  },
  {
    id: "dna",
    label: "Project DNA Loaded",
    description: "Extracting rules from ARCHITECTURE.md + CONTRIBUTING.md",
    status: "pending",
    icon: Shield,
    color: "text-purple-400",
  },
  {
    id: "agents",
    label: "4 Agents Spawned",
    description: "Pattern Drift · Security · Dependency · Test Gap running in parallel",
    status: "pending",
    icon: GitBranch,
    color: "text-yellow-400",
  },
  {
    id: "decision",
    label: "Decision Computed",
    description: "Score: 23/100 — NO-GO · 3 critical violations",
    status: "pending",
    icon: XCircle,
    color: "text-red-400",
  },
  {
    id: "comment",
    label: "PR Comment Posted",
    description: "VibeShift posts inline comment with full analysis",
    status: "pending",
    icon: MessageSquare,
    color: "text-blue-400",
  },
  {
    id: "status",
    label: "Status Check Updated",
    description: "GitHub status: vibeshift/integrity — FAILED",
    status: "pending",
    icon: CheckCircle2,
    color: "text-red-400",
  },
  {
    id: "block",
    label: "Merge Blocked",
    description: "Branch protection rule prevents merge until score ≥ 70",
    status: "pending",
    icon: GitMerge,
    color: "text-red-400",
  },
];

export default function GitHubIntegrationPage() {
  const [steps, setSteps] = useState<SimStep[]>(INITIAL_STEPS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const runSimulation = async () => {
    setRunning(true);
    setDone(false);
    const reset = INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as const }));
    setSteps(reset);

    for (let i = 0; i < reset.length; i++) {
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: i === 5 ? "error" : "done" } : s
        )
      );
    }
    setRunning(false);
    setDone(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">GitHub Integration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Webhook simulation · PR status checks · Merge blocking
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
        >
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {running ? "Simulating..." : "Run Simulation"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Simulation timeline */}
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Webhook className="w-3.5 h-3.5 text-slate-400" />
            Event Flow Simulation
          </h2>
          <div className="space-y-1">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex gap-3 relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-[#1e1e2e]" />
                  )}
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      step.status === "done"
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : step.status === "error"
                        ? "border-red-500/40 bg-red-500/10"
                        : step.status === "running"
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-[#2a2a3e] bg-[#0f0f1a]"
                    }`}
                  >
                    {step.status === "running" ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    ) : step.status === "done" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : step.status === "error" ? (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 flex-1">
                    <div className={`text-xs font-semibold mb-0.5 ${step.status !== "pending" ? step.color : "text-slate-500"}`}>
                      {step.label}
                    </div>
                    <div className="text-[11px] text-slate-500">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {done && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-xs text-red-300">
                Merge blocked. PR must reach score ≥ 70 to pass branch protection.
              </span>
            </div>
          )}
        </div>

        {/* Webhook payload + Comment preview */}
        <div className="space-y-4">
          {/* Webhook Payload */}
          <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5 text-indigo-400" />
                Incoming Webhook Payload
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(WEBHOOK_PAYLOAD);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-400 overflow-auto max-h-48">
              {WEBHOOK_PAYLOAD}
            </pre>
          </div>

          {/* PR Comment Preview */}
          <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e1e2e]">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300">Auto-Posted PR Comment</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-400 overflow-auto max-h-64 whitespace-pre-wrap">
              {VIBESHIFT_COMMENT}
            </pre>
          </div>

          {/* Status Check */}
          <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              GitHub Status Checks
            </h3>
            <div className="space-y-2">
              {[
                { name: "vibeshift/integrity", status: "FAILED", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
                { name: "vibeshift/security", status: "FAILED", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
                { name: "ci/tests", status: "PASSED", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
                { name: "ci/build", status: "PASSED", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
              ].map((check) => (
                <div
                  key={check.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border ${check.border} ${check.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <check.icon className={`w-3.5 h-3.5 ${check.color}`} />
                    <span className="text-xs font-mono text-slate-300">{check.name}</span>
                  </div>
                  <span className={`text-[11px] font-bold ${check.color}`}>{check.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <GitMerge className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300 font-semibold">Merge blocked</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Required status check <code className="text-red-400">vibeshift/integrity</code> has not passed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


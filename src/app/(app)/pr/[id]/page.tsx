"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  ChevronRight,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Wand2,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Minus,
  Info,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { MOCK_PULL_REQUESTS, MOCK_PROJECT_DNA } from "@/mock-data";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, getSeverityColor } from "@/lib/utils";
import type { Violation } from "@/lib/types";

// GitHub-style diff renderer
function DiffLine({ line, lineNo }: { line: string; lineNo: number }) {
  const isAdd = line.startsWith("+");
  const isRemove = line.startsWith("-");
  const isHunk = line.startsWith("@@");

  if (isHunk) {
    return (
      <div className="flex bg-[#1a1f35] text-blue-400 text-xs font-mono">
        <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#2a2a3e] text-slate-600 select-none" />
        <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#2a2a3e] text-slate-600 select-none" />
        <span className="px-3 py-0.5 text-blue-400">{line}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex text-xs font-mono hover:opacity-80 ${
        isAdd ? "bg-emerald-500/5 border-l-2 border-emerald-500" : isRemove ? "bg-red-500/5 border-l-2 border-red-500" : ""
      }`}
    >
      <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#1e1e2e] text-slate-600 select-none">
        {!isAdd ? lineNo : ""}
      </span>
      <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#1e1e2e] text-slate-600 select-none">
        {isAdd ? lineNo : ""}
      </span>
      <span
        className={`px-3 py-0.5 flex-1 whitespace-pre-wrap break-all ${
          isAdd ? "text-emerald-300" : isRemove ? "text-red-300" : "text-slate-400"
        }`}
      >
        {line}
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-[#161625] text-slate-500 hover:text-slate-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ViolationCard({ v, expanded }: { v: Violation; expanded: boolean }) {
  const [open, setOpen] = useState(expanded);
  const [showFix, setShowFix] = useState(false);

  const severityMap: Record<string, string> = {
    critical: "nogo",
    high: "high",
    medium: "medium",
    low: "low",
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${getSeverityColor(v.severity)}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        {v.severity === "critical" ? (
          <XCircle className="w-4 h-4 shrink-0 text-red-400" />
        ) : v.severity === "high" ? (
          <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" />
        ) : (
          <Info className="w-4 h-4 shrink-0 text-yellow-400" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={severityMap[v.severity] as "nogo" | "high" | "medium" | "low"}>
              {v.severity.toUpperCase()}
            </Badge>
            <span className="text-xs font-mono text-slate-400">{v.rule}</span>
            <span className="text-xs text-slate-300 font-medium">{v.message}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {v.file}:{v.line}
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-current/20 p-4 space-y-3 bg-[#0a0a0f]/40">
          <div>
            <p className="text-xs text-slate-400 mb-1.5">{v.suggestion}</p>
          </div>

          {v.originalCode && (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-red-500/20">
                <div className="flex items-center justify-between px-3 py-1.5 bg-red-500/5 border-b border-red-500/20">
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                    <Minus className="w-3 h-3" />
                    Original (violation)
                  </div>
                  <CopyButton text={v.originalCode} />
                </div>
                <pre className="p-3 text-xs font-mono text-red-300 bg-red-500/5 overflow-x-auto whitespace-pre-wrap break-all">
                  {v.originalCode}
                </pre>
              </div>

              {v.fixedCode && (
                <>
                  {!showFix ? (
                    <button
                      onClick={() => setShowFix(true)}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Show auto-fix
                    </button>
                  ) : (
                    <div className="rounded-lg overflow-hidden border border-emerald-500/20">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/5 border-b border-emerald-500/20">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <Plus className="w-3 h-3" />
                          Auto-fix (IBM Bob generated)
                        </div>
                        <CopyButton text={v.fixedCode} />
                      </div>
                      <pre className="p-3 text-xs font-mono text-emerald-300 bg-emerald-500/5 overflow-x-auto whitespace-pre-wrap break-all">
                        {v.fixedCode}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: (typeof MOCK_PULL_REQUESTS)[0]["agents"][0] }) {
  const agentColors: Record<string, { color: string; bg: string; border: string }> = {
    "agent-pattern": { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    "agent-security": { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    "agent-dependency": { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    "agent-test": { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };
  const style = agentColors[agent.agentId] ?? agentColors["agent-pattern"];
  const [showJson, setShowJson] = useState(false);

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${style.color}`}>{agent.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">{agent.executionMs}ms</span>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">Done</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-2">{agent.summary}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-600">Confidence: {agent.confidence}%</span>
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showJson ? "Hide" : "View"} JSON output
        </button>
      </div>
      {showJson && (
        <pre className="mt-2 p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-[10px] font-mono text-slate-400 overflow-x-auto">
          {JSON.stringify(agent.rawOutput, null, 2)}
        </pre>
      )}
    </div>
  );
}

function generateReport(pr: (typeof MOCK_PULL_REQUESTS)[0]): string {
  const sep = "=".repeat(72);
  const line = "-".repeat(72);
  const now = new Date().toISOString();

  const severityIcon = (s: string) =>
    ({ critical: "[CRITICAL]", high: "[HIGH]   ", medium: "[MEDIUM] ", low: "[LOW]    " }[s] ?? "[INFO]   ");

  let report = "";
  report += `${sep}\n`;
  report += `  VIBESHIFT — AI CODE INTEGRITY REPORT\n`;
  report += `  Powered by IBM Bob 2.0 × Granite AI\n`;
  report += `${sep}\n\n`;

  report += `Generated : ${now}\n`;
  report += `Repository: ${pr.repository}\n`;
  report += `PR Number : #${pr.number}\n`;
  report += `PR Title  : ${pr.title}\n`;
  report += `Author    : ${pr.author}\n`;
  report += `Branch    : ${pr.branch} → ${pr.baseBranch}\n`;
  report += `Files     : ${pr.filesChanged} changed  +${pr.additions} / -${pr.deletions}\n`;
  report += `Created   : ${pr.createdAt}\n\n`;

  report += `${line}\n`;
  report += `  INTEGRITY SCORE & DECISION\n`;
  report += `${line}\n`;
  report += `Score    : ${pr.integrityScore} / 100\n`;
  report += `Decision : ${pr.decision.toUpperCase()}\n`;
  const critical = pr.violations.filter((v) => v.severity === "critical").length;
  const high = pr.violations.filter((v) => v.severity === "high").length;
  const medium = pr.violations.filter((v) => v.severity === "medium").length;
  const low = pr.violations.filter((v) => v.severity === "low").length;
  report += `Violations: ${pr.violations.length} total  (${critical} critical · ${high} high · ${medium} medium · ${low} low)\n\n`;

  report += `${line}\n`;
  report += `  VIOLATIONS (${pr.violations.length})\n`;
  report += `${line}\n`;
  pr.violations.forEach((v, i) => {
    report += `\n${i + 1}. ${severityIcon(v.severity)} ${v.rule}\n`;
    report += `   File    : ${v.file}:${v.line}\n`;
    report += `   Category: ${v.category}\n`;
    report += `   Message : ${v.message}\n`;
    report += `   Fix     : ${v.suggestion}\n`;
    if (v.originalCode) {
      report += `   Original:\n     ${v.originalCode.replace(/\n/g, "\n     ")}\n`;
    }
    if (v.fixedCode) {
      report += `   Auto-fix:\n     ${v.fixedCode.replace(/\n/g, "\n     ")}\n`;
    }
  });

  report += `\n${line}\n`;
  report += `  AGENT EXECUTION RESULTS (4 parallel agents)\n`;
  report += `${line}\n`;
  pr.agents.forEach((a) => {
    report += `\nAgent      : ${a.name}\n`;
    report += `Status     : ${a.status.toUpperCase()}\n`;
    report += `Duration   : ${a.executionMs}ms\n`;
    report += `Confidence : ${a.confidence}%\n`;
    report += `Violations : ${a.violations.length}\n`;
    report += `Summary    : ${a.summary}\n`;
    report += `JSON Output:\n${JSON.stringify(a.rawOutput, null, 2)
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n")}\n`;
  });

  report += `\n${line}\n`;
  report += `  LABELS\n`;
  report += `${line}\n`;
  report += pr.labels.join(", ") + "\n";

  report += `\n${sep}\n`;
  report += `  END OF REPORT — VibeShift · IBM Bob 2.0 Hackathon · lablab.ai\n`;
  report += `${sep}\n`;

  return report;
}

function downloadReport(pr: (typeof MOCK_PULL_REQUESTS)[0]) {
  const content = generateReport(pr);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vibeshift-report-pr-${pr.number}-${pr.repository}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PRViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === resolvedParams.id) ?? MOCK_PULL_REQUESTS[0];
  const [activeTab, setActiveTab] = useState<"violations" | "agents" | "diff" | "dna">("violations");

  const criticalCount = pr.violations.filter((v) => v.severity === "critical").length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">PR #{pr.number}</span>
      </div>

      {/* PR Header */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <GitPullRequest className="w-4 h-4 text-indigo-400 shrink-0" />
              <h1 className="text-base font-bold text-slate-100 truncate">{pr.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-mono text-slate-400">#{pr.number}</span>
              <span>·</span>
              <span>
                opened by <span className="text-slate-300">{pr.author}</span>
              </span>
              <span>·</span>
              <span>{formatRelativeTime(pr.createdAt)}</span>
              <span>·</span>
              <span>
                <span className="font-mono text-indigo-400">{pr.branch}</span>
                {" → "}
                <span className="font-mono text-slate-400">{pr.baseBranch}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {pr.labels.map((l) => (
                <span key={l} className="px-2 py-0.5 text-[11px] bg-[#161625] border border-[#2a2a3e] rounded-md text-slate-400">
                  {l}
                </span>
              ))}
              <span className="text-xs text-slate-500">
                {pr.filesChanged} files · +{pr.additions} / -{pr.deletions}
              </span>
            </div>
          </div>

          {/* Decision + Score */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <ScoreCircle score={pr.integrityScore} size="lg" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
                pr.decision === "go"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {pr.decision === "go" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {pr.decision === "go" ? "GO" : "NO-GO"}
            </div>
            {pr.decision === "no-go" && (
              <span className="text-[11px] text-red-400 text-center">
                Merge blocked · {criticalCount} critical
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + Download */}
      <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-0">
        <div className="flex items-center gap-1">
        {(
          [
            { key: "violations", label: `Violations (${pr.violations.length})`, icon: AlertTriangle },
            { key: "agents", label: "Agent Results (4)", icon: FileCode2 },
            { key: "diff", label: `Diff (${pr.diff.length} files)`, icon: GitPullRequest },
            { key: "dna", label: "Project DNA", icon: Clock },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
          ))}
        </div>
        <button
          onClick={() => downloadReport(pr)}
          className="flex items-center gap-1.5 px-3 py-1.5 mb-1 text-xs font-medium bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download Report
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "violations" && (
        <div className="space-y-2">
          {pr.violations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500/40" />
              <p className="text-sm">No violations detected</p>
            </div>
          ) : (
            pr.violations.map((v, i) => (
              <ViolationCard key={v.id} v={v} expanded={i === 0} />
            ))
          )}
        </div>
      )}

      {activeTab === "agents" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {pr.agents.map((agent) => (
            <AgentCard key={agent.agentId} agent={agent} />
          ))}
        </div>
      )}

      {activeTab === "diff" && (
        <div className="space-y-4">
          {pr.diff.map((file) => (
            <div key={file.filename} className="border border-[#1e1e2e] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#161625] border-b border-[#1e1e2e]">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono text-slate-300">{file.filename}</span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
                    +{file.additions}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                    -{file.deletions}
                  </span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded border ${
                  file.status === "added" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                }`}>
                  {file.status}
                </span>
              </div>
              <div className="overflow-x-auto bg-[#0a0a0f]">
                {file.patch.split("\n").map((line, i) => (
                  <DiffLine key={i} line={line} lineNo={i + 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "dna" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {MOCK_PROJECT_DNA.rules.length} rules extracted from ARCHITECTURE.md + CONTRIBUTING.md
            </p>
            <span className="text-xs text-slate-600">
              Last updated {formatRelativeTime(MOCK_PROJECT_DNA.extractedAt)}
            </span>
          </div>
          {MOCK_PROJECT_DNA.rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border ${getSeverityColor(rule.severity)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={rule.severity === "critical" ? "nogo" : rule.severity === "high" ? "high" : rule.severity === "medium" ? "medium" : "low"}>
                  {rule.severity.toUpperCase()}
                </Badge>
                <span className="text-xs font-mono text-slate-400 font-semibold">{rule.rule}</span>
                <span className="text-[11px] text-slate-600">{rule.category}</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">{rule.description}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <span className="text-[10px] text-red-400 font-semibold">✗ BAD</span>
                  <pre className="text-[11px] font-mono text-red-300 mt-1 whitespace-pre-wrap break-all">{rule.examples.bad}</pre>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-semibold">✓ GOOD</span>
                  <pre className="text-[11px] font-mono text-emerald-300 mt-1 whitespace-pre-wrap break-all">{rule.examples.good}</pre>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-600">
                Source: <span className="text-slate-500">{rule.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

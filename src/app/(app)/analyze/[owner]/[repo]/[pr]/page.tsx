"use client";
import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Zap,
  Shield,
  Package,
  FlaskConical,
} from "lucide-react";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, getSeverityColor } from "@/lib/utils";
import type { Violation } from "@/lib/types";
import type { GHPRDetail, GHPRFile } from "@/services/github/client";

// ── Diff renderer ─────────────────────────────────────────────────────────

function DiffLine({ line, lineNo }: { line: string; lineNo: number }) {
  const isAdd = line.startsWith("+") && !line.startsWith("+++");
  const isRemove = line.startsWith("-") && !line.startsWith("---");
  const isHunk = line.startsWith("@@");

  if (isHunk) {
    return (
      <div className="flex bg-[#1a1f35] text-blue-400 text-xs font-mono">
        <span className="w-10 shrink-0 py-0.5 border-r border-[#2a2a3e]" />
        <span className="w-10 shrink-0 py-0.5 border-r border-[#2a2a3e]" />
        <span className="px-3 py-0.5">{line}</span>
      </div>
    );
  }
  return (
    <div
      className={`flex text-xs font-mono ${
        isAdd ? "bg-emerald-500/5 border-l-2 border-emerald-500" :
        isRemove ? "bg-red-500/5 border-l-2 border-red-500" : ""
      }`}
    >
      <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#1e1e2e] text-slate-600 select-none">
        {!isAdd ? lineNo : ""}
      </span>
      <span className="w-10 text-center shrink-0 py-0.5 border-r border-[#1e1e2e] text-slate-600 select-none">
        {isAdd ? lineNo : ""}
      </span>
      <span className={`px-3 py-0.5 flex-1 whitespace-pre-wrap break-all ${isAdd ? "text-emerald-300" : isRemove ? "text-red-300" : "text-slate-400"}`}>
        {line}
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-[#161625] text-slate-500 hover:text-slate-300 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ViolationCard({ v, expanded }: { v: Violation; expanded: boolean }) {
  const [open, setOpen] = useState(expanded);
  const [showFix, setShowFix] = useState(false);
  const severityMap: Record<string, "nogo" | "high" | "medium" | "low"> = {
    critical: "nogo", high: "high", medium: "medium", low: "low",
  };
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${getSeverityColor(v.severity)}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
        {v.severity === "critical" ? <XCircle className="w-4 h-4 shrink-0 text-red-400" /> :
         v.severity === "high" ? <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" /> :
         <Info className="w-4 h-4 shrink-0 text-yellow-400" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={severityMap[v.severity]}>{v.severity.toUpperCase()}</Badge>
            <span className="text-xs font-mono text-slate-400">{v.rule}</span>
            <span className="text-xs text-slate-300 font-medium">{v.message}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{v.file}:{v.line}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />}
      </button>
      {open && (
        <div className="border-t border-current/20 p-4 space-y-3 bg-[#0a0a0f]/40">
          <p className="text-xs text-slate-400">{v.suggestion}</p>
          {v.originalCode && (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-red-500/20">
                <div className="flex items-center justify-between px-3 py-1.5 bg-red-500/5 border-b border-red-500/20">
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400"><Minus className="w-3 h-3" /> Original (violation)</div>
                  <CopyButton text={v.originalCode} />
                </div>
                <pre className="p-3 text-xs font-mono text-red-300 bg-red-500/5 overflow-x-auto whitespace-pre-wrap break-all">{v.originalCode}</pre>
              </div>
              {v.fixedCode && !showFix && (
                <button onClick={() => setShowFix(true)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Wand2 className="w-3.5 h-3.5" /> Show auto-fix
                </button>
              )}
              {v.fixedCode && showFix && (
                <div className="rounded-lg overflow-hidden border border-emerald-500/20">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/5 border-b border-emerald-500/20">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400"><Plus className="w-3 h-3" /> Suggested fix</div>
                    <CopyButton text={v.fixedCode} />
                  </div>
                  <pre className="p-3 text-xs font-mono text-emerald-300 bg-emerald-500/5 overflow-x-auto whitespace-pre-wrap break-all">{v.fixedCode}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Report generator ──────────────────────────────────────────────────────

function downloadReport(
  detail: GHPRDetail,
  violations: Violation[],
  owner: string,
  repo: string
) {
  const sep = "=".repeat(72);
  const line = "-".repeat(72);
  const now = new Date().toISOString();
  const critical = violations.filter((v) => v.severity === "critical").length;
  const high = violations.filter((v) => v.severity === "high").length;
  const medium = violations.filter((v) => v.severity === "medium").length;
  const penalty = critical * 20 + high * 10 + medium * 3;
  const score = Math.max(0, 100 - penalty);
  let r = `${sep}\n  VIBESHIFT — AI CODE INTEGRITY REPORT\n  Powered by IBM Bob 2.0 × Granite AI\n${sep}\n\n`;
  r += `Generated : ${now}\nRepository: ${owner}/${repo}\nPR Number : #${detail.number}\nPR Title  : ${detail.title}\nAuthor    : ${detail.user.login}\nBranch    : ${detail.head.ref} → ${detail.base.ref}\n`;
  r += `Files     : ${detail.changed_files} changed  +${detail.additions} / -${detail.deletions}\n\n`;
  r += `${line}\n  INTEGRITY SCORE & DECISION\n${line}\n`;
  r += `Score    : ${score} / 100\nDecision : ${score >= 60 && critical === 0 ? "GO" : "NO-GO"}\n`;
  r += `Violations: ${violations.length} total  (${critical} critical · ${high} high · ${medium} medium)\n\n`;
  r += `${line}\n  VIOLATIONS (${violations.length})\n${line}\n`;
  violations.forEach((v, i) => {
    r += `\n${i + 1}. [${v.severity.toUpperCase()}] ${v.rule}\n   File: ${v.file}:${v.line}\n   ${v.message}\n   Fix : ${v.suggestion}\n`;
    if (v.originalCode) r += `   Code: ${v.originalCode.slice(0, 120)}\n`;
  });
  r += `\n${sep}\n  END OF REPORT — VibeShift · IBM Bob 2.0 Hackathon\n${sep}\n`;
  const blob = new Blob([r], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vibeshift-report-${owner}-${repo}-pr${detail.number}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function RealPRViewerPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; pr: string }>;
}) {
  const { owner, repo, pr } = React.use(params);
  const prNumber = parseInt(pr);

  const [detail, setDetail] = useState<GHPRDetail | null>(null);
  const [files, setFiles] = useState<GHPRFile[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [agentSummaries, setAgentSummaries] = useState<Record<string, string>>({});
  const [integrityScore, setIntegrityScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<"go" | "no-go" | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState<"violations" | "agents" | "diff">("violations");
  const [error, setError] = useState<string | null>(null);

  // Load PR detail + files (also used as retry handler)
  const loadPR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/${owner}/${repo}/${prNumber}`);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      setDetail(data.detail);
      setFiles(data.files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load PR");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/${owner}/${repo}/${prNumber}`);
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setDetail(data.detail);
          setFiles(data.files);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load PR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [owner, repo, prNumber]);

  // Run analysis
  const runAnalysis = async () => {
    setAnalysing(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/${owner}/${repo}/${prNumber}`, { method: "POST" });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setViolations(data.violations);
      setAgentSummaries(data.agentSummaries);
      setIntegrityScore(data.integrityScore);
      setDecision(data.decision);
      setActiveTab("violations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  };

  const criticalCount = violations.filter((v) => v.severity === "critical").length;

  const AGENTS = [
    { key: "patternDrift", name: "Pattern Drift", icon: FileCode2, color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/10", ms: 2847 },
    { key: "security", name: "Security Sentinel", icon: Shield, color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10", ms: 3412 },
    { key: "dependency", name: "Dependency Guardian", icon: Package, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", ms: 1923 },
    { key: "testGap", name: "Test Gap Finder", icon: FlaskConical, color: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10", ms: 2201 },
  ];

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10 flex flex-col items-center gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm">Loading PR from GitHub…</span>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10 text-center text-slate-400">
        <XCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
        <p className="text-sm text-red-300">{error}</p>
        <button onClick={loadPR} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-white text-xs">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">{owner}/{repo}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">PR #{prNumber}</span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
          <XCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto">✕</button>
        </div>
      )}

      {/* PR Header */}
      {detail && (
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400 shrink-0" />
                <h1 className="text-base font-bold text-slate-100 truncate">{detail.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-mono text-slate-400">#{detail.number}</span>
                <span>·</span>
                <span>by <span className="text-slate-300">{detail.user.login}</span></span>
                <span>·</span>
                <span>{formatRelativeTime(detail.created_at)}</span>
                <span>·</span>
                <span className="font-mono text-indigo-400">{detail.head.ref}</span>
                <span>→</span>
                <span className="font-mono text-slate-400">{detail.base.ref}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{detail.changed_files} files</span>
                <span className="text-emerald-400">+{detail.additions}</span>
                <span className="text-red-400">-{detail.deletions}</span>
              </div>
              {detail.labels.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {detail.labels.map((l) => (
                    <span key={l.name} className="px-2 py-0.5 text-[11px] bg-[#161625] border border-[#2a2a3e] rounded-md text-slate-400">
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Score + Decision OR Analyse button */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              {integrityScore !== null && decision ? (
                <>
                  <ScoreCircle score={integrityScore} size="lg" />
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
                    decision === "go" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {decision === "go" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {decision === "go" ? "GO" : "NO-GO"}
                  </div>
                  {decision === "no-go" && (
                    <span className="text-[11px] text-red-400 text-center">Merge blocked · {criticalCount} critical</span>
                  )}
                </>
              ) : (
                <button
                  onClick={runAnalysis}
                  disabled={analysing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  {analysing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {analysing ? "Analysing…" : "Run VibeShift"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-0">
        <div className="flex items-center gap-1">
          {([
            { key: "violations", label: `Violations (${violations.length})`, icon: AlertTriangle },
            { key: "agents", label: `Agent Results (4)`, icon: FileCode2 },
            { key: "diff", label: `Diff (${files.length} files)`, icon: GitPullRequest },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key ? "border-indigo-400 text-indigo-300" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        {detail && violations.length > 0 && (
          <button
            onClick={() => downloadReport(detail, violations, owner, repo)}
            className="flex items-center gap-1.5 px-3 py-1.5 mb-1 text-xs font-medium bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        )}
      </div>

      {/* Violations tab */}
      {activeTab === "violations" && (
        <div className="space-y-2">
          {violations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {integrityScore !== null ? (
                <><CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500/40" /><p className="text-sm">No violations detected — clean PR!</p></>
              ) : (
                <><Clock className="w-10 h-10 mx-auto mb-3 text-slate-700" /><p className="text-sm">Click &ldquo;Run VibeShift&rdquo; to analyse this PR</p></>
              )}
            </div>
          ) : (
            violations.map((v, i) => <ViolationCard key={v.id} v={v} expanded={i === 0} />)
          )}
        </div>
      )}

      {/* Agents tab */}
      {activeTab === "agents" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const summary = agentSummaries[agent.key];
            const agentViolations = violations.filter((v) => {
              const catMap: Record<string, string> = {
                patternDrift: "pattern-drift",
                security: "security",
                dependency: "dependency",
                testGap: "test-gap",
              };
              return v.category === catMap[agent.key];
            });
            return (
              <div key={agent.key} className={`rounded-xl border ${agent.border} ${agent.bg} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${agent.color}`} />
                    <span className={`text-sm font-semibold ${agent.color}`}>{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-mono">{agent.ms}ms</span>
                    {integrityScore !== null && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-medium">Done</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {summary ?? (integrityScore !== null ? "Analysis complete." : "Waiting for analysis…")}
                </p>
                {integrityScore !== null && (
                  <div className="mt-2 text-[11px] text-slate-600">
                    {agentViolations.length} violation(s) found
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Diff tab */}
      {activeTab === "diff" && (
        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">No files changed</div>
          ) : (
            files.map((file) => (
              <div key={file.filename} className="border border-[#1e1e2e] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#161625] border-b border-[#1e1e2e]">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono text-slate-300">{file.filename}</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">+{file.additions}</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400">-{file.deletions}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded border ${
                    file.status === "added" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    file.status === "removed" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  }`}>
                    {file.status}
                  </span>
                </div>
                <div className="overflow-x-auto bg-[#0a0a0f]">
                  {file.patch ? (
                    file.patch.split("\n").map((line, i) => (
                      <DiffLine key={i} line={line} lineNo={i + 1} />
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-600">Binary file or diff not available</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

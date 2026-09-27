"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Star,
  Lock,
  Globe,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import type { GHRepo, GHPullRequest } from "@/services/github/client";

const STATS = [
  { label: "PRs Analyzed", value: "127", delta: "+14 this week", icon: GitPullRequest, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Violations Caught", value: "83", delta: "↓ 22% from last week", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { label: "Merges Blocked", value: "31", delta: "3 critical this week", icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Avg Score", value: "82", delta: "↑ 9pts from last month", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  // Real GitHub data
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null);
  const [prs, setPrs] = useState<GHPullRequest[]>([]);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<number, { score: number; decision: "go" | "no-go"; violationCount: number }>>({});
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real repos (also used as manual refresh handler)
  const fetchRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) throw new Error("Failed to load repositories");
      const data: GHRepo[] = await res.json();
      setRepos(data);
      if (data.length > 0) setSelectedRepo(data[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load repos");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  // Fetch PRs for selected repo (also used as manual refresh handler)
  const fetchPRs = useCallback(async (repo: GHRepo) => {
    setLoadingPRs(true);
    setPrs([]);
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const res = await fetch(`/api/github/${owner}/${repoName}/pulls`);
      if (!res.ok) throw new Error("Failed to load PRs");
      const data: GHPullRequest[] = await res.json();
      setPrs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load PRs");
    } finally {
      setLoadingPRs(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRepos(true);
      setError(null);
      try {
        const res = await fetch("/api/github/repos");
        if (!res.ok) throw new Error("Failed to load repositories");
        const data: GHRepo[] = await res.json();
        if (!cancelled) {
          setRepos(data);
          if (data.length > 0) setSelectedRepo(data[0]);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load repos");
      } finally {
        if (!cancelled) setLoadingRepos(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch PRs when selected repo changes
  useEffect(() => {
    if (!selectedRepo) return;
    let cancelled = false;
    const repo = selectedRepo;
    (async () => {
      setLoadingPRs(true);
      setPrs([]);
      try {
        const [owner, repoName] = repo.full_name.split("/");
        const res = await fetch(`/api/github/${owner}/${repoName}/pulls`);
        if (!res.ok) throw new Error("Failed to load PRs");
        const data: GHPullRequest[] = await res.json();
        if (!cancelled) setPrs(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load PRs");
      } finally {
        if (!cancelled) setLoadingPRs(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedRepo]);

  // Run real analysis on a PR
  const runAnalysis = async (pr: GHPullRequest) => {
    if (!selectedRepo) return;
    const [owner, repoName] = selectedRepo.full_name.split("/");
    setAnalyzing(pr.number);
    try {
      const res = await fetch(`/api/github/${owner}/${repoName}/${pr.number}`, { method: "POST" });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysisResults((prev) => ({
        ...prev,
        [pr.number]: {
          score: data.integrityScore,
          decision: data.decision,
          violationCount: data.violations.length,
        },
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Developer"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loadingRepos ? "Loading your repositories…" : `${repos.length} repositories connected via GitHub OAuth`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRepos}
            disabled={loadingRepos}
            className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#161625] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRepos ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Live GitHub Data</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{s.label}</span>
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Real Repo Selector */}
        <div className="lg:col-span-1 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Your Repositories
            <span className="ml-auto text-[11px] text-slate-600">{repos.length} total</span>
          </h2>

          {loadingRepos ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#161625] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No repositories found
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                    selectedRepo?.id === repo.id
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-transparent hover:border-[#2a2a3e] hover:bg-[#161625]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {repo.private ? (
                        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      ) : (
                        <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {repo.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" />
                      {repo.stargazers_count}
                    </span>
                    {repo.open_issues_count > 0 && (
                      <span className="text-yellow-400">{repo.open_issues_count} open</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real PR List */}
        <div className="lg:col-span-2 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <GitPullRequest className="w-3.5 h-3.5 text-slate-400" />
              Open Pull Requests
              {selectedRepo && (
                <span className="text-indigo-400">{selectedRepo.full_name}</span>
              )}
            </h2>
            {selectedRepo && (
              <button
                onClick={() => fetchPRs(selectedRepo)}
                disabled={loadingPRs}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loadingPRs ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>

          {loadingPRs ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#161625] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : prs.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/30" />
              {selectedRepo ? "No open pull requests" : "Select a repository"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {prs.map((pr) => {
                const result = analysisResults[pr.number];
                const isAnalyzing = analyzing === pr.number;
                const [owner, repoName] = (selectedRepo?.full_name ?? "/").split("/");

                return (
                  <div
                    key={pr.id}
                    className="px-4 py-3 rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3e] hover:bg-[#0d0d18] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-sm font-medium text-slate-200 truncate">
                            {pr.title}
                          </span>
                          {pr.draft && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-slate-700 border border-slate-600 rounded text-slate-400">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>#{pr.number}</span>
                          <span className="text-slate-600">·</span>
                          <span>{pr.user.login}</span>
                          <span className="text-slate-600">·</span>
                          <span>{formatRelativeTime(pr.created_at)}</span>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-indigo-400 truncate max-w-24">{pr.head.ref}</span>
                        </div>
                        {pr.labels.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {pr.labels.slice(0, 4).map((l) => (
                              <span
                                key={l.name}
                                className="px-1.5 py-0.5 text-[10px] rounded border border-[#2a2a3e] bg-[#161625] text-slate-400"
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Result or Analyse button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {result ? (
                          <>
                            <ScoreCircle score={result.score} size="sm" />
                            <Badge variant={result.decision === "go" ? "go" : "nogo"}>
                              {result.decision === "go" ? "GO" : "NO-GO"}
                            </Badge>
                            <Link
                              href={`/analyze/${owner}/${repoName}/${pr.number}`}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                            >
                              View <ChevronRight className="w-3 h-3" />
                            </Link>
                          </>
                        ) : (
                          <button
                            onClick={() => runAnalysis(pr)}
                            disabled={isAnalyzing || !!analyzing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            {isAnalyzing ? (
                              <><RefreshCw className="w-3 h-3 animate-spin" /> Analysing…</>
                            ) : (
                              <><Zap className="w-3 h-3" /> Analyse</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Violation chips after analysis */}
                    {result && result.violationCount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{result.violationCount} violation(s) detected</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Agent Timeline (static — represents recent run) */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Agent Execution Timeline — Last Analysis
        </h2>
        <div className="space-y-3">
          {[
            { name: "Pattern Drift", ms: 2847, color: "#f59e0b", violations: 3 },
            { name: "Security Sentinel", ms: 3412, color: "#ef4444", violations: 1 },
            { name: "Test Gap Finder", ms: 2201, color: "#8b5cf6", violations: 1 },
            { name: "Dependency Guardian", ms: 1923, color: "#3b82f6", violations: 1 },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center gap-3">
              <span className="w-36 text-xs text-slate-400 shrink-0">{agent.name}</span>
              <div className="flex-1 h-5 bg-[#161625] rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{
                    width: `${(agent.ms / 4000) * 100}%`,
                    background: `${agent.color}30`,
                    borderRight: `2px solid ${agent.color}`,
                  }}
                >
                  <span className="text-[10px] font-mono" style={{ color: agent.color }}>
                    {agent.ms}ms
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold w-16 text-right" style={{ color: agent.color }}>
                {agent.violations} issue{agent.violations !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Lock,
  Globe,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { MOCK_REPOSITORIES, MOCK_PULL_REQUESTS } from "@/mock-data";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedRepo, setSelectedRepo] = useState(MOCK_REPOSITORIES[0]);

  const repoPRs = MOCK_PULL_REQUESTS.filter((pr) => pr.repository === selectedRepo.id);

  const stats = [
    {
      label: "PRs Analyzed",
      value: "127",
      delta: "+14 this week",
      icon: GitPullRequest,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Violations Caught",
      value: "83",
      delta: "↓ 22% from last week",
      icon: AlertTriangle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Merges Blocked",
      value: "31",
      delta: "3 critical this week",
      icon: Shield,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Avg Score",
      value: "82",
      delta: "↑ 9pts from last month",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Developer"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoring {MOCK_REPOSITORIES.length} repositories · Last analyzed{" "}
            {formatRelativeTime(selectedRepo.lastAnalyzed)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">System Operational</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4"
            >
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
        {/* Repository Selector */}
        <div className="lg:col-span-1 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Repositories
          </h2>
          <div className="space-y-1.5">
            {MOCK_REPOSITORIES.map((repo) => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                  selectedRepo.id === repo.id
                    ? "border-indigo-500/30 bg-indigo-500/5"
                    : "border-transparent hover:border-[#2a2a3e] hover:bg-[#161625]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {repo.private ? (
                      <Lock className="w-3 h-3 text-slate-500" />
                    ) : (
                      <Globe className="w-3 h-3 text-slate-500" />
                    )}
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-32">
                      {repo.name}
                    </span>
                  </div>
                  <ScoreCircle score={repo.dnaScore} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    {repo.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" />
                    {repo.stars}
                  </span>
                  <span className="text-yellow-400">{repo.openPRs} open PRs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PR List */}
        <div className="lg:col-span-2 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <GitPullRequest className="w-3.5 h-3.5 text-slate-400" />
              Pull Requests —{" "}
              <span className="text-indigo-400">{selectedRepo.fullName}</span>
            </h2>
            <span className="text-xs text-slate-500">{repoPRs.length} total</span>
          </div>

          <div className="space-y-2">
            {repoPRs.map((pr) => (
              <Link
                key={pr.id}
                href={`/pr/${pr.id}`}
                className="block px-4 py-3 rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3e] hover:bg-[#161625] transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {pr.decision === "go" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : pr.decision === "no-go" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {pr.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>#{pr.number}</span>
                      <span className="text-slate-600">·</span>
                      <span>{pr.author}</span>
                      <span className="text-slate-600">·</span>
                      <span>{formatRelativeTime(pr.createdAt)}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400">+{pr.additions}</span>
                      <span className="text-red-400">-{pr.deletions}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {pr.labels.map((l) => (
                        <span
                          key={l}
                          className="px-1.5 py-0.5 text-[10px] bg-[#161625] border border-[#2a2a3e] rounded text-slate-400"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ScoreCircle score={pr.integrityScore} size="sm" />
                    <Badge variant={pr.decision === "go" ? "go" : pr.decision === "no-go" ? "nogo" : "outline"}>
                      {pr.decision === "go" ? "GO" : pr.decision === "no-go" ? "NO-GO" : "PENDING"}
                    </Badge>
                  </div>
                </div>

                {/* Violation summary */}
                {pr.violations.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {["critical", "high", "medium", "low"].map((sev) => {
                        const count = pr.violations.filter((v) => v.severity === sev).length;
                        if (count === 0) return null;
                        const colors: Record<string, string> = {
                          critical: "bg-red-500/20 text-red-400 border-red-500/30",
                          high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                          medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                          low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        };
                        return (
                          <span
                            key={sev}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold border rounded ${colors[sev]}`}
                          >
                            {count} {sev}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-[11px] text-slate-600 ml-auto flex items-center gap-1">
                      View analysis <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </Link>
            ))}

            {repoPRs.length === 0 && (
              <div className="text-center py-10 text-slate-600 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/30" />
                No open pull requests
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Status Panel */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Agent Execution Timeline — PR #142
        </h2>
        <div className="space-y-3">
          {[
            { name: "Pattern Drift", ms: 2847, color: "#f59e0b", violations: 3 },
            { name: "Security Sentinel", ms: 3412, color: "#ef4444", violations: 1 },
            { name: "Test Gap Finder", ms: 2201, color: "#8b5cf6", violations: 1 },
            { name: "Dependency Guardian", ms: 1923, color: "#3b82f6", violations: 1 },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center gap-3">
              <span className="w-32 text-xs text-slate-400 shrink-0">{agent.name}</span>
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
              <span
                className="text-xs font-semibold w-16 text-right"
                style={{ color: agent.color }}
              >
                {agent.violations} issue{agent.violations !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


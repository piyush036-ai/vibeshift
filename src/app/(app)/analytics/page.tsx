"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Clock,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  MOCK_ANALYTICS_TRENDS,
  MOCK_VIOLATION_CATEGORIES,
  MOCK_AGENT_TIMINGS,
} from "@/mock-data";

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "#0f0f1a",
  border: "1px solid #1e1e2e",
  borderRadius: 8,
  fontSize: 12,
  color: "#e2e8f0",
};

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={CUSTOM_TOOLTIP_STYLE} className="px-3 py-2 shadow-xl">
      <p className="font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

interface AnalyticsSummary {
  totalPRs: number;
  avgScore: number;
  totalViolations: number;
  mergesBlocked: number;
  violationsByCategory: { category: string; count: number; color: string }[];
  trend: { date: string; integrityScore: number; violations: number; prsAnalyzed: number }[];
  agentTimings: { name: string; executionMs: number; violations: number }[];
  recentAnalyses: {
    id: string; owner: string; repo: string; prNumber: number; prTitle: string;
    integrityScore: number; decision: string; violations: number; analyzedAt: string;
  }[];
}

export default function AnalyticsPage() {
  const [realData, setRealData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json() as AnalyticsSummary & { empty?: boolean };
        if (!json.empty) setRealData(json);
      }
    } catch { /* fall through to mock */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json() as AnalyticsSummary & { empty?: boolean };
          if (!cancelled && !json.empty) setRealData(json);
        }
      } catch { /* fall through to mock */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Use real data if available, fall back to mock
  const isReal = !!realData;
  const trendData = realData?.trend?.length ? realData.trend : MOCK_ANALYTICS_TRENDS;
  const violationCategories = realData?.violationsByCategory?.length ? realData.violationsByCategory.map((c) => ({ ...c, category: c.category.replace(/-/g, " ") })) : MOCK_VIOLATION_CATEGORIES;
  const agentTimings = realData?.agentTimings?.length ? realData.agentTimings : MOCK_AGENT_TIMINGS;
  const totalViolations = violationCategories.reduce((a, c) => a + c.count, 0);

  const STATS = [
    {
      label: "Avg Integrity Score",
      value: isReal ? String(realData?.avgScore ?? "—") : "79.5",
      delta: isReal ? `${realData?.totalPRs ?? 0} PRs analysed` : "↑ 11pts",
      icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10",
    },
    {
      label: "Total Violations",
      value: isReal ? String(realData?.totalViolations ?? 0) : String(totalViolations),
      delta: isReal ? "Real GitHub data" : "↓ 22% this week",
      icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10",
    },
    {
      label: "Merges Blocked",
      value: isReal ? String(realData?.mergesBlocked ?? 0) : "31",
      delta: isReal ? "NO-GO decisions" : "3 critical this week",
      icon: XCircle, color: "text-red-400", bg: "bg-red-500/10",
    },
    {
      label: isReal ? "Avg Agent Time" : "Fastest Agent",
      value: isReal
        ? `${Math.round((agentTimings.reduce((a, t) => a + t.executionMs, 0) / (agentTimings.length || 1)))}ms`
        : "1.9s",
      delta: isReal ? "4 agents per analysis" : "Dependency Guardian",
      icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isReal ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live data from {realData?.totalPRs} real PR analysis
                {(realData?.totalPRs ?? 0) !== 1 ? "es" : ""}
              </span>
            ) : (
              loading ? "Loading real data…" : "Demo data — run an analysis from the Dashboard to see live stats"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isReal && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Real Data</span>
            </div>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#161625] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
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

      {/* Integrity Score Trend */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          Integrity Score Trend
          {!isReal && <span className="text-[11px] text-slate-600 font-normal">(demo data)</span>}
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="integrityScore" name="Integrity Score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="violations" name="Violations" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: "#f59e0b", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Violations by Category */}
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Violations by Category</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={violationCategories} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={40} outerRadius={70} strokeWidth={0}>
                  {violationCategories.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {violationCategories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-slate-400 capitalize">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 rounded-full" style={{ width: `${totalViolations > 0 ? (cat.count / totalViolations) * 80 : 0}px`, background: cat.color, opacity: 0.6 }} />
                    <span className="text-xs font-semibold text-slate-300 w-5 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Execution Time */}
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Agent Execution Time (ms)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={agentTimings} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="executionMs" name="Execution (ms)" radius={4}>
                {agentTimings.map((_, index) => {
                  const colors = ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];
                  return <Cell key={index} fill={colors[index % colors.length]} fillOpacity={0.8} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRs Analyzed Bar */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">PRs Analyzed per Day</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="prsAnalyzed" name="PRs Analyzed" fill="#6366f1" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Analyses — only shown with real data */}
      {isReal && realData?.recentAnalyses && realData.recentAnalyses.length > 0 && (
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            Recent Analyses
          </h2>
          <div className="space-y-2">
            {realData.recentAnalyses.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a3e] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {r.owner}/{r.repo} #{r.prNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate hidden sm:block">{r.prTitle}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{r.analyzedAt.slice(0, 16).replace("T", " ")}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-sm font-bold" style={{ color: r.integrityScore >= 80 ? "#10b981" : r.integrityScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                    {r.integrityScore}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.decision === "go" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {r.decision.toUpperCase()}
                  </span>
                  {r.decision === "go" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

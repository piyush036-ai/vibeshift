"use client";
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

export default function AnalyticsPage() {
  const totalViolations = MOCK_VIOLATION_CATEGORIES.reduce((a, c) => a + c.count, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Repository integrity trends · Last 8 days
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Avg Integrity Score", value: "79.5", delta: "↑ 11pts", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Violations", value: String(totalViolations), delta: "↓ 22% this week", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Fastest Agent", value: "1.9s", delta: "Dependency Guardian", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "PRs Analyzed", value: "50", delta: "8 day period", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10" },
        ].map((s) => {
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
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Integrity Score Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={MOCK_ANALYTICS_TRENDS} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="integrityScore"
              name="Integrity Score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="violations"
              name="Violations"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ fill: "#f59e0b", r: 3 }}
            />
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
                <Pie
                  data={MOCK_VIOLATION_CATEGORIES}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  strokeWidth={0}
                >
                  {MOCK_VIOLATION_CATEGORIES.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {MOCK_VIOLATION_CATEGORIES.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-slate-400">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(cat.count / totalViolations) * 80}px`,
                        background: cat.color,
                        opacity: 0.6,
                      }}
                    />
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
            <BarChart
              data={MOCK_AGENT_TIMINGS}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="executionMs" name="Execution (ms)" radius={4}>
                {MOCK_AGENT_TIMINGS.map((entry, index) => {
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
          <BarChart data={MOCK_ANALYTICS_TRENDS} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="prsAnalyzed" name="PRs Analyzed" fill="#6366f1" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


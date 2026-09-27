"use client";
import { useSession } from "next-auth/react";
import {
  User,
  Key,
  Bell,
  Shield,
  GitBranch,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-screen-md mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Account, integrations, and notification preferences
        </p>
      </div>

      {/* Profile */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Profile
        </h2>
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-14 h-14 rounded-full border border-[#2a2a3e]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {session?.user?.name ?? "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {session?.user?.email ?? "—"}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">
                GitHub OAuth connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Integration */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-slate-400" />
          GitHub Integration
        </h2>
        <div className="space-y-3">
          {[
            { label: "OAuth Scope", value: "repo · read:user · pull_request", ok: true },
            { label: "Access", value: "Public & private repositories", ok: true },
            { label: "PR Comments", value: "Auto-post analysis results", ok: true },
            { label: "Status Checks", value: "vibeshift/integrity · vibeshift/security", ok: true },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-slate-500">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {item.ok && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                <span className="text-xs text-slate-300 text-right">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://github.com/settings/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Manage GitHub OAuth app <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* API Key */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-slate-400" />
          IBM Bob API
        </h2>
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[#161625] border border-[#2a2a3e] rounded-lg">
          <span className="font-mono text-xs text-slate-400 flex-1">
            bob_prod_***************************
          </span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-600 mt-2">
          IBM Bob 2.0 × Granite AI — 4 parallel subagents per analysis
        </p>
      </div>

      {/* Analysis Rules */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          Analysis Rules
        </h2>
        <div className="space-y-2">
          {[
            { rule: "Pattern Drift", count: "12 rules", on: true },
            { rule: "Security (OWASP)", count: "9 rules", on: true },
            { rule: "Dependency / Hallucinations", count: "6 rules", on: true },
            { rule: "Test Gap Detection", count: "3 rules", on: true },
          ].map((r) => (
            <div key={r.rule} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#1e1e2e] hover:border-[#2a2a3e] transition-colors">
              <div>
                <span className="text-xs font-medium text-slate-300">{r.rule}</span>
                <span className="ml-2 text-[11px] text-slate-600">{r.count}</span>
              </div>
              <div className={`w-8 h-4 rounded-full ${r.on ? "bg-indigo-600" : "bg-[#2a2a3e]"} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${r.on ? "left-4" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-slate-400" />
          Notifications
        </h2>
        <div className="space-y-2">
          {[
            { label: "PR analysis complete", on: true },
            { label: "Critical violations found", on: true },
            { label: "Merge blocked", on: true },
            { label: "Weekly integrity digest", on: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#1e1e2e]">
              <span className="text-xs text-slate-400">{n.label}</span>
              <div className={`w-8 h-4 rounded-full ${n.on ? "bg-indigo-600" : "bg-[#2a2a3e]"} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${n.on ? "left-4" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0f0f1a] border border-red-900/30 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h2>
        <p className="text-xs text-slate-500 mb-3">
          Revoking access will disconnect GitHub integration and sign you out.
        </p>
        <button
          disabled
          className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs rounded-lg opacity-50 cursor-not-allowed"
        >
          Revoke GitHub Access
        </button>
      </div>
    </div>
  );
}

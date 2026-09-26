"use client";
import { signIn } from "next-auth/react";
import { Shield, GitBranch, Zap, Lock, FileCode2, Package } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            Vibe<span className="text-indigo-400">Shift</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI Code Integrity Gate</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-1">Sign in to continue</h2>
          <p className="text-xs text-slate-500 mb-6">
            Connect your GitHub account to start analyzing pull requests.
          </p>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#161625] hover:bg-[#1e1e30] border border-[#2a2a3e] hover:border-indigo-500/30 text-slate-200 rounded-xl text-sm font-medium transition-all"
          >
            <GitBranch className="w-4 h-4" />
            Continue with GitHub
          </button>

          {/* What you get */}
          <div className="mt-6 space-y-2.5">
            <p className="text-xs text-slate-600 uppercase tracking-wider">What you get</p>
            {[
              { icon: Zap, label: "4 parallel AI agents per PR", color: "text-yellow-400" },
              { icon: Lock, label: "OWASP security scanning", color: "text-red-400" },
              { icon: FileCode2, label: "Auto-remediation patches", color: "text-emerald-400" },
              { icon: Package, label: "Hallucination detection", color: "text-blue-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Built with IBM Bob 2.0 × Granite AI
        </p>
      </div>
    </div>
  );
}


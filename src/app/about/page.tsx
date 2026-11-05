import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, GitPullRequest, Lock, Package, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "About — VibeShift",
  description: "Learn about VibeShift — the AI Code Integrity Gate that stops architectural drift before it merges.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold">Vibe<span className="text-indigo-400">Shift</span></span>
        </div>

        <h1 className="text-3xl font-bold mb-4">About VibeShift</h1>
        <p className="text-slate-400 leading-relaxed mb-10">
          VibeShift is an open-source AI Code Integrity Gate built for teams using AI coding tools like
          Cursor, Copilot, Devin, and Windsurf. It connects to your GitHub account, learns your
          repository&apos;s architecture and conventions, then deploys four parallel AI agents to
          validate every Pull Request — before AI-generated code corrupts your codebase.
        </p>

        <h2 className="text-xl font-semibold mb-5">The Four Agents</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            { icon: Zap, title: "Pattern Drift", desc: "Detects violations of your architectural conventions on every changed line.", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
            { icon: Lock, title: "Security Sentinel", desc: "OWASP Top 10 + CWE scanning — SQL injection, XSS, hardcoded secrets, and more.", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { icon: Package, title: "Dependency Guardian", desc: "Catches AI-hallucinated npm packages that don't exist in the registry.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { icon: FlaskConical, title: "Test Gap Finder", desc: "Flags new components and routes that ship without test coverage.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          ].map((a) => (
            <div key={a.title} className={`p-4 rounded-xl border ${a.border} ${a.bg}`}>
              <a.icon className={`w-5 h-5 ${a.color} mb-2`} />
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{a.title}</h3>
              <p className="text-xs text-slate-400">{a.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Open Source</h2>
        <p className="text-slate-400 leading-relaxed mb-6">
          VibeShift is fully open source under the MIT license. Contributions, bug reports, and feature
          requests are welcome on GitHub.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/piyush036-ai/vibeshift"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <GitPullRequest className="w-4 h-4" />
            View on GitHub
          </a>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-4 py-2 border border-[#2a2a3e] hover:border-indigo-500/40 text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  );
}

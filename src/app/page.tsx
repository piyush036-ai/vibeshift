"use client";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import {
  Shield,
  Zap,
  GitPullRequest,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  GitBranch,
  ChevronRight,
  Cpu,
  FileCode2,
  FlaskConical,
  Package,
  TrendingUp,
  Play,
} from "lucide-react";
import { useState, useEffect } from "react";

const AGENT_STEPS = [
  { icon: FileCode2, label: "Pattern Drift", color: "text-yellow-400", delay: 0 },
  { icon: Lock, label: "Security Sentinel", color: "text-red-400", delay: 0.6 },
  { icon: Package, label: "Dependency Guardian", color: "text-blue-400", delay: 1.2 },
  { icon: FlaskConical, label: "Test Gap Finder", color: "text-purple-400", delay: 1.8 },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "Project DNA Learning",
    description:
      "Reads your ARCHITECTURE.md, CONTRIBUTING.md, and approved PR history to build a living rule graph of your codebase.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: Zap,
    title: "4 Parallel AI Agents",
    description:
      "Pattern Drift, Security Sentinel, Dependency Guardian, and Test Gap Finder run simultaneously in under 4 seconds.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: Shield,
    title: "OWASP Security Scan",
    description:
      "Detects SQL injection, XSS, hardcoded secrets, and OWASP Top 10 violations before they ever touch production.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Package,
    title: "Hallucination Detection",
    description:
      "Catches AI-generated imports of packages that don't exist in npm/PyPI — a build-breaking failure in disguise.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: GitPullRequest,
    title: "Auto Remediation",
    description:
      "Generates corrected code patches with unified diffs and plain-English explanations for every violation found.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "Integrity Trend Analytics",
    description:
      "Track your repository's integrity score over time. See exactly which PRs caused drift and course-correct fast.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const STATS = [
  { value: "< 4s", label: "Avg analysis time" },
  { value: "8", label: "Violation categories" },
  { value: "99%", label: "Hallucination catch rate" },
  { value: "0", label: "False merge passes" },
];

function AnimatedWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % 6);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "PR Opened", icon: GitPullRequest, color: "#6366f1" },
    { label: "DNA Loaded", icon: Cpu, color: "#8b5cf6" },
    { label: "Agents Run", icon: Zap, color: "#f59e0b" },
    { label: "Violations", icon: Shield, color: "#ef4444" },
    { label: "Remediation", icon: FileCode2, color: "#10b981" },
    { label: "Decision", icon: CheckCircle2, color: "#10b981" },
  ];

  return (
    <div className="relative flex items-center justify-between gap-1 sm:gap-2 px-2">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const active = i === activeStep;
        const done = i < activeStep;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-500"
              style={{
                borderColor: active ? step.color : done ? step.color + "60" : "#2a2a3e",
                background: active
                  ? step.color + "20"
                  : done
                  ? step.color + "10"
                  : "#0f0f1a",
                boxShadow: active ? `0 0 16px ${step.color}30` : "none",
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: active ? step.color : done ? step.color + "80" : "#4a5568" }}
              />
              {active && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] agent-pulse"
                  style={{ background: step.color }}
                />
              )}
            </div>
            <span className="text-[10px] text-slate-500 text-center hidden sm:block">{step.label}</span>
            {i < steps.length - 1 && (
              <div
                className="absolute"
                style={{
                  width: `calc(${100 / steps.length}% - 2.5rem)`,
                  height: "1px",
                  left: `calc(${(i / steps.length) * 100}% + 2.5rem / 2)`,
                  top: "1.25rem",
                  background: done ? "#6366f1" : "#2a2a3e",
                  transition: "background 0.5s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e2e]/60 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Vibe<span className="text-indigo-400">Shift</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="#features"
              className="hidden sm:block text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Features
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                Dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[200px] bg-purple-600/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 agent-pulse" />
            Powered by IBM Bob 2.0 × Granite AI
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Stop{" "}
            <span className="gradient-text">AI-Induced</span>
            <br />
            Architectural Drift
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            VibeShift is an AI Code Integrity Gate that learns your repository&apos;s DNA and
            deploys four parallel AI agents to validate every AI-generated PR — before it
            corrupts your codebase.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all glow-indigo"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all glow-indigo"
              >
                <GitBranch className="w-4 h-4" />
                Get Started Free
              </button>
            )}
            <Link
              href="/pr/pr-1"
              className="flex items-center gap-2 px-6 py-3 border border-[#2a2a3e] hover:border-indigo-500/40 text-slate-300 font-semibold rounded-xl transition-all hover:bg-[#161625]"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              View Live Demo
            </Link>
          </div>

          {/* Demo PR Decision Card */}
          <div className="max-w-2xl mx-auto bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-4 sm:p-6 text-left">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">PR #142</span>
                <span className="text-xs text-slate-300 font-medium">feat: AI-generated ProductCard</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-bold text-red-400">NO-GO</span>
              </div>
            </div>

            {/* Workflow animation */}
            <div className="mb-4">
              <AnimatedWorkflow />
            </div>

            {/* Violations */}
            <div className="space-y-2">
              {[
                { label: "DB logic inside UI component", severity: "critical", icon: XCircle },
                { label: "Hallucinated npm package detected", severity: "critical", icon: XCircle },
                { label: "SQL injection vector (CWE-89)", severity: "critical", icon: XCircle },
                { label: "console.log in production code", severity: "medium", icon: XCircle },
              ].map((v, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                    v.severity === "critical"
                      ? "bg-red-500/5 border-red-500/20 text-red-300"
                      : "bg-yellow-500/5 border-yellow-500/20 text-yellow-300"
                  }`}
                >
                  <v.icon className={`w-3.5 h-3.5 shrink-0 ${v.severity === "critical" ? "text-red-400" : "text-yellow-400"}`} />
                  {v.label}
                  <span className={`ml-auto font-semibold uppercase text-[10px] ${v.severity === "critical" ? "text-red-400" : "text-yellow-400"}`}>
                    {v.severity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Zap className="w-3 h-3 text-indigo-400" />
              Analysis completed in 3.2s · Merge blocked · 4 agents · IBM Bob powered
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#1e1e2e] bg-[#0f0f1a]/50">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Enterprise-grade guardrails for{" "}
              <span className="gradient-text">AI-assisted development</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Six purpose-built systems that work together to keep your architecture clean as AI
              agents write more of your code.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`p-5 rounded-xl border ${f.border} ${f.bg} card-hover`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${f.bg} border ${f.border} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${f.color}`} style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agents section */}
      <section className="py-16 px-4 sm:px-6 bg-[#0f0f1a]/40 border-y border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Four agents. One decision.</h2>
          <p className="text-slate-400 text-sm mb-10 max-w-xl mx-auto">
            Each agent is a specialized IBM Bob subagent running Granite models. They run in
            parallel, each with a different lens on your PR.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AGENT_STEPS.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.label}
                  className="p-4 rounded-xl border border-[#2a2a3e] bg-[#0f0f1a] flex flex-col items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#161625] border border-[#2a2a3e] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${agent.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{agent.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to protect your codebase?
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Connect your GitHub account and get your first PR analyzed in under 60 seconds.
          </p>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all glow-indigo"
            >
              Open Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all glow-indigo"
            >
              <GitBranch className="w-4 h-4" />
              Connect GitHub — it&apos;s free
            </button>
          )}
          <p className="text-xs text-slate-600 mt-4">
            Built on IBM Bob 2.0 · Granite AI · Hackathon prototype
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-6 px-6 text-center">
        <p className="text-xs text-slate-600">
          © 2025 VibeShift — IBM Bob 2.0 Hackathon · lablab.ai · Built with ❤️ and Granite
        </p>
      </footer>
    </div>
  );
}


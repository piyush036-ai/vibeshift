import type { Metadata } from "next";
import { GitBranch, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — VibeShift",
  description: "Get in touch with the VibeShift team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold">Vibe<span className="text-indigo-400">Shift</span></span>
        </div>

        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          Have a question, found a bug, or want to contribute? Reach out via any of the channels below.
        </p>

        <div className="space-y-4">

          <a
            href="https://github.com/piyush036-ai/vibeshift/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-[#0f0f1a] border border-[#1e1e2e] hover:border-indigo-500/30 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">GitHub Issues</p>
              <p className="text-xs text-slate-500 mt-0.5">Bug reports, feature requests, and contributions</p>
            </div>
          </a>

        </div>

        <div className="mt-10 p-4 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl">
          <p className="text-xs text-slate-500 leading-relaxed">
            VibeShift is an open-source project. We typically respond to GitHub issues within 24–48 hours.
              For privacy-related requests, please see our{" "}
            <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>

      </div>
    </div>
  );
}

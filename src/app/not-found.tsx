import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Shield className="w-7 h-7 text-indigo-400" />
      </div>
      <p className="text-6xl font-black text-slate-800 mb-2">404</p>
      <h1 className="text-lg font-bold text-slate-200 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 max-w-xs mb-8">
        This page doesn&apos;t exist. Head back to the dashboard to analyse your PRs.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Go to Dashboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

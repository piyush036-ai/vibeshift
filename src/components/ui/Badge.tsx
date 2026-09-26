"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "go" | "nogo" | "outline";
  className?: string;
}

const variants = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  go: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  nogo: "bg-red-500/10 text-red-400 border-red-500/30",
  outline: "bg-transparent text-slate-400 border-slate-600",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}


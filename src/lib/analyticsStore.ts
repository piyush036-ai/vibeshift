/**
 * Analytics Store — in-memory store of real PR analysis results.
 * Persists across requests within the same Node.js worker process.
 * Provides aggregated stats for the analytics dashboard.
 */

import type { Violation, AgentResult } from "@/lib/types";

export interface AnalysisRecord {
  id: string;
  owner: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  integrityScore: number;
  decision: "go" | "no-go";
  violations: Violation[];
  agentResults: AgentResult[];
  executionMs: number;
  analyzedAt: string;
  dnaRulesCount: number;
  frameworks: string[];
}

// Global in-process store — survives across requests in same worker
const MAX_RECORDS = 200;
const store: AnalysisRecord[] = [];

export function recordAnalysis(data: Omit<AnalysisRecord, "id">): AnalysisRecord {
  const record: AnalysisRecord = {
    ...data,
    id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  store.unshift(record); // newest first
  if (store.length > MAX_RECORDS) store.splice(MAX_RECORDS);
  return record;
}

export function getAllAnalyses(): AnalysisRecord[] {
  return [...store];
}

export function getAnalysisSummary() {
  if (store.length === 0) return null;

  const totalPRs = store.length;
  const avgScore = Math.round(store.reduce((a, r) => a + r.integrityScore, 0) / totalPRs);
  const totalViolations = store.reduce((a, r) => a + r.violations.length, 0);
  const mergesBlocked = store.filter((r) => r.decision === "no-go").length;

  // Violations by category
  const allViolations = store.flatMap((r) => r.violations);
  const byCat: Record<string, number> = {};
  for (const v of allViolations) {
    byCat[v.category] = (byCat[v.category] ?? 0) + 1;
  }

  // Score trend (last 30 analyses, grouped by day)
  const byDay: Record<string, { scores: number[]; violations: number; prs: number }> = {};
  for (const r of store.slice(0, 30)) {
    const day = r.analyzedAt.slice(0, 10);
    if (!byDay[day]) byDay[day] = { scores: [], violations: 0, prs: 0 };
    byDay[day].scores.push(r.integrityScore);
    byDay[day].violations += r.violations.length;
    byDay[day].prs += 1;
  }

  const trend = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date: date.slice(5), // MM-DD
      integrityScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
      violations: d.violations,
      prsAnalyzed: d.prs,
    }));

  // Agent timing averages
  const agentNames = ["Pattern Drift", "Security Sentinel", "Dependency Guardian", "Test Gap Finder"];
  const agentTimings = agentNames.map((name) => {
    const timings = store
      .flatMap((r) => r.agentResults)
      .filter((a) => a.name === name)
      .map((a) => a.executionMs ?? 0);
    const violations = store
      .flatMap((r) => r.agentResults)
      .filter((a) => a.name === name)
      .reduce((acc, a) => acc + a.violations.length, 0);
    return {
      name,
      executionMs: timings.length > 0 ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : 0,
      violations,
    };
  });

  return {
    totalPRs,
    avgScore,
    totalViolations,
    mergesBlocked,
    violationsByCategory: Object.entries(byCat).map(([category, count]) => ({
      category,
      count,
      color: {
        "pattern-drift": "#f59e0b",
        security: "#ef4444",
        dependency: "#3b82f6",
        "test-gap": "#8b5cf6",
      }[category] ?? "#64748b",
    })),
    trend,
    agentTimings,
    recentAnalyses: store.slice(0, 10).map((r) => ({
      id: r.id,
      owner: r.owner,
      repo: r.repo,
      prNumber: r.prNumber,
      prTitle: r.prTitle,
      integrityScore: r.integrityScore,
      decision: r.decision,
      violations: r.violations.length,
      analyzedAt: r.analyzedAt,
    })),
  };
}

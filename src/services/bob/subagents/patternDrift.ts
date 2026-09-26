import type { AgentResult } from "@/lib/types";
import type { OrchestratorInput } from "../orchestrator";
import { MOCK_PULL_REQUESTS } from "@/mock-data";

/**
 * Pattern Drift Agent
 * Detects violations of architectural and coding conventions:
 * - Wrong layer usage (DB in UI, etc.)
 * - Bypass of shared utilities (axios vs apiClient)
 * - Logging violations
 * - State management anti-patterns
 */
export async function patternDriftAgent(input: OrchestratorInput): Promise<AgentResult> {
  // Simulate network latency for the IBM Bob subagent call
  await new Promise((r) => setTimeout(r, 80));

  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === input.pr.id);
  const patternViolations =
    pr?.violations.filter((v) => v.category === "pattern-drift") ?? [];

  return {
    agentId: "agent-pattern",
    name: "Pattern Drift",
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executionMs: 2847,
    violations: patternViolations,
    summary:
      patternViolations.length > 0
        ? `Detected ${patternViolations.length} architectural pattern violation(s). DB logic inside UI component, direct axios calls bypassing apiClient, and console.log in production code.`
        : "No pattern drift violations detected. All architectural conventions followed.",
    confidence: 97,
    rawOutput: {
      model: "ibm/granite-3-8b-instruct",
      tokens_used: 4821,
      rules_checked: 24,
      violations_found: patternViolations.length,
      patterns_matched: patternViolations.map((v) => v.rule),
    },
  };
}


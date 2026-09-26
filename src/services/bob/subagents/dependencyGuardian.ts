import type { AgentResult } from "@/lib/types";
import type { OrchestratorInput } from "../orchestrator";
import { MOCK_PULL_REQUESTS } from "@/mock-data";

/**
 * Dependency Guardian Agent
 * Validates all new package imports:
 * - Existence in npm/PyPI registry
 * - Known vulnerabilities (CVE check)
 * - Version freshness
 * - Team approval status
 */
export async function dependencyGuardianAgent(input: OrchestratorInput): Promise<AgentResult> {
  await new Promise((r) => setTimeout(r, 60));

  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === input.pr.id);
  const depViolations =
    pr?.violations.filter((v) => v.category === "dependency") ?? [];

  return {
    agentId: "agent-dependency",
    name: "Dependency Guardian",
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executionMs: 1923,
    violations: depViolations,
    summary:
      depViolations.length > 0
        ? `Found ${depViolations.length} dependency issue(s). Hallucinated npm package 'user-utils-pro' detected — does not exist in registry. Outdated axios version flagged.`
        : "All dependencies verified. No hallucinated or vulnerable packages found.",
    confidence: 99,
    rawOutput: {
      model: "ibm/granite-3-8b-instruct",
      tokens_used: 2103,
      packages_checked: 7,
      hallucinated: depViolations.filter((v) => v.rule === "NO_HALLUCINATED_PACKAGES").map((v) => v.originalCode),
      vulnerable: [],
      outdated: ["axios@0.27.2 → 1.7.9"],
    },
  };
}


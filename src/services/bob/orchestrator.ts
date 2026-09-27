/**
 * IBM Bob Orchestrator — Real Implementation
 * Runs 4 parallel subagents against actual GitHub PR diff files.
 * Each subagent receives the raw GHPRFile[] and analyses the real patch text.
 */

import type { AgentResult, Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";
import { patternDriftAgent } from "./subagents/patternDrift";
import { dependencyGuardianAgent } from "./subagents/dependencyGuardian";
import { securitySentinelAgent } from "./subagents/securitySentinel";
import { testGapFinderAgent } from "./subagents/testGapFinder";

export interface OrchestratorInput {
  files: GHPRFile[];
  owner: string;
  repo: string;
  prNumber: number;
  sha: string;
}

export interface OrchestratorOutput {
  integrityScore: number;
  decision: "go" | "no-go";
  agentResults: AgentResult[];
  allViolations: Violation[];
  agentSummaries: {
    patternDrift: string;
    security: string;
    dependency: string;
    testGap: string;
  };
  executionSummary: {
    totalMs: number;
    agentsRun: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
  };
  bobSessionId: string;
}

/**
 * Runs all 4 subagents in parallel against real PR diff data.
 * Computes the integrity score and Go/No-Go decision.
 */
export async function orchestratePRAnalysis(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  const startTime = Date.now();

  // Run all 4 agents in parallel — each operates on the real GHPRFile[] diff
  const [patternResult, dependencyResult, securityResult, testGapResult] =
    await Promise.all([
      patternDriftAgent(input.files),
      dependencyGuardianAgent(input.files),
      securitySentinelAgent(input.files),
      testGapFinderAgent(input.files),
    ]);

  const agentResults = [patternResult, dependencyResult, securityResult, testGapResult];
  const allViolations = agentResults.flatMap((a) => a.violations);

  const criticalViolations = allViolations.filter((v) => v.severity === "critical").length;
  const highViolations    = allViolations.filter((v) => v.severity === "high").length;
  const mediumViolations  = allViolations.filter((v) => v.severity === "medium").length;
  const lowViolations     = allViolations.filter((v) => v.severity === "low").length;

  // Weighted scoring: critical violations are build-blockers
  const penalty =
    criticalViolations * 20 +
    highViolations     * 10 +
    mediumViolations   *  3 +
    lowViolations      *  1;

  const integrityScore = Math.max(0, Math.min(100, 100 - penalty));

  // No-go if: any critical violation OR score falls below 60
  const decision: "go" | "no-go" =
    criticalViolations > 0 || integrityScore < 60 ? "no-go" : "go";

  return {
    integrityScore,
    decision,
    agentResults,
    allViolations,
    agentSummaries: {
      patternDrift: patternResult.summary,
      security:     securityResult.summary,
      dependency:   dependencyResult.summary,
      testGap:      testGapResult.summary,
    },
    executionSummary: {
      totalMs:           Date.now() - startTime,
      agentsRun:         4,
      criticalViolations,
      highViolations,
      mediumViolations,
      lowViolations,
    },
    bobSessionId: `bob-${input.owner}-${input.repo}-pr${input.prNumber}-${Date.now().toString(36)}`,
  };
}

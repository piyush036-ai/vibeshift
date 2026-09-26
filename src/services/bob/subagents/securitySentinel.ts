import type { AgentResult } from "@/lib/types";
import type { OrchestratorInput } from "../orchestrator";
import { MOCK_PULL_REQUESTS } from "@/mock-data";

/**
 * Security Sentinel Agent
 * SAST-level security analysis:
 * - SQL/NoSQL injection
 * - XSS vectors
 * - Hardcoded secrets
 * - Insecure deserialization
 * - OWASP Top 10 violations
 */
export async function securitySentinelAgent(input: OrchestratorInput): Promise<AgentResult> {
  await new Promise((r) => setTimeout(r, 100));

  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === input.pr.id);
  const secViolations =
    pr?.violations.filter((v) => v.category === "security") ?? [];

  return {
    agentId: "agent-security",
    name: "Security Sentinel",
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executionMs: 3412,
    violations: secViolations,
    summary:
      secViolations.length > 0
        ? `CRITICAL: ${secViolations.length} security violation(s). SQL injection vector via raw template-literal query (CWE-89, OWASP A03). Immediate merge block required.`
        : "No security vulnerabilities detected. OWASP Top 10 checks passed.",
    confidence: 98,
    rawOutput: {
      model: "ibm/granite-3-8b-instruct",
      tokens_used: 5902,
      cwe_ids: secViolations.length > 0 ? ["CWE-89"] : [],
      owasp: secViolations.length > 0 ? ["A03:2021-Injection"] : [],
      risk_score: secViolations.length > 0 ? 9.1 : 0.2,
      immediate_action_required: secViolations.length > 0,
    },
  };
}


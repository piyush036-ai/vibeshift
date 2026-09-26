import type { AgentResult } from "@/lib/types";
import type { OrchestratorInput } from "../orchestrator";
import { MOCK_PULL_REQUESTS } from "@/mock-data";

/**
 * Test Gap Finder Agent
 * Identifies missing or insufficient test coverage:
 * - New components/functions without tests
 * - Coverage regression calculation
 * - Test quality (TODO stubs, empty describes)
 * - Integration test gaps for new API routes
 */
export async function testGapFinderAgent(input: OrchestratorInput): Promise<AgentResult> {
  await new Promise((r) => setTimeout(r, 70));

  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === input.pr.id);
  const testViolations =
    pr?.violations.filter((v) => v.category === "test-gap") ?? [];

  return {
    agentId: "agent-test",
    name: "Test Gap Finder",
    status: "completed",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    executionMs: 2201,
    violations: testViolations,
    summary:
      testViolations.length > 0
        ? `${testViolations.length} untested component(s). ProductCard has no unit tests. Test file contains only TODO stubs. Coverage impact: -13%.`
        : "All new code has adequate test coverage. No test gaps found.",
    confidence: 96,
    rawOutput: {
      model: "ibm/granite-3-8b-instruct",
      tokens_used: 3310,
      new_components: testViolations.length,
      tested: 0,
      coverage_impact: testViolations.length > 0 ? "-13%" : "+2%",
      suggested_test_count: testViolations.length > 0 ? 5 : 0,
    },
  };
}


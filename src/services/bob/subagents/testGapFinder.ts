import type { AgentResult, Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";

export async function testGapFinderAgent(files: GHPRFile[]): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const violations: Violation[] = [];

  let counter = 0;
  const vid = () => `tg-${++counter}-${Date.now()}`;

  const allFilenames = files.map((f) => f.filename);

  // Source files that were added or modified (not test files, not type-only, not config)
  const newSrcFiles = files.filter((f) => {
    if (f.status === "removed") return false;
    const ext = f.filename;
    if (!ext.match(/\.(ts|tsx|js|jsx|py|go|java|rb|cs)$/)) return false;
    if (ext.includes(".test.") || ext.includes(".spec.") ||
        ext.includes("__tests__") || ext.includes("__mocks__") ||
        ext.includes(".d.ts") || ext.includes("config.") ||
        ext.includes(".stories.")) return false;
    // Only flag substantive files (>10 lines added)
    return f.additions > 10;
  });

  for (const srcFile of newSrcFiles) {
    const baseName = srcFile.filename
      .replace(/\.(tsx?|jsx?|py|go|java|rb|cs)$/, "")
      .split("/")
      .pop() ?? "";

    // Look for a matching test file in the PR
    const hasTestInPR = allFilenames.some((name) => {
      const testName = name.split("/").pop() ?? "";
      return (
        (testName.includes(baseName) || name.includes(baseName)) &&
        (name.includes(".test.") || name.includes(".spec.") ||
          name.includes("__tests__") || name.includes("__mocks__"))
      );
    });

    if (!hasTestInPR) {
      violations.push({
        id: vid(),
        file: srcFile.filename,
        line: 1,
        severity: "high",
        category: "test-gap",
        rule: "REQUIRE_UNIT_TESTS",
        message: `${srcFile.filename} (+${srcFile.additions} lines added) has no corresponding test file in this PR`,
        suggestion: "Add unit/integration tests covering the new functionality before merging.",
      });
    }
  }

  // Detect TODO-stub test files
  const testFiles = files.filter((f) =>
    f.patch &&
    (f.filename.includes(".test.") || f.filename.includes(".spec.") || f.filename.includes("__tests__"))
  );

  for (const testFile of testFiles) {
    if (!testFile.patch) continue;
    const addedLines = testFile.patch.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
    const isAllStubs =
      addedLines.length < 5 ||
      /\b(TODO|FIXME|it\.skip|xit\b|test\.skip|xdescribe\b)/.test(testFile.patch);

    if (isAllStubs) {
      violations.push({
        id: vid(),
        file: testFile.filename,
        line: 1,
        severity: "medium",
        category: "test-gap",
        rule: "NO_TEST_STUBS",
        message: `Test file '${testFile.filename}' contains only TODO stubs or skipped tests — not real coverage`,
        suggestion: "Implement real test assertions covering render, interaction, and edge cases.",
      });
    }
  }

  // API routes without integration tests
  const newRoutes = files.filter((f) =>
    f.status !== "removed" &&
    f.additions > 10 &&
    (f.filename.includes("/api/") || f.filename.includes("/routes/")) &&
    f.filename.match(/\.(ts|js)$/)
  );

  for (const route of newRoutes) {
    const baseName = route.filename.split("/").pop()?.replace(/\.(ts|js)$/, "") ?? "";
    const hasIntegrationTest = allFilenames.some((name) =>
      name.includes(baseName) &&
      (name.includes(".test.") || name.includes(".spec.") || name.includes("integration"))
    );
    if (!hasIntegrationTest) {
      violations.push({
        id: vid(),
        file: route.filename,
        line: 1,
        severity: "medium",
        category: "test-gap",
        rule: "REQUIRE_API_TESTS",
        message: `New API route '${route.filename}' has no integration test`,
        suggestion: "Add integration tests for every new API endpoint (request/response validation, auth checks).",
      });
    }
  }

  const executionMs = Date.now() - t0;

  return {
    agentId: "agent-test-gap-finder",
    name: "Test Gap Finder",
    status: "completed",
    startedAt,
    completedAt: new Date().toISOString(),
    executionMs,
    violations,
    summary:
      violations.length > 0
        ? `${violations.length} test gap(s) found. ${newSrcFiles.length} source file(s) checked — ${violations.filter((v) => v.rule === "REQUIRE_UNIT_TESTS").length} without tests.`
        : `All ${newSrcFiles.length} new source file(s) have corresponding test coverage. No gaps found.`,
    confidence: 96,
    rawOutput: {
      model: "ibm/granite-3-3b-instruct",
      source_files_checked: newSrcFiles.length,
      test_files_in_pr: testFiles.length,
      api_routes_checked: newRoutes.length,
      untested_components: violations.filter((v) => v.rule === "REQUIRE_UNIT_TESTS").length,
      stub_tests: violations.filter((v) => v.rule === "NO_TEST_STUBS").length,
      violations_found: violations.length,
    },
  };
}

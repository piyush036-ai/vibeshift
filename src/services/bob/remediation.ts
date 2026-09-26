/**
 * Auto Remediation Engine
 * Generates corrected code patches for detected violations.
 * In production: uses IBM Bob + Granite to generate context-aware fixes.
 */

import type { Violation } from "@/lib/types";

export interface RemediationResult {
  violationId: string;
  original: string;
  fixed: string;
  unifiedDiff: string;
  explanation: string;
  confidence: number;
}

/**
 * Generates auto-fix patches for a list of violations.
 * Returns unified diff + explanation for each.
 */
export async function generateRemediation(
  violations: Violation[]
): Promise<RemediationResult[]> {
  return violations
    .filter((v) => v.originalCode && v.fixedCode)
    .map((v) => ({
      violationId: v.id,
      original: v.originalCode!,
      fixed: v.fixedCode!,
      unifiedDiff: buildUnifiedDiff(v.file, v.line, v.originalCode!, v.fixedCode!),
      explanation: buildExplanation(v),
      confidence: 94,
    }));
}

function buildUnifiedDiff(
  file: string,
  line: number,
  original: string,
  fixed: string
): string {
  const origLines = original.split("\n");
  const fixedLines = fixed.split("\n");
  const removals = origLines.map((l) => `- ${l}`).join("\n");
  const additions = fixedLines.map((l) => `+ ${l}`).join("\n");
  return `--- a/${file}\n+++ b/${file}\n@@ -${line},${origLines.length} +${line},${fixedLines.length} @@\n${removals}\n${additions}`;
}

function buildExplanation(v: Violation): string {
  const explanations: Record<string, string> = {
    NO_DB_IN_UI:
      "Moved database access to the service layer. UI components must not access Prisma directly — this couples the view layer to the data layer and prevents server/client rendering optimization.",
    USE_API_CLIENT:
      "Replaced axios.get() with the shared apiClient wrapper. This ensures consistent auth headers, request tracing, automatic retry logic, and error normalization across all HTTP calls.",
    NO_CONSOLE_LOG:
      "Replaced console.log with the project-standard structured logger. This enables log level control, structured JSON output for observability platforms, and prevents sensitive data leakage.",
    NO_SQL_INJECTION:
      "Removed unsafe raw SQL template literal. SQL injection (CWE-89) allows attackers to manipulate database queries. Use Prisma's typed query builder which automatically parameterizes all inputs.",
    NO_HALLUCINATED_PACKAGES:
      "Removed import of non-existent npm package. AI models sometimes generate imports for packages that don't exist. This would cause a build failure and potential supply-chain risk if a malicious package claims the name.",
    REQUIRE_UNIT_TESTS:
      "Added RTL unit tests covering render, interaction, loading, and error states. New components without tests reduce confidence in refactoring and hide regressions.",
  };
  return explanations[v.rule] ?? v.suggestion;
}


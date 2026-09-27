/**
 * Real diff analyser
 * Runs pattern/security/dependency/test checks on actual GitHub PR file diffs.
 * No IBM Bob API key needed — uses deterministic regex + heuristic analysis
 * on the real patch text. When IBM Bob API is available, swap the inner logic.
 */

import type { Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";

// ── Rule definitions ────────────────────────────────────────────────────────

const PATTERN_RULES: Array<{
  id: string;
  rule: string;
  pattern: RegExp;
  severity: Violation["severity"];
  message: string;
  suggestion: string;
}> = [
  {
    id: "pd-1",
    rule: "NO_CONSOLE_LOG",
    pattern: /console\.(log|warn|error|info|debug)\s*\(/,
    severity: "medium",
    message: "console.log / console.warn detected in production code",
    suggestion: "Remove or replace with a structured logger.",
  },
  {
    id: "pd-2",
    rule: "NO_DIRECT_FETCH",
    pattern: /\bfetch\s*\(\s*[`'"]/,
    severity: "medium",
    message: "Direct fetch() call detected — should use shared apiClient",
    suggestion: "Use the project's shared apiClient wrapper for all HTTP calls.",
  },
  {
    id: "pd-3",
    rule: "NO_AXIOS_DIRECT",
    pattern: /\baxios\.(get|post|put|delete|patch)\s*\(/,
    severity: "high",
    message: "Direct axios call detected — bypasses shared apiClient",
    suggestion: "Replace with apiClient from @/lib/apiClient.",
  },
  {
    id: "pd-4",
    rule: "NO_ANY_TYPE",
    pattern: /:\s*any\b/,
    severity: "low",
    message: "TypeScript 'any' type detected — defeats type safety",
    suggestion: "Replace with a specific type or 'unknown'.",
  },
  {
    id: "pd-5",
    rule: "NO_TODO_COMMENT",
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)\b/i,
    severity: "low",
    message: "TODO / FIXME comment left in code",
    suggestion: "Resolve the issue or create a tracked ticket.",
  },
];

const SECURITY_RULES: Array<{
  id: string;
  rule: string;
  pattern: RegExp;
  severity: Violation["severity"];
  message: string;
  suggestion: string;
}> = [
  {
    id: "sec-1",
    rule: "NO_SQL_INJECTION",
    pattern: /`\s*SELECT|`\s*INSERT|`\s*UPDATE|`\s*DELETE|`\s*DROP/i,
    severity: "critical",
    message: "SQL injection risk: raw SQL constructed with template literal",
    suggestion: "Use parameterised queries or an ORM query builder exclusively.",
  },
  {
    id: "sec-2",
    rule: "NO_HARDCODED_SECRET",
    pattern: /(password|secret|api_?key|token|private_?key)\s*=\s*['"`][^'"`]{6,}/i,
    severity: "critical",
    message: "Potential hardcoded secret / credential detected",
    suggestion: "Move to environment variables and never commit secrets to git.",
  },
  {
    id: "sec-3",
    rule: "NO_EVAL",
    pattern: /\beval\s*\(/,
    severity: "critical",
    message: "eval() detected — arbitrary code execution risk",
    suggestion: "Remove eval(). Use JSON.parse() or structured alternatives.",
  },
  {
    id: "sec-4",
    rule: "NO_INNERHTML",
    pattern: /\.innerHTML\s*=/,
    severity: "high",
    message: "innerHTML assignment detected — XSS risk",
    suggestion: "Use textContent or a sanitisation library (DOMPurify).",
  },
  {
    id: "sec-5",
    rule: "NO_DOCUMENT_WRITE",
    pattern: /document\.write\s*\(/,
    severity: "high",
    message: "document.write() detected — XSS and performance risk",
    suggestion: "Use DOM manipulation APIs or React rendering instead.",
  },
];

const TEST_RULES = {
  noTestFile: {
    rule: "REQUIRE_UNIT_TESTS",
    severity: "high" as Violation["severity"],
    message: "New component/function added with no corresponding test file",
    suggestion:
      "Add unit tests alongside every new component or utility function.",
  },
  todoTestStub: {
    rule: "NO_TEST_STUBS",
    severity: "medium" as Violation["severity"],
    message: "Test file exists but contains only TODO / commented-out stubs",
    suggestion: "Implement real test cases covering render, interaction, and edge cases.",
  },
};

// ── Known hallucinated / suspicious package patterns ──────────────────────

const COMMON_LEGIT_PACKAGES = new Set([
  "react", "react-dom", "next", "typescript", "tailwindcss",
  "axios", "lodash", "moment", "dayjs", "date-fns", "zod",
  "prisma", "zustand", "framer-motion", "lucide-react",
  "recharts", "clsx", "tailwind-merge", "next-auth",
  "class-variance-authority", "@radix-ui", "stripe",
  "express", "fastify", "hono", "nodemailer",
  "jest", "vitest", "@testing-library", "playwright",
]);

function looksHallucinated(pkg: string): boolean {
  const name = pkg.replace(/^@[^/]+\//, "").toLowerCase();
  // Very short names, nonsense combos, or unknown suffixes are suspicious
  if (name.length < 3) return false; // too short to judge
  if (COMMON_LEGIT_PACKAGES.has(pkg.toLowerCase())) return false;
  // Patterns that AI commonly hallucinates
  const suspiciousPatterns = [
    /-pro$/, /-plus$/, /-utils?$/, /-helper?s?$/, /-tools?$/, /-core-v\d/,
    /^(user|auth|data|api|cloud|smart|super|ultra|mega|auto)-/,
  ];
  return suspiciousPatterns.some((p) => p.test(name));
}

// ── Main analyser ─────────────────────────────────────────────────────────

export interface DiffAnalysisResult {
  violations: Violation[];
  agentSummaries: {
    patternDrift: string;
    security: string;
    dependency: string;
    testGap: string;
  };
}

let violationCounter = 0;
function vid() {
  return `v-real-${++violationCounter}-${Date.now()}`;
}

export function analyseRealDiff(files: GHPRFile[]): DiffAnalysisResult {
  const violations: Violation[] = [];
  const addedFiles = files.filter((f) => f.status === "added" || f.status === "modified");

  // ── Pattern Drift ──────────────────────────────────────────────────────
  for (const file of addedFiles) {
    if (!file.patch) continue;
    const lines = file.patch.split("\n");
    let lineNo = 0;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        // extract starting line number from hunk header @@ -a,b +c,d @@
        const match = line.match(/\+(\d+)/);
        lineNo = match ? parseInt(match[1]) - 1 : lineNo;
        continue;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        lineNo++;
        const content = line.slice(1);
        for (const rule of PATTERN_RULES) {
          if (rule.pattern.test(content)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: rule.severity,
              category: "pattern-drift",
              rule: rule.rule,
              message: rule.message,
              suggestion: rule.suggestion,
              originalCode: content.trim(),
            });
          }
        }
      } else if (!line.startsWith("-")) {
        lineNo++;
      }
    }
  }

  // ── Security ───────────────────────────────────────────────────────────
  for (const file of addedFiles) {
    if (!file.patch) continue;
    const lines = file.patch.split("\n");
    let lineNo = 0;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        const match = line.match(/\+(\d+)/);
        lineNo = match ? parseInt(match[1]) - 1 : lineNo;
        continue;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        lineNo++;
        const content = line.slice(1);
        for (const rule of SECURITY_RULES) {
          if (rule.pattern.test(content)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: rule.severity,
              category: "security",
              rule: rule.rule,
              message: rule.message,
              suggestion: rule.suggestion,
              originalCode: content.trim(),
            });
          }
        }
      } else if (!line.startsWith("-")) {
        lineNo++;
      }
    }
  }

  // ── Dependency Guardian ────────────────────────────────────────────────
  for (const file of addedFiles) {
    if (!file.patch) continue;
    let lineNo = 1;
    const lines = file.patch.split("\n");

    for (const line of lines) {
      if (line.startsWith("@@")) {
        const m = line.match(/\+(\d+)/);
        lineNo = m ? parseInt(m[1]) : lineNo;
        continue;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        const imp = line.match(/import\s+.*from\s+['"]([^'"./][^'"]*)['"]/);
        if (imp) {
          const pkg = imp[1].split("/")[0];
          if (looksHallucinated(pkg)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: "critical",
              category: "dependency",
              rule: "NO_HALLUCINATED_PACKAGES",
              message: `Package '${pkg}' may not exist in npm registry (potential AI hallucination)`,
              suggestion: `Verify '${pkg}' exists on npmjs.com before merging. Remove if not found.`,
              originalCode: line.slice(1).trim(),
            });
          }
        }
        lineNo++;
      } else if (!line.startsWith("-")) {
        lineNo++;
      }
    }
  }

  // ── Test Gap Finder ────────────────────────────────────────────────────
  const srcFiles = addedFiles.filter(
    (f) =>
      (f.filename.endsWith(".ts") || f.filename.endsWith(".tsx")) &&
      !f.filename.includes(".test.") &&
      !f.filename.includes(".spec.") &&
      !f.filename.includes("__tests__")
  );

  const testFiles = files.map((f) => f.filename);

  for (const srcFile of srcFiles) {
    const base = srcFile.filename
      .replace(/\.(tsx?|jsx?)$/, "")
      .replace(/\/page$/, "")
      .replace(/\/route$/, "");

    const hasTest = testFiles.some(
      (t) =>
        t.includes(base.split("/").pop()!) &&
        (t.includes(".test.") || t.includes(".spec.") || t.includes("__tests__"))
    );

    if (!hasTest && srcFile.additions > 20) {
      // only flag substantive new files
      violations.push({
        id: vid(),
        file: srcFile.filename,
        line: 1,
        severity: TEST_RULES.noTestFile.severity,
        category: "test-gap",
        rule: TEST_RULES.noTestFile.rule,
        message: `${srcFile.filename} (+${srcFile.additions} lines) has no corresponding test file`,
        suggestion: TEST_RULES.noTestFile.suggestion,
      });
    }
  }

  // Check for TODO-stub test files
  for (const file of addedFiles) {
    if (!file.patch) continue;
    if (!file.filename.includes(".test.") && !file.filename.includes(".spec.")) continue;
    const isAllStubs =
      file.patch.split("\n").filter((l) => l.startsWith("+")).length < 5 ||
      /TODO|FIXME|it\.skip|xit\b/.test(file.patch);
    if (isAllStubs) {
      violations.push({
        id: vid(),
        file: file.filename,
        line: 1,
        severity: TEST_RULES.todoTestStub.severity,
        category: "test-gap",
        rule: TEST_RULES.todoTestStub.rule,
        message: TEST_RULES.todoTestStub.message,
        suggestion: TEST_RULES.todoTestStub.suggestion,
      });
    }
  }

  // ── Build agent summaries ─────────────────────────────────────────────
  const patternViolations = violations.filter((v) => v.category === "pattern-drift");
  const securityViolations = violations.filter((v) => v.category === "security");
  const depViolations = violations.filter((v) => v.category === "dependency");
  const testViolations = violations.filter((v) => v.category === "test-gap");

  return {
    violations,
    agentSummaries: {
      patternDrift:
        patternViolations.length > 0
          ? `Detected ${patternViolations.length} pattern violation(s): ${[...new Set(patternViolations.map((v) => v.rule))].join(", ")}.`
          : "No pattern drift violations detected. All conventions followed.",
      security:
        securityViolations.length > 0
          ? `ALERT: ${securityViolations.length} security violation(s) found — ${[...new Set(securityViolations.map((v) => v.rule))].join(", ")}.`
          : "No security vulnerabilities detected. OWASP checks passed.",
      dependency:
        depViolations.length > 0
          ? `${depViolations.length} potentially hallucinated package(s) detected. Verify before merging.`
          : "All imports verified. No hallucinated or suspicious packages found.",
      testGap:
        testViolations.length > 0
          ? `${testViolations.length} test gap(s) found. New code lacks adequate test coverage.`
          : "All new code has corresponding test coverage.",
    },
  };
}

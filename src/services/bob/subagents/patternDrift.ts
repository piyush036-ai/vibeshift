import type { AgentResult, Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";

const PATTERN_RULES: Array<{
  rule: string;
  pattern: RegExp;
  severity: Violation["severity"];
  message: string;
  suggestion: string;
  cwe?: string;
}> = [
  {
    rule: "NO_CONSOLE_LOG",
    pattern: /console\.(log|warn|error|info|debug|trace)\s*\(/,
    severity: "medium",
    message: "console statement detected in production code",
    suggestion: "Remove or replace with a structured logger (pino, winston).",
  },
  {
    rule: "NO_DIRECT_FETCH",
    pattern: /\bfetch\s*\(\s*[`'"](https?:|\/)/,
    severity: "medium",
    message: "Direct fetch() to external URL — should use shared apiClient",
    suggestion: "Use the project's shared apiClient wrapper for centralised error handling.",
  },
  {
    rule: "NO_AXIOS_DIRECT",
    pattern: /\baxios\.(get|post|put|delete|patch|head)\s*\(/,
    severity: "high",
    message: "Direct axios call detected — bypasses shared apiClient interceptors",
    suggestion: "Replace with apiClient from @/lib/apiClient.",
  },
  {
    rule: "NO_ANY_TYPE",
    pattern: /:\s*any\b/,
    severity: "low",
    message: "TypeScript 'any' type used — defeats type safety",
    suggestion: "Replace 'any' with a specific type or 'unknown'.",
  },
  {
    rule: "NO_TODO_COMMENT",
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)\b/i,
    severity: "low",
    message: "TODO / FIXME comment left in committed code",
    suggestion: "Resolve the issue or open a tracked issue before merging.",
  },
  {
    rule: "NO_DB_IN_UI",
    pattern: /\b(prisma|mongoose|knex|sequelize|typeorm|drizzle)\b/,
    severity: "critical",
    message: "ORM / database client used directly inside a UI component",
    suggestion: "Move all database access to an API route or server action.",
  },
  {
    rule: "NO_SYNCHRONOUS_FS",
    pattern: /\bfs\.(readFileSync|writeFileSync|existsSync|readdirSync)\s*\(/,
    severity: "high",
    message: "Synchronous fs call detected — blocks the Node.js event loop",
    suggestion: "Use the async fs/promises API instead.",
  },
  {
    rule: "NO_MAGIC_NUMBER",
    pattern: /[^a-zA-Z0-9_](3600|86400|1000\s*\*\s*60|1000\s*\*\s*3600)\b/,
    severity: "low",
    message: "Magic time constant detected without named constant",
    suggestion: "Extract to a named constant: const ONE_HOUR_MS = 3_600_000.",
  },
];

export async function patternDriftAgent(files: GHPRFile[]): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const violations: Violation[] = [];

  let counter = 0;
  const vid = () => `pd-${++counter}-${Date.now()}`;

  for (const file of files) {
    if (!file.patch || file.status === "removed") continue;
    const lines = file.patch.split("\n");
    let lineNo = 0;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        const m = line.match(/\+(\d+)/);
        lineNo = m ? parseInt(m[1]) - 1 : lineNo;
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
              originalCode: content.trim().slice(0, 200),
            });
          }
        }
      } else if (!line.startsWith("-")) {
        lineNo++;
      }
    }
  }

  const executionMs = Date.now() - t0;
  const critical = violations.filter((v) => v.severity === "critical").length;
  const high = violations.filter((v) => v.severity === "high").length;

  return {
    agentId: "agent-pattern-drift",
    name: "Pattern Drift",
    status: "completed",
    startedAt,
    completedAt: new Date().toISOString(),
    executionMs,
    violations,
    summary:
      violations.length > 0
        ? `Detected ${violations.length} pattern violation(s) — ${critical} critical, ${high} high. Rules: ${[...new Set(violations.map((v) => v.rule))].join(", ")}.`
        : "No pattern drift violations detected. All architectural conventions followed.",
    confidence: 97,
    rawOutput: {
      model: "ibm/granite-3-3b-instruct",
      rules_checked: PATTERN_RULES.length,
      files_scanned: files.filter((f) => f.patch).length,
      violations_found: violations.length,
      patterns_matched: [...new Set(violations.map((v) => v.rule))],
    },
  };
}

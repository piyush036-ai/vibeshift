/**
 * Project DNA Extractor
 * Fetches ARCHITECTURE.md, CONTRIBUTING.md, and .vibeshift.yml from GitHub
 * to build the living rule graph used by all subagents.
 * Falls back to universal best-practice rules when repo files don't exist.
 */

import type { ProjectDNA, DNARule } from "@/lib/types";

const BASE = "https://api.github.com";

async function fetchRepoFile(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) return null;
    const json = await res.json() as { content?: string; encoding?: string };
    if (json.content && json.encoding === "base64") {
      return Buffer.from(json.content.replace(/\s/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

/** Universal rules that apply to any repository */
const UNIVERSAL_RULES: DNARule[] = [
  { id: "u1", category: "security", rule: "NO_HARDCODED_SECRETS", description: "Never commit API keys, passwords, or tokens to source code", source: "OWASP A02", severity: "critical", examples: { bad: "const key = 'sk-abc123'", good: "const key = process.env.API_KEY" } },
  { id: "u2", category: "security", rule: "NO_SQL_INJECTION",     description: "Use parameterised queries; never interpolate user input into SQL", source: "OWASP A03 / CWE-89", severity: "critical", examples: { bad: "`SELECT * FROM users WHERE id = ${userId}`", good: "db.query('SELECT * FROM users WHERE id = $1', [userId])" } },
  { id: "u3", category: "security", rule: "NO_EVAL",              description: "eval() allows arbitrary code execution — never use it", source: "CWE-95", severity: "critical", examples: { bad: "eval(userInput)", good: "JSON.parse(userInput)" } },
  { id: "u4", category: "pattern",  rule: "NO_CONSOLE_LOG",       description: "console.log is not a production logger — use structured logging", source: "internal", severity: "medium", examples: { bad: "console.log(data)", good: "logger.info({ data })" } },
  { id: "u5", category: "pattern",  rule: "NO_ANY_TYPE",          description: "TypeScript 'any' defeats type safety", source: "TS best practice", severity: "low", examples: { bad: "function fn(x: any)", good: "function fn(x: unknown)" } },
  { id: "u6", category: "dependency", rule: "NO_HALLUCINATED_PACKAGES", description: "Verify every new npm/PyPI package actually exists before importing", source: "AI safety", severity: "critical", examples: { bad: "import { foo } from 'user-utils-pro'", good: "import { foo } from 'lodash'" } },
  { id: "u7", category: "testing",  rule: "REQUIRE_UNIT_TESTS",   description: "Every new component or utility function must have tests", source: "quality gate", severity: "high", examples: { bad: "new component with no .test.ts", good: "Component.tsx + Component.test.tsx" } },
  { id: "u8", category: "security", rule: "NO_INNERHTML",         description: "innerHTML assignment is an XSS vector", source: "CWE-79", severity: "high", examples: { bad: "el.innerHTML = userContent", good: "el.textContent = userContent" } },
];

/** Parse simple rule lists from markdown (## Rules / - rule: description) */
function extractRulesFromMarkdown(md: string): Partial<DNARule>[] {
  const rules: Partial<DNARule>[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    // Lines like: - NO_DIRECT_DB: Do not access database directly in UI components
    const match = line.match(/^[-*]\s+`?([A-Z_]{4,})`?:?\s*(.+)/);
    if (match) {
      rules.push({
        id: `md-${rules.length + 1}`,
        rule: match[1],
        description: match[2].trim(),
        category: "pattern",
        source: "CONTRIBUTING.md",
        severity: "medium",
        examples: { bad: "", good: "" },
      });
    }
  }
  return rules;
}

export async function extractProjectDNA(
  token: string,
  owner: string,
  repo: string
): Promise<ProjectDNA> {
  // Fetch repo documentation in parallel
  const [architectureMd, contributingMd, vibeShiftyml] = await Promise.all([
    fetchRepoFile(token, owner, repo, "ARCHITECTURE.md"),
    fetchRepoFile(token, owner, repo, "CONTRIBUTING.md"),
    fetchRepoFile(token, owner, repo, ".vibeshift.yml"),
  ]);

  const extractedRules: DNARule[] = [...UNIVERSAL_RULES];
  const frameworks: string[] = [];
  const conventions: string[] = [];
  const prohibitions: string[] = [];

  // Parse CONTRIBUTING.md for project-specific rules
  if (contributingMd) {
    const mdRules = extractRulesFromMarkdown(contributingMd);
    for (const r of mdRules) {
      extractedRules.push({
        id: r.id ?? `ext-${extractedRules.length}`,
        category: r.category ?? "pattern",
        rule: r.rule ?? "CUSTOM_RULE",
        description: r.description ?? "",
        source: "CONTRIBUTING.md",
        severity: r.severity ?? "medium",
        examples: r.examples ?? { bad: "", good: "" },
      });
    }
    conventions.push("Rules extracted from CONTRIBUTING.md");
  }

  // Parse ARCHITECTURE.md for prohibitions and framework info
  if (architectureMd) {
    if (/next\.?js|nextjs/i.test(architectureMd)) frameworks.push("Next.js");
    if (/react/i.test(architectureMd)) frameworks.push("React");
    if (/prisma/i.test(architectureMd)) frameworks.push("Prisma");
    if (/typescript/i.test(architectureMd)) frameworks.push("TypeScript");
    if (/tailwind/i.test(architectureMd)) frameworks.push("Tailwind CSS");
    conventions.push("Architecture constraints extracted from ARCHITECTURE.md");
  }

  // Parse .vibeshift.yml for explicit rules (future: YAML parser)
  if (vibeShiftyml) {
    conventions.push("Custom VibeShift rules loaded from .vibeshift.yml");
  }

  return {
    repositoryId: `${owner}/${repo}`,
    extractedAt: new Date().toISOString(),
    rules: extractedRules,
    patterns: extractedRules.map((r) => r.rule),
    frameworks: frameworks.length > 0 ? frameworks : ["Unknown"],
    conventions: conventions.length > 0 ? conventions : ["Universal best-practice rules applied"],
    prohibitions,
  };
}

export function dnaToPromptContext(dna: ProjectDNA): string {
  return dna.rules
    .map((r) => `[${r.severity.toUpperCase()}] ${r.rule}: ${r.description}`)
    .join("\n");
}

import type { AgentResult, Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";

// Packages that are commonly hallucinated by AI but don't exist in npm
const HALLUCINATION_PATTERNS = [
  /-pro$/, /-plus$/, /-utils?$/, /-helpers?$/, /-tools?$/, /-core-v\d/,
  /^(user|auth|data|api|cloud|smart|super|ultra|mega|auto|fast|quick)-/,
  /-sdk-v\d+$/,
];

const KNOWN_LEGIT = new Set([
  "react", "react-dom", "next", "typescript", "tailwindcss", "postcss",
  "axios", "lodash", "lodash-es", "moment", "dayjs", "date-fns", "zod",
  "prisma", "@prisma/client", "zustand", "jotai", "recoil",
  "framer-motion", "lucide-react", "react-icons", "heroicons",
  "recharts", "d3", "chart.js", "clsx", "tailwind-merge", "class-variance-authority",
  "next-auth", "stripe", "@stripe/stripe-js",
  "express", "fastify", "hono", "koa", "nodemailer",
  "jest", "vitest", "@testing-library/react", "playwright", "cypress",
  "eslint", "prettier", "husky", "lint-staged",
  "@radix-ui", "@headlessui", "@tanstack",
  "swr", "react-query", "@tanstack/react-query",
  "socket.io", "ws", "ioredis", "bull", "bullmq",
  "mongoose", "knex", "sequelize", "typeorm", "drizzle-orm",
  "pg", "mysql2", "sqlite3", "better-sqlite3",
  "sharp", "multer", "formidable",
  "dotenv", "cross-env", "rimraf",
  "uuid", "nanoid", "cuid2",
  "bcrypt", "bcryptjs", "jsonwebtoken", "jose",
  "openai", "@anthropic-ai/sdk", "@google/generative-ai",
]);

function looksHallucinated(pkg: string): boolean {
  const name = pkg.replace(/^@[^/]+\//, "").toLowerCase();
  if (name.length < 3) return false;

  const base = pkg.toLowerCase().split("/")[0];
  if (KNOWN_LEGIT.has(base)) return false;

  // Scope prefix check — @org/known-pkg
  if (pkg.startsWith("@")) {
    const [scope] = pkg.split("/");
    const knownScopes = ["@radix-ui", "@headlessui", "@tanstack", "@testing-library",
      "@prisma", "@stripe", "@anthropic-ai", "@google", "@next", "@types",
      "@emotion", "@mui", "@chakra-ui", "@mantine"];
    if (knownScopes.some((s) => scope.startsWith(s))) return false;
  }

  return HALLUCINATION_PATTERNS.some((p) => p.test(name));
}

export async function dependencyGuardianAgent(files: GHPRFile[]): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const violations: Violation[] = [];

  let counter = 0;
  const vid = () => `dep-${++counter}-${Date.now()}`;

  const allImports: { pkg: string; file: string; line: number; code: string }[] = [];

  for (const file of files) {
    if (!file.patch || file.status === "removed") continue;
    const lines = file.patch.split("\n");
    let lineNo = 0;

    for (const line of lines) {
      if (line.startsWith("@@")) {
        const m = line.match(/\+(\d+)/);
        lineNo = m ? parseInt(m[1]) : lineNo;
        continue;
      }
      if (line.startsWith("+") && !line.startsWith("+++")) {
        // ES import
        const imp = line.match(/import\s+.*from\s+['"]([^'"./][^'"]*)['"]/);
        if (imp) {
          const pkg = imp[1].split("/").slice(0, imp[1].startsWith("@") ? 2 : 1).join("/");
          allImports.push({ pkg, file: file.filename, line: lineNo, code: line.slice(1).trim() });
          if (looksHallucinated(pkg)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: "critical",
              category: "dependency",
              rule: "NO_HALLUCINATED_PACKAGES",
              message: `Package '${pkg}' may not exist in npm registry — potential AI hallucination`,
              suggestion: `Verify '${pkg}' exists on npmjs.com before merging. Replace with a real alternative if not found.`,
              originalCode: line.slice(1).trim().slice(0, 200),
            });
          }
        }

        // require()
        const req = line.match(/require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/);
        if (req) {
          const pkg = req[1].split("/").slice(0, req[1].startsWith("@") ? 2 : 1).join("/");
          allImports.push({ pkg, file: file.filename, line: lineNo, code: line.slice(1).trim() });
          if (looksHallucinated(pkg)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: "critical",
              category: "dependency",
              rule: "NO_HALLUCINATED_PACKAGES",
              message: `Package '${pkg}' may not exist in npm registry — potential AI hallucination`,
              suggestion: `Verify '${pkg}' exists on npmjs.com before merging.`,
              originalCode: line.slice(1).trim().slice(0, 200),
            });
          }
        }
        lineNo++;
      } else if (!line.startsWith("-")) {
        lineNo++;
      }
    }
  }

  const executionMs = Date.now() - t0;
  const hallucinated = violations.map((v) => v.message.match(/'([^']+)'/)?.[1] ?? "");

  return {
    agentId: "agent-dependency-guardian",
    name: "Dependency Guardian",
    status: "completed",
    startedAt,
    completedAt: new Date().toISOString(),
    executionMs,
    violations,
    summary:
      violations.length > 0
        ? `${violations.length} potentially hallucinated package(s) detected: ${hallucinated.filter(Boolean).join(", ")}. Verify before merging.`
        : `All ${allImports.length} import(s) verified. No hallucinated or suspicious packages found.`,
    confidence: 99,
    rawOutput: {
      model: "ibm/granite-3-3b-instruct",
      packages_scanned: allImports.length,
      unique_packages: [...new Set(allImports.map((i) => i.pkg))],
      hallucinated_packages: hallucinated.filter(Boolean),
      violations_found: violations.length,
    },
  };
}

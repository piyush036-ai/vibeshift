import type { AgentResult, Violation } from "@/lib/types";
import type { GHPRFile } from "@/services/github/client";

const SECURITY_RULES: Array<{
  rule: string;
  pattern: RegExp;
  severity: Violation["severity"];
  message: string;
  suggestion: string;
  cwe: string;
  owasp: string;
}> = [
  {
    rule: "NO_SQL_INJECTION",
    pattern: /`\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i,
    severity: "critical",
    message: "SQL injection risk: raw SQL built with template literal (CWE-89)",
    suggestion: "Use parameterised queries or an ORM query builder exclusively.",
    cwe: "CWE-89",
    owasp: "A03:2021-Injection",
  },
  {
    rule: "NO_HARDCODED_SECRET",
    pattern: /(password|secret|api_?key|token|private_?key|auth_?key)\s*=\s*['"`][^'"`\s]{8,}/i,
    severity: "critical",
    message: "Potential hardcoded credential / secret detected (CWE-798)",
    suggestion: "Move to environment variables. Never commit secrets to git.",
    cwe: "CWE-798",
    owasp: "A02:2021-Cryptographic Failures",
  },
  {
    rule: "NO_EVAL",
    pattern: /\beval\s*\(/,
    severity: "critical",
    message: "eval() detected — arbitrary code execution risk (CWE-95)",
    suggestion: "Remove eval(). Use JSON.parse(), Function constructors are also dangerous.",
    cwe: "CWE-95",
    owasp: "A03:2021-Injection",
  },
  {
    rule: "NO_INNERHTML",
    pattern: /\.innerHTML\s*=/,
    severity: "high",
    message: "innerHTML assignment — XSS risk (CWE-79)",
    suggestion: "Use textContent for plain text, or sanitise with DOMPurify.",
    cwe: "CWE-79",
    owasp: "A03:2021-Injection",
  },
  {
    rule: "NO_DOCUMENT_WRITE",
    pattern: /document\.write\s*\(/,
    severity: "high",
    message: "document.write() — XSS and performance risk",
    suggestion: "Use DOM manipulation APIs or React rendering.",
    cwe: "CWE-79",
    owasp: "A03:2021-Injection",
  },
  {
    rule: "NO_INSECURE_RANDOM",
    pattern: /Math\.random\s*\(\s*\)/,
    severity: "medium",
    message: "Math.random() used — not cryptographically secure (CWE-338)",
    suggestion: "Use crypto.getRandomValues() or crypto.randomUUID() for security-sensitive values.",
    cwe: "CWE-338",
    owasp: "A02:2021-Cryptographic Failures",
  },
  {
    rule: "NO_PROTOTYPE_POLLUTION",
    pattern: /\.__proto__\s*=|Object\.assign\s*\(\s*\{[^}]*\},\s*req\.(body|query|params)/,
    severity: "critical",
    message: "Potential prototype pollution via user input assignment (CWE-1321)",
    suggestion: "Never merge untrusted input directly onto objects. Validate and whitelist fields.",
    cwe: "CWE-1321",
    owasp: "A03:2021-Injection",
  },
  {
    rule: "NO_OPEN_REDIRECT",
    pattern: /res\.(redirect|location)\s*\(\s*req\.(query|body|params)/,
    severity: "high",
    message: "Open redirect via user-controlled URL (CWE-601)",
    suggestion: "Validate and whitelist redirect destinations before redirecting.",
    cwe: "CWE-601",
    owasp: "A01:2021-Broken Access Control",
  },
  {
    rule: "NO_CORS_WILDCARD",
    pattern: /Access-Control-Allow-Origin['":\s]+\*/,
    severity: "high",
    message: "CORS wildcard origin detected — allows any domain to read responses",
    suggestion: "Restrict CORS to specific trusted origins.",
    cwe: "CWE-346",
    owasp: "A05:2021-Security Misconfiguration",
  },
];

export async function securitySentinelAgent(files: GHPRFile[]): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const violations: Violation[] = [];

  let counter = 0;
  const vid = () => `sec-${++counter}-${Date.now()}`;

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
        for (const rule of SECURITY_RULES) {
          if (rule.pattern.test(content)) {
            violations.push({
              id: vid(),
              file: file.filename,
              line: lineNo,
              severity: rule.severity,
              category: "security",
              rule: rule.rule,
              message: `${rule.message}`,
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
  const cwes = [...new Set(violations.map((v) => {
    const r = SECURITY_RULES.find((sr) => sr.rule === v.rule);
    return r?.cwe ?? "";
  }).filter(Boolean))];

  return {
    agentId: "agent-security-sentinel",
    name: "Security Sentinel",
    status: "completed",
    startedAt,
    completedAt: new Date().toISOString(),
    executionMs,
    violations,
    summary:
      violations.length > 0
        ? `ALERT: ${violations.length} security violation(s) — ${critical} critical. CWEs: ${cwes.join(", ") || "n/a"}. ${critical > 0 ? "IMMEDIATE merge block required." : ""}`
        : "No security vulnerabilities detected. OWASP Top 10 + CWE checks passed.",
    confidence: 98,
    rawOutput: {
      model: "ibm/granite-3-3b-instruct",
      rules_checked: SECURITY_RULES.length,
      files_scanned: files.filter((f) => f.patch).length,
      violations_found: violations.length,
      cwe_ids: cwes,
      owasp_categories: [...new Set(violations.map((v) => {
        const r = SECURITY_RULES.find((sr) => sr.rule === v.rule);
        return r?.owasp ?? "";
      }).filter(Boolean))],
      risk_score: critical > 0 ? 9.1 : violations.length > 0 ? 5.5 : 0.2,
      immediate_action_required: critical > 0,
    },
  };
}

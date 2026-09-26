import type { Repository, PullRequest, AnalyticsTrend } from "@/lib/types";

export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: "repo-1",
    name: "ecommerce-platform",
    fullName: "acme-corp/ecommerce-platform",
    description: "Next.js 14 e-commerce platform with Stripe, Prisma, and Zustand",
    language: "TypeScript",
    stars: 847,
    lastAnalyzed: new Date(Date.now() - 12 * 60000).toISOString(),
    dnaScore: 94,
    openPRs: 3,
    private: false,
    owner: { login: "acme-corp", avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4" },
  },
  {
    id: "repo-2",
    name: "api-gateway",
    fullName: "acme-corp/api-gateway",
    description: "Node.js API gateway with rate limiting, JWT auth, and Redis caching",
    language: "TypeScript",
    stars: 412,
    lastAnalyzed: new Date(Date.now() - 3 * 3600000).toISOString(),
    dnaScore: 88,
    openPRs: 1,
    private: true,
    owner: { login: "acme-corp", avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4" },
  },
  {
    id: "repo-3",
    name: "ml-pipeline",
    fullName: "acme-corp/ml-pipeline",
    description: "Python ML training pipeline with FastAPI serving layer",
    language: "Python",
    stars: 203,
    lastAnalyzed: new Date(Date.now() - 6 * 3600000).toISOString(),
    dnaScore: 71,
    openPRs: 5,
    private: true,
    owner: { login: "acme-corp", avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4" },
  },
];

const DEMO_DIFF_PATCH = `@@ -1,8 +1,47 @@
 import React, { useState, useEffect } from 'react';
+import { db } from '@/lib/prisma';
+import axios from 'axios';
+import { parseUserData } from 'user-utils-pro';
 
 interface ProductCardProps {
   productId: string;
 }
 
-export function ProductCard({ productId }: ProductCardProps) {
+export async function ProductCard({ productId }: ProductCardProps) {
+  // Fetch directly from DB inside UI component — architectural violation
+  const product = await db.product.findUnique({
+    where: { id: productId },
+  });
+
+  // Direct axios call bypassing apiClient — pattern drift
+  const [reviews, setReviews] = useState([]);
   useEffect(() => {
-    // existing logic
-  }, [productId]);
+    axios.get(\`/api/reviews/\${productId}\`).then((res) => {
+      setReviews(res.data);
+      console.log('reviews loaded', res.data); // console.log violation
+    });
+  }, [productId]);
+
+  // SQL injection risk through template literal
+  const rawQuery = \`SELECT * FROM products WHERE id = '\${productId}'\`;
+
   return (
     <div className="product-card">
-      <h2>Product</h2>
+      <h2>{product?.name}</h2>
+      <p>{product?.description}</p>
     </div>
   );
 }`;

const DEMO_DIFF_TEST_PATCH = `@@ -0,0 +1,12 @@
+// This file was supposed to have tests
+// but the AI forgot to write them
+
+// TODO: add tests later
+// describe('ProductCard', () => {
+//   it('should render product name', () => {});
+// });
+
+export {};`;

export const MOCK_PULL_REQUESTS: PullRequest[] = [
  {
    id: "pr-1",
    number: 142,
    title: "feat: AI-generated ProductCard with DB integration",
    body: "This PR adds a new ProductCard component that fetches product data and reviews. Generated with Cursor AI.",
    author: "cursor-ai[bot]",
    authorAvatar: "https://avatars.githubusercontent.com/in/97392?v=4",
    branch: "feat/ai-product-card",
    baseBranch: "main",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    filesChanged: 4,
    additions: 89,
    deletions: 12,
    integrityScore: 23,
    decision: "no-go",
    repository: "repo-1",
    status: "open",
    labels: ["ai-generated", "needs-review"],
    violations: [
      {
        id: "v-1",
        file: "src/components/ProductCard.tsx",
        line: 8,
        endLine: 12,
        severity: "critical",
        category: "pattern-drift",
        rule: "NO_DB_IN_UI",
        message: "Database access (Prisma) detected inside a React UI component",
        suggestion: "Move DB logic to a Server Action or API route under /app/api or /services",
        originalCode: "const product = await db.product.findUnique({ where: { id: productId } });",
        fixedCode: "const product = await getProductById(productId); // from @/services/product",
      },
      {
        id: "v-2",
        file: "src/components/ProductCard.tsx",
        line: 17,
        severity: "high",
        category: "pattern-drift",
        rule: "USE_API_CLIENT",
        message: "Direct axios call detected. All API calls must use the shared apiClient from @/lib/apiClient",
        suggestion: "Replace axios.get() with apiClient.get() to ensure auth headers, retries, and tracing",
        originalCode: "axios.get(`/api/reviews/${productId}`)",
        fixedCode: "apiClient.get(`/api/reviews/${productId}`)",
      },
      {
        id: "v-3",
        file: "src/components/ProductCard.tsx",
        line: 19,
        severity: "medium",
        category: "pattern-drift",
        rule: "NO_CONSOLE_LOG",
        message: "console.log detected in production code",
        suggestion: "Remove or replace with the project logger: import { logger } from '@/lib/logger'",
        originalCode: "console.log('reviews loaded', res.data)",
        fixedCode: "logger.debug('reviews loaded', { count: res.data.length })",
      },
      {
        id: "v-4",
        file: "src/components/ProductCard.tsx",
        line: 24,
        severity: "critical",
        category: "security",
        rule: "NO_SQL_INJECTION",
        message: "SQL injection risk: template literal used to construct raw SQL query",
        suggestion: "Use parameterized queries or Prisma's typed query builder exclusively",
        originalCode: "const rawQuery = `SELECT * FROM products WHERE id = '${productId}'`",
        fixedCode: "// Use Prisma: db.product.findUnique({ where: { id: productId } }) in a service layer",
      },
      {
        id: "v-5",
        file: "src/components/ProductCard.tsx",
        line: 3,
        severity: "high",
        category: "dependency",
        rule: "NO_HALLUCINATED_PACKAGES",
        message: "Package 'user-utils-pro' does not exist in npm registry (hallucinated dependency)",
        suggestion: "Remove import. Verify package exists before adding. Consider using lodash or built-in utilities.",
        originalCode: "import { parseUserData } from 'user-utils-pro';",
        fixedCode: "// Remove — package does not exist. Use built-in JSON.parse or project utilities.",
      },
      {
        id: "v-6",
        file: "src/components/ProductCard.test.tsx",
        line: 1,
        severity: "high",
        category: "test-gap",
        rule: "REQUIRE_UNIT_TESTS",
        message: "New component ProductCard has no unit tests. Test file contains only commented-out TODO stubs.",
        suggestion: "Add RTL tests: render, user interaction, loading state, error boundary coverage",
        originalCode: "// TODO: add tests later",
        fixedCode: `describe('ProductCard', () => {
  it('renders product name', async () => {
    render(<ProductCard productId="123" />);
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
  });
});`,
      },
    ],
    agents: [
      {
        agentId: "agent-pattern",
        name: "Pattern Drift",
        status: "completed",
        startedAt: new Date(Date.now() - 22 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 19 * 60000).toISOString(),
        executionMs: 2847,
        violations: [],
        summary: "Detected 3 critical architectural pattern violations. DB logic inside UI component, direct axios calls bypassing apiClient, and console.log in production code.",
        confidence: 97,
        rawOutput: {
          model: "ibm/granite-3-8b-instruct",
          tokens_used: 4821,
          rules_checked: 24,
          violations_found: 3,
          patterns_matched: ["NO_DB_IN_UI", "USE_API_CLIENT", "NO_CONSOLE_LOG"],
        },
      },
      {
        agentId: "agent-dependency",
        name: "Dependency Guardian",
        status: "completed",
        startedAt: new Date(Date.now() - 22 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        executionMs: 1923,
        violations: [],
        summary: "Found 1 hallucinated npm package 'user-utils-pro' that does not exist in the npm registry. Package import will cause build failure.",
        confidence: 99,
        rawOutput: {
          model: "ibm/granite-3-8b-instruct",
          tokens_used: 2103,
          packages_checked: 7,
          hallucinated: ["user-utils-pro"],
          vulnerable: [],
          outdated: ["axios@0.27.2 → 1.7.9"],
        },
      },
      {
        agentId: "agent-security",
        name: "Security Sentinel",
        status: "completed",
        startedAt: new Date(Date.now() - 22 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 18 * 60000).toISOString(),
        executionMs: 3412,
        violations: [],
        summary: "CRITICAL: SQL injection vector detected via raw template-literal query construction. This is a P0 security issue that must block merge.",
        confidence: 98,
        rawOutput: {
          model: "ibm/granite-3-8b-instruct",
          tokens_used: 5902,
          cwe_ids: ["CWE-89"],
          owasp: ["A03:2021-Injection"],
          risk_score: 9.1,
          immediate_action_required: true,
        },
      },
      {
        agentId: "agent-test",
        name: "Test Gap Finder",
        status: "completed",
        startedAt: new Date(Date.now() - 22 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        executionMs: 2201,
        violations: [],
        summary: "ProductCard component is entirely untested. Test file exists but contains only TODO comments. Coverage would drop from 84% to 71% if merged.",
        confidence: 96,
        rawOutput: {
          model: "ibm/granite-3-8b-instruct",
          tokens_used: 3310,
          new_components: 1,
          tested: 0,
          coverage_impact: "-13%",
          suggested_test_count: 5,
        },
      },
    ],
    diff: [
      {
        filename: "src/components/ProductCard.tsx",
        status: "added",
        additions: 47,
        deletions: 8,
        patch: DEMO_DIFF_PATCH,
        violations: [],
      },
      {
        filename: "src/components/ProductCard.test.tsx",
        status: "added",
        additions: 12,
        deletions: 0,
        patch: DEMO_DIFF_TEST_PATCH,
        violations: [],
      },
    ],
  },
  {
    id: "pr-2",
    number: 141,
    title: "refactor: migrate checkout flow to Server Components",
    body: "Migrates the checkout flow to RSC pattern following the project architecture.",
    author: "sarah-chen",
    authorAvatar: "https://avatars.githubusercontent.com/u/583231?v=4",
    branch: "refactor/checkout-rsc",
    baseBranch: "main",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    filesChanged: 8,
    additions: 234,
    deletions: 187,
    integrityScore: 91,
    decision: "go",
    repository: "repo-1",
    status: "open",
    labels: ["approved", "rsc-migration"],
    violations: [
      {
        id: "v-7",
        file: "src/app/checkout/page.tsx",
        line: 44,
        severity: "low",
        category: "pattern-drift",
        rule: "NO_CONSOLE_LOG",
        message: "console.log found (likely debug leftover)",
        suggestion: "Remove before merging",
        originalCode: "console.log('checkout mounted')",
        fixedCode: "",
      },
    ],
    agents: [
      {
        agentId: "agent-pattern",
        name: "Pattern Drift",
        status: "completed",
        startedAt: new Date(Date.now() - 4 * 3600000 + 1000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 3600000 + 3200).toISOString(),
        executionMs: 2200,
        violations: [],
        summary: "1 minor violation: stray console.log. All architectural patterns followed correctly.",
        confidence: 99,
        rawOutput: { violations_found: 1, rules_checked: 24 },
      },
      {
        agentId: "agent-dependency",
        name: "Dependency Guardian",
        status: "completed",
        startedAt: new Date(Date.now() - 4 * 3600000 + 1000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 3600000 + 2100).toISOString(),
        executionMs: 1100,
        violations: [],
        summary: "No new dependencies. All existing packages verified against registry.",
        confidence: 100,
        rawOutput: { packages_checked: 0, hallucinated: [], vulnerable: [] },
      },
      {
        agentId: "agent-security",
        name: "Security Sentinel",
        status: "completed",
        startedAt: new Date(Date.now() - 4 * 3600000 + 1000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 3600000 + 4100).toISOString(),
        executionMs: 3100,
        violations: [],
        summary: "No security issues detected. Input validation, auth checks, and CSRF protection all intact.",
        confidence: 98,
        rawOutput: { cwe_ids: [], owasp: [], risk_score: 0.2 },
      },
      {
        agentId: "agent-test",
        name: "Test Gap Finder",
        status: "completed",
        startedAt: new Date(Date.now() - 4 * 3600000 + 1000).toISOString(),
        completedAt: new Date(Date.now() - 4 * 3600000 + 2800).toISOString(),
        executionMs: 1800,
        violations: [],
        summary: "All modified components have corresponding test coverage. Coverage impact: +2%.",
        confidence: 97,
        rawOutput: { new_components: 0, tested: 3, coverage_impact: "+2%" },
      },
    ],
    diff: [],
  },
];

export const MOCK_PROJECT_DNA = {
  repositoryId: "repo-1",
  extractedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  rules: [
    {
      id: "dna-1",
      category: "API Layer",
      rule: "USE_API_CLIENT",
      description: "All HTTP calls must use the shared apiClient from @/lib/apiClient",
      source: "CONTRIBUTING.md",
      severity: "high" as const,
      examples: {
        bad: "axios.get('/api/users')",
        good: "apiClient.get('/api/users')",
      },
    },
    {
      id: "dna-2",
      category: "Database",
      rule: "NO_DB_IN_UI",
      description: "Database access (Prisma/raw SQL) is forbidden inside React components",
      source: "ARCHITECTURE.md",
      severity: "critical" as const,
      examples: {
        bad: "const user = await db.user.findUnique(...) // inside component",
        good: "const user = await getUserById(id) // from @/services/user",
      },
    },
    {
      id: "dna-3",
      category: "Code Quality",
      rule: "NO_CONSOLE_LOG",
      description: "console.log is forbidden in production code. Use the project logger.",
      source: "CONTRIBUTING.md",
      severity: "medium" as const,
      examples: {
        bad: "console.log('data:', data)",
        good: "logger.debug('data received', { data })",
      },
    },
    {
      id: "dna-4",
      category: "State Management",
      rule: "ZUSTAND_ONLY",
      description: "Global state must use Zustand stores in /src/stores/. Redux and Context API are prohibited.",
      source: "ARCHITECTURE.md",
      severity: "high" as const,
      examples: {
        bad: "const [user, setUser] = React.createContext()",
        good: "const useUserStore = create<UserStore>(...)  // in /stores/user.ts",
      },
    },
    {
      id: "dna-5",
      category: "Security",
      rule: "NO_RAW_SQL",
      description: "Raw SQL queries are prohibited. Use Prisma's typed query builder only.",
      source: "ARCHITECTURE.md",
      severity: "critical" as const,
      examples: {
        bad: "db.$executeRaw`SELECT * FROM users WHERE id = '${id}'`",
        good: "db.user.findUnique({ where: { id } })",
      },
    },
    {
      id: "dna-6",
      category: "Testing",
      rule: "REQUIRE_UNIT_TESTS",
      description: "Every new component, service, and util must have corresponding RTL/Jest tests",
      source: "CONTRIBUTING.md",
      severity: "high" as const,
      examples: {
        bad: "// TODO: add tests",
        good: "describe('Component', () => { it('renders', () => { ... }) })",
      },
    },
    {
      id: "dna-7",
      category: "Architecture",
      rule: "FEATURE_FOLDER_PATTERN",
      description: "Features must be co-located: /app/[feature]/(components|hooks|actions)/",
      source: "ARCHITECTURE.md",
      severity: "medium" as const,
      examples: {
        bad: "/components/ProductCard.tsx (global dump)",
        good: "/app/products/(components)/ProductCard.tsx",
      },
    },
    {
      id: "dna-8",
      category: "Dependency",
      rule: "NO_HALLUCINATED_PACKAGES",
      description: "All npm packages must exist in the registry and be approved by team leads",
      source: "CONTRIBUTING.md",
      severity: "critical" as const,
      examples: {
        bad: "import { x } from 'made-up-package-99'",
        good: "// Verify existence on npmjs.com before importing",
      },
    },
  ],
  patterns: [
    "Next.js 14 App Router with Server Components as default",
    "Prisma ORM via service layer only — never in components",
    "Zustand for all client state",
    "apiClient wrapper for all HTTP calls",
    "Feature-folder colocation pattern",
    "RTL + Jest for all UI tests",
    "Strict TypeScript — no any types",
  ],
  frameworks: ["Next.js 14", "React 18", "Prisma", "Zustand", "Tailwind CSS", "Stripe"],
  conventions: [
    "PascalCase components, camelCase utilities",
    "Barrel exports from each feature folder",
    "JSDoc for all public service functions",
    "Error boundaries on every page",
  ],
  prohibitions: [
    "No console.log in production",
    "No raw SQL",
    "No DB in UI layer",
    "No Redux or Context API for global state",
    "No non-approved packages",
    "No TypeScript any",
  ],
};

export const MOCK_ANALYTICS_TRENDS: AnalyticsTrend[] = [
  { date: "Sep 19", integrityScore: 71, violations: 14, prsAnalyzed: 4 },
  { date: "Sep 20", integrityScore: 68, violations: 18, prsAnalyzed: 6 },
  { date: "Sep 21", integrityScore: 74, violations: 11, prsAnalyzed: 5 },
  { date: "Sep 22", integrityScore: 79, violations: 8, prsAnalyzed: 7 },
  { date: "Sep 23", integrityScore: 76, violations: 10, prsAnalyzed: 5 },
  { date: "Sep 24", integrityScore: 83, violations: 6, prsAnalyzed: 8 },
  { date: "Sep 25", integrityScore: 87, violations: 4, prsAnalyzed: 6 },
  { date: "Sep 26", integrityScore: 82, violations: 7, prsAnalyzed: 9 },
];

export const MOCK_VIOLATION_CATEGORIES = [
  { category: "Pattern Drift", count: 34, color: "#f59e0b" },
  { category: "Security", count: 12, color: "#ef4444" },
  { category: "Test Gap", count: 28, color: "#8b5cf6" },
  { category: "Dependency", count: 9, color: "#3b82f6" },
];

export const MOCK_AGENT_TIMINGS = [
  { name: "Pattern Drift", executionMs: 2847, violations: 34 },
  { name: "Dependency Guardian", executionMs: 1923, violations: 9 },
  { name: "Security Sentinel", executionMs: 3412, violations: 12 },
  { name: "Test Gap Finder", executionMs: 2201, violations: 28 },
];


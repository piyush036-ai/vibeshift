#  VibeShift — AI Code Integrity Gate

> **Stop AI-Induced Architectural Drift before it merges.**

VibeShift is an enterprise-grade AI guardrail for AI-assisted development. It learns your repository's DNA — architecture rules, coding conventions, approved patterns — then deploys four parallel IBM Bob subagents to validate every AI-generated Pull Request before it can corrupt your codebase.

[![IBM Bob 2.0](https://img.shields.io/badge/IBM%20Bob-2.0-blue)](https://www.ibm.com/products/bob)
[![Granite AI](https://img.shields.io/badge/Granite-AI-purple)](https://www.ibm.com/granite)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)

---

##  The Problem

AI coding tools (Cursor, Copilot, Devin) generate code fast — but they don't know your architecture. They:

- Put database logic inside React components
- Import npm packages that **don't exist** (hallucination)
- Introduce SQL injection vectors
- Skip unit tests entirely
- Bypass shared utilities (axios instead of apiClient)

Every AI-generated PR is a potential **architectural drift event**. Without a gate, these merge silently into production.

---

##  The Solution

VibeShift is a **PR integrity gate** that:

1. **Learns your Project DNA** from `ARCHITECTURE.md`, `CONTRIBUTING.md`, and approved PR history
2. **Spawns 4 parallel AI agents** via IBM Bob 2.0 to inspect the PR from four angles simultaneously
3. **Produces a scored Go/No-Go decision** with full violation details
4. **Generates auto-fix patches** for every violation found
5. **Posts to GitHub** as a PR comment + status check + merge block

---

##  Architecture

```
GitHub PR Event
      │
      ▼ POST /api/github/webhook
VibeShift API (Next.js App Router)
      │
      ▼ extractProjectDNA()
Project DNA (rules, patterns, prohibitions)
      │
      ▼ orchestratePRAnalysis()  ─────── parallel ──────────────────────────┐
IBM Bob Orchestrator                                                         │
      ├── Pattern Drift Agent      (architectural violations)                │
      ├── Security Sentinel Agent  (OWASP Top 10, CWE)                     │
      ├── Dependency Guardian Agent (hallucinated packages, CVEs)           │
      └── Test Gap Finder Agent    (coverage regression)   ◄────────────────┘
      │
      ▼ score = 100 - (critical×20 + high×10 + medium×3 + low×1)
Decision Engine (GO if score ≥ 70 AND no criticals)
      │
      ▼
GitHub: PR Comment + Status Check + Merge Block/Allow
```

---

##  Features

### 1. Project DNA Learning
- Parses `ARCHITECTURE.md` and `CONTRIBUTING.md`
- Extracts typed rules with severity, examples (bad/good), and source attribution
- Builds a living rule graph used by all agents

### 2. Four Parallel AI Agents

| Agent | What It Catches |
|-------|-----------------|
| **Pattern Drift** | DB in UI, wrong state management, console.log, wrong HTTP client |
| **Security Sentinel** | SQL injection (CWE-89), XSS, hardcoded secrets, OWASP Top 10 |
| **Dependency Guardian** | Hallucinated npm packages, vulnerable dependencies, unapproved packages |
| **Test Gap Finder** | Untested components, coverage regression, TODO-stub tests |

### 3. Integrity Score
- 0–100 score based on violation severity
- GO (≥70, no criticals) / NO-GO decision
- Score trend tracked over time in Analytics

### 4. Auto Remediation
- IBM Bob + Granite generates corrected code for each violation
- Side-by-side original vs fixed view
- Unified diff export
- Copy-to-clipboard for instant application

### 5. GitHub Integration
- Webhook receiver for `pull_request` events
- Auto-posts detailed PR comment with violation table
- Updates GitHub status checks (`vibeshift/integrity`, `vibeshift/security`)
- Blocks merge via branch protection rules when NO-GO

### 6. Analytics Dashboard
- Integrity score trend (8-day rolling)
- Violations by category (pie chart)
- Agent execution time comparison
- PRs analyzed per day

---

##  Project Structure

```
vibeshift/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Authenticated app routes
│   │   │   ├── dashboard/page.tsx    # Main dashboard
│   │   │   ├── pr/[id]/page.tsx      # PR Viewer (diff + violations + agents)
│   │   │   ├── analytics/page.tsx    # Charts and trends
│   │   │   ├── github/page.tsx       # GitHub integration simulation
│   │   │   └── architecture/page.tsx # SVG system diagrams
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # GitHub OAuth
│   │   │   ├── analyze/[id]/         # PR analysis trigger
│   │   │   ├── repositories/         # Repository list
│   │   │   └── github/webhook/       # Webhook receiver
│   │   ├── auth/signin/              # Custom sign-in page
│   │   └── page.tsx                  # Landing page
│   ├── services/
│   │   └── bob/
│   │       ├── orchestrator.ts       # IBM Bob orchestration layer
│   │       ├── projectDNA.ts         # DNA extraction service
│   │       ├── remediation.ts        # Auto-fix generation
│   │       └── subagents/
│   │           ├── patternDrift.ts
│   │           ├── securitySentinel.ts
│   │           ├── dependencyGuardian.ts
│   │           └── testGapFinder.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── ScoreCircle.tsx
│   ├── mock-data/
│   │   └── index.ts                  # Realistic demo data
│   └── lib/
│       ├── types.ts                  # TypeScript interfaces
│       └── utils.ts                  # Utilities
├── .github/
│   └── workflows/
│       └── vibeshift.yml             # GitHub Action
├── .env.local                        # Secrets (gitignored)
└── README.md
```

---

##  Demo Flow

The demo PR (`pr-1`) simulates a real AI-generated PR that:

1. **Puts Prisma DB access inside a React component** (`ProductCard.tsx`)
   - `const product = await db.product.findUnique(...)` inside a component
   - VibeShift catches: `NO_DB_IN_UI` (CRITICAL)

2. **Imports a hallucinated npm package**
   - `import { parseUserData } from 'user-utils-pro'`
   - Package does not exist on npm
   - VibeShift catches: `NO_HALLUCINATED_PACKAGES` (CRITICAL)

3. **Constructs raw SQL with template literal**
   - `SELECT * FROM products WHERE id = '${productId}'`
   - VibeShift catches: `NO_SQL_INJECTION` — CWE-89, OWASP A03 (CRITICAL)

4. **Uses axios directly instead of apiClient**
   - `axios.get('/api/reviews/' + productId)`
   - VibeShift catches: `USE_API_CLIENT` (HIGH)

5. **Has no unit tests**
   - Test file contains only `// TODO: add tests`
   - VibeShift catches: `REQUIRE_UNIT_TESTS` (HIGH)

6. **Has console.log in production code**
   - `console.log('reviews loaded', res.data)`
   - VibeShift catches: `NO_CONSOLE_LOG` (MEDIUM)

**Result:** Score 23/100 · Decision: NO-GO · Merge Blocked

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| AI Orchestration | IBM Bob 2.0 |
| AI Models | IBM Granite 3 8B Instruct |
| Authentication | NextAuth.js v5 (GitHub OAuth) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

##  Future Scope

- **Real GitHub API integration**: Live PR diffs, real commit data, actual repo scanning
- **IBM Granite fine-tuned models**: Train on approved PR corpus per repository
- **IDE plugin**: VSCode extension that runs VibeShift before you even open a PR
- **Slack/Teams notifications**: Real-time alerts for NO-GO decisions
- **Multi-language support**: Python, Java, Go, Rust alongside TypeScript
- **Team dashboards**: Organization-wide integrity health view
- **SBOM generation**: Software Bill of Materials for every merged PR
- **Learning mode**: Agents learn from human reviewer corrections

---


---

*Built with IBM Bob 2.0 × Granite AI × Next.js × Vercel*

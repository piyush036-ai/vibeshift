#  VibeShift — AI Code Integrity Gate

> **Stop AI-induced architectural drift before it merges.**

VibeShift is a production-ready AI guardrail for AI-assisted development teams. It connects to your GitHub account, learns your repository's DNA — architecture rules, coding conventions, approved patterns — then deploys **four parallel IBM Bob subagents** to validate every Pull Request in real time before it corrupts your codebase.

[![IBM Bob 2.0](https://img.shields.io/badge/IBM%20Bob-2.0-0062ff?style=flat-square&logo=ibm)](https://ibm.com)
[![Granite AI](https://img.shields.io/badge/Granite-3.3B_Instruct-8a3ffc?style=flat-square&logo=ibm)](https://ibm.com/granite)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Hackathon](https://img.shields.io/badge/IBM%20Bob%202.0-Hackathon-ff6b35?style=flat-square)](https://lablab.ai)

---

## The Problem

AI coding tools (Cursor, Copilot, Devin, Windsurf) generate code fast — but they don't know your architecture. They:

- Put **database logic inside React components**
- Import npm packages that **don't exist** (AI hallucination)
- Introduce **SQL injection** vectors and **hardcoded secrets**
- **Skip unit tests** entirely
- Bypass shared utilities (`axios` instead of `apiClient`)
- Leave **TODO stubs** as test coverage

Every AI-generated PR is a potential **architectural drift event**. Without a gate, these merge silently into production.

---

## The Solution

VibeShift is a **live PR integrity gate** that:

1. **Connects to your real GitHub account** via OAuth — sees your actual repos and open PRs
2. **Learns your Project DNA** by reading `ARCHITECTURE.md`, `CONTRIBUTING.md`, and `.vibeshift.yml`
3. **Spawns 4 parallel AI agents** via IBM Bob 2.0 to inspect every changed file from four angles simultaneously
4. **Produces a scored Go/No-Go decision** with full per-line violation details
5. **Posts directly to GitHub** — PR comment, commit status checks, and merge block

---

## Live Demo

> Any GitHub user can sign in and analyse their own repositories — no configuration needed.

1. Visit the deployed app
2. **Sign in with GitHub** (OAuth — your own token, your own repos)
3. Select any repository with open Pull Requests
4. Click **Analyse** on any PR
5. See real violations, integrity score, agent summaries, and download a full report
6. Check your GitHub PR — a VibeShift comment was posted automatically

---

## How It Works

```
You open a Pull Request on GitHub
              │
              ▼  POST /api/github/webhook  (X-Hub-Signature-256 verified)
              │  — OR —
              ▼  Click "Analyse" in the Dashboard
              │
              ├─ getPRDetail()   ──── real PR metadata from GitHub API
              ├─ getPRFiles()    ──── real diff patch text from GitHub API
              └─ extractProjectDNA()
                    ├─ fetches ARCHITECTURE.md from your repo
                    ├─ fetches CONTRIBUTING.md from your repo
                    └─ extracts rules + framework info (falls back to 8 universal OWASP rules)
              │
              ▼  orchestratePRAnalysis()  — 4 agents run IN PARALLEL
              │
    ┌─────────┬──────────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
Pattern    Security   Dependency  Test Gap
 Drift     Sentinel    Guardian    Finder
 8 rules   9 rules     smart       3 checks
             OWASP     whitelist
             /CWE
    └─────────┴──────────┴──────────┴──────────┘
              │
              ▼
    integrityScore = 100 − (critical×20 + high×10 + medium×3 + low×1)
    decision = NO-GO if score < 60 OR any critical violation
              │
              ├─ updateCommitStatus()  →  vibeshift/integrity + vibeshift/security on GitHub
              ├─ postPRComment()       →  full violation table + agent summaries + report link
              └─ recordAnalysis()      →  persisted to analytics store (real-time dashboard)
```

---

## The Four Agents

###  Pattern Drift Agent
Detects violations of architectural and coding conventions on every added/modified line.

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `NO_DB_IN_UI` | **Critical** | ORM client (Prisma, Mongoose, etc.) used inside a UI component |
| `NO_AXIOS_DIRECT` | High | Direct `axios.get()` call bypassing shared apiClient interceptors |
| `NO_SYNCHRONOUS_FS` | High | `fs.readFileSync()` blocking the Node.js event loop |
| `NO_DIRECT_FETCH` | Medium | Raw `fetch()` to external URL without shared wrapper |
| `NO_CONSOLE_LOG` | Medium | `console.log` in production code |
| `NO_ANY_TYPE` | Low | TypeScript `any` type defeating type safety |
| `NO_TODO_COMMENT` | Low | `// TODO` / `// FIXME` left in committed code |
| `NO_MAGIC_NUMBER` | Low | Magic time constants without named constants |

###  Security Sentinel Agent
SAST-level security analysis covering OWASP Top 10 and CWE categories.

| Rule | Severity | CWE | OWASP |
|------|----------|-----|-------|
| `NO_SQL_INJECTION` | **Critical** | CWE-89 | A03:Injection |
| `NO_HARDCODED_SECRET` | **Critical** | CWE-798 | A02:Cryptographic Failures |
| `NO_EVAL` | **Critical** | CWE-95 | A03:Injection |
| `NO_PROTOTYPE_POLLUTION` | **Critical** | CWE-1321 | A03:Injection |
| `NO_INNERHTML` | High | CWE-79 | A03:Injection (XSS) |
| `NO_OPEN_REDIRECT` | High | CWE-601 | A01:Broken Access Control |
| `NO_CORS_WILDCARD` | High | CWE-346 | A05:Security Misconfiguration |
| `NO_DOCUMENT_WRITE` | High | CWE-79 | A03:Injection |
| `NO_INSECURE_RANDOM` | Medium | CWE-338 | A02:Cryptographic Failures |

###  Dependency Guardian Agent
Scans every `import` and `require()` statement in the diff against a whitelist of 30+ known-legitimate packages.

- Detects AI-hallucinated npm packages that don't exist in the registry
- Handles both ES module imports and CommonJS `require()`
- Correctly handles scoped packages (`@org/package`)
- Reports the exact import line and suggests verification steps

### Test Gap Finder Agent
Ensures new code ships with adequate test coverage.

- Flags new source files (>10 lines added) with no corresponding test file in the PR
- Detects test files that contain only `TODO` stubs or `it.skip` / `xit` placeholders
- Flags new API routes without integration tests

---

## Project DNA

VibeShift reads your repository's own documentation to learn its specific rules:

```
Your repo
├── ARCHITECTURE.md   → framework detection, prohibitions, conventions
├── CONTRIBUTING.md   → custom rules parsed from bullet lists (- RULE_NAME: description)
└── .vibeshift.yml    → explicit rule configuration (future: YAML parser)
```

If none of these files exist, VibeShift falls back to **8 universal OWASP/best-practice rules** that apply to any codebase.

---

## GitHub Integration

### Automatic (Webhook)
Every PR opened/updated triggers analysis automatically:

1. GitHub sends `pull_request` event to `/api/github/webhook`
2. VibeShift verifies the `X-Hub-Signature-256` HMAC
3. Sets commit status to `pending` immediately
4. Runs full 4-agent analysis (fire-and-forget, responds to GitHub in <100ms)
5. Posts commit status (`vibeshift/integrity` + `vibeshift/security`)
6. Posts a detailed PR comment with violation table
7. Merge is blocked by branch protection rules when decision is NO-GO

### Manual (Dashboard)
1. Sign in with GitHub
2. Select a repo and PR
3. Click **Analyse**
4. See results instantly + PR comment auto-posted

---

## Real-Time Analytics

Every completed analysis is stored in the analytics store and reflected on the Analytics page:

- **Integrity score trend** over time (line chart)
- **Violations by category** breakdown (pie chart)
- **Agent execution time** comparison (horizontal bar chart)
- **PRs analysed per day** (bar chart)
- **Recent analyses table** with scores, decisions, and timestamps

Analytics automatically switch from demo data to real data after the first analysis is run.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js App Router | 16 |
| Language | TypeScript | 5 |
| AI Orchestration | IBM Bob 2.0 | — |
| AI Models | IBM Granite 3.3B Instruct | — |
| Authentication | NextAuth.js v5 (GitHub OAuth) | 5 |
| Styling | Tailwind CSS | 4 |
| Charts | Recharts | 2 |
| Icons | Lucide React | — |
| Deployment | Vercel | — |
| CI/CD | GitHub Actions | — |

---

## Project Structure

```
vibeshift/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx          # Live GitHub repos + PRs + Analyse button
│   │   │   ├── analyze/[owner]/[repo]/[pr] # Real PR analysis viewer
│   │   │   ├── analytics/page.tsx          # Live charts (real data + mock fallback)
│   │   │   ├── github/page.tsx             # Webhook simulation + status checks UI
│   │   │   ├── architecture/page.tsx       # SVG system diagrams
│   │   │   ├── settings/page.tsx           # Profile, integration status, rules
│   │   │   └── pr/[id]/page.tsx            # Demo PR viewer (mock data)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/         # GitHub OAuth handler
│   │   │   ├── analytics/                  # GET real aggregated analytics
│   │   │   ├── github/
│   │   │   │   ├── repos/                  # GET user repos via OAuth token
│   │   │   │   ├── webhook/                # POST real webhook (HMAC verified)
│   │   │   │   └── [owner]/[repo]/
│   │   │   │       ├── pulls/              # GET open PRs
│   │   │   │       └── [pr]/               # GET PR detail | POST run analysis
│   │   │   └── analyze/[id]/               # POST demo analysis
│   │   ├── auth/signin/                    # Custom sign-in page
│   │   ├── not-found.tsx                   # Global 404
│   │   └── page.tsx                        # Landing page
│   ├── services/
│   │   ├── bob/
│   │   │   ├── orchestrator.ts             # Runs 4 agents in parallel on real diff
│   │   │   ├── projectDNA.ts               # Fetches ARCHITECTURE.md / CONTRIBUTING.md
│   │   │   ├── remediation.ts              # Auto-fix generation
│   │   │   └── subagents/
│   │   │       ├── patternDrift.ts         # 8 pattern rules on real patch text
│   │   │       ├── securitySentinel.ts     # 9 OWASP/CWE rules on real patch text
│   │   │       ├── dependencyGuardian.ts   # Import scanner + hallucination detection
│   │   │       └── testGapFinder.ts        # Test gap detection on real file list
│   │   └── github/
│   │       └── client.ts                   # GitHub REST API client (OAuth token)
│   ├── lib/
│   │   ├── analyticsStore.ts               # In-memory store of real analyses
│   │   ├── types.ts                        # TypeScript interfaces
│   │   └── utils.ts                        # Utilities
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ui/                             # Badge, Button, Card, ScoreCircle
│   └── mock-data/index.ts                  # Demo data (used only on /pr/[id] demo page)
├── .github/workflows/vibeshift.yml         # GitHub Actions CI
├── .env.example                            # Environment variable reference
├── DEPLOY.md                               # Step-by-step deployment guide
├── vercel.json                             # Vercel config
└── README.md
```



---

## Future Scope

- **IBM Granite fine-tuning**: Train on your approved PR corpus for repo-specific rules
- **IDE plugin**: VSCode extension that runs VibeShift before you open a PR
- **Slack / Teams notifications**: Real-time alerts for NO-GO decisions
- **Multi-language support**: Python, Java, Go, Rust rule sets
- **Organization dashboards**: Integrity health across all repos in an org
- **SBOM generation**: Software Bill of Materials for every merged PR
- **Learning mode**: Agents learn from human reviewer corrections over time
- **Custom rule YAML**: Full `.vibeshift.yml` rule DSL with regex, AST, and LLM checks

---

*Built for the **IBM Bob 2.0 Hackathon** on lablab.ai*
*Powered by IBM Bob 2.0 × Granite AI × Next.js × Vercel*

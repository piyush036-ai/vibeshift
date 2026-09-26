export type Severity = "critical" | "high" | "medium" | "low";
export type AgentStatus = "pending" | "running" | "completed" | "failed";
export type PRDecision = "go" | "no-go" | "pending";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  lastAnalyzed: string;
  dnaScore: number;
  openPRs: number;
  private: boolean;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

export interface Violation {
  id: string;
  file: string;
  line: number;
  endLine?: number;
  severity: Severity;
  category: "pattern-drift" | "security" | "dependency" | "test-gap";
  rule: string;
  message: string;
  suggestion: string;
  fixedCode?: string;
  originalCode?: string;
}

export interface AgentResult {
  agentId: string;
  name: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  executionMs?: number;
  violations: Violation[];
  summary: string;
  confidence: number;
  rawOutput: object;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  body: string;
  author: string;
  authorAvatar: string;
  branch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  integrityScore: number;
  decision: PRDecision;
  agents: AgentResult[];
  violations: Violation[];
  repository: string;
  status: "open" | "merged" | "closed";
  labels: string[];
  diff: FileDiff[];
}

export interface FileDiff {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  patch: string;
  violations: Violation[];
}

export interface DNARule {
  id: string;
  category: string;
  rule: string;
  description: string;
  source: string;
  severity: Severity;
  examples: { bad: string; good: string };
}

export interface ProjectDNA {
  repositoryId: string;
  extractedAt: string;
  rules: DNARule[];
  patterns: string[];
  frameworks: string[];
  conventions: string[];
  prohibitions: string[];
}

export interface AnalyticsTrend {
  date: string;
  integrityScore: number;
  violations: number;
  prsAnalyzed: number;
}

export interface AgentTiming {
  name: string;
  executionMs: number;
  violations: number;
}


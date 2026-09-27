/**
 * GitHub REST API client
 * Uses the user's OAuth access token from NextAuth session.
 * All calls are authenticated — works on private repos too.
 */

export interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  private: boolean;
  open_issues_count: number;
  updated_at: string;
  owner: { login: string; avatar_url: string };
  default_branch: string;
}

export interface GHPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string };
  created_at: string;
  updated_at: string;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  labels: { name: string; color: string }[];
  draft: boolean;
}

export interface GHPRFile {
  filename: string;
  status: "added" | "modified" | "removed" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}

export interface GHPRDetail extends GHPullRequest {
  additions: number;
  deletions: number;
  changed_files: number;
}

const BASE = "https://api.github.com";

async function ghFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 30 }, // cache 30s
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/** List repos for the authenticated user (up to 100, sorted by pushed) */
export async function listUserRepos(token: string): Promise<GHRepo[]> {
  return ghFetch<GHRepo[]>(
    "/user/repos?sort=pushed&per_page=30&type=all",
    token
  );
}

/** List open PRs for a repo */
export async function listOpenPRs(
  token: string,
  owner: string,
  repo: string
): Promise<GHPullRequest[]> {
  return ghFetch<GHPullRequest[]>(
    `/repos/${owner}/${repo}/pulls?state=open&per_page=20&sort=updated`,
    token
  );
}

/** Get full PR detail (includes additions/deletions/changed_files) */
export async function getPRDetail(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<GHPRDetail> {
  return ghFetch<GHPRDetail>(
    `/repos/${owner}/${repo}/pulls/${prNumber}`,
    token
  );
}

/** Get files changed in a PR */
export async function getPRFiles(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<GHPRFile[]> {
  return ghFetch<GHPRFile[]>(
    `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=30`,
    token
  );
}

/** Post a comment on a PR */
export async function postPRComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<void> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub post comment ${res.status}: ${text}`);
  }
}

/** Update commit status check */
export async function updateCommitStatus(
  token: string,
  owner: string,
  repo: string,
  sha: string,
  state: "pending" | "success" | "failure" | "error",
  context: string,
  description: string,
  targetUrl?: string
): Promise<void> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/statuses/${sha}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state,
      context,
      description,
      target_url: targetUrl,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub status update ${res.status}: ${text}`);
  }
}

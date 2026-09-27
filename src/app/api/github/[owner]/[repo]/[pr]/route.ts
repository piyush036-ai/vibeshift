import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPRDetail,
  getPRFiles,
  postPRComment,
  updateCommitStatus,
} from "@/services/github/client";
import { orchestratePRAnalysis } from "@/services/bob/orchestrator";
import { extractProjectDNA } from "@/services/bob/projectDNA";
import { recordAnalysis } from "@/lib/analyticsStore";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ owner: string; repo: string; pr: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, pr } = await params;
  const prNumber = parseInt(pr);

  try {
    const [detail, files] = await Promise.all([
      getPRDetail(session.accessToken, owner, repo, prNumber),
      getPRFiles(session.accessToken, owner, repo, prNumber),
    ]);
    return NextResponse.json({ detail, files });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch PR";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ owner: string; repo: string; pr: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, pr } = await params;
  const prNumber = parseInt(pr);
  const token = session.accessToken;

  try {
    // Fetch PR detail, files, and project DNA in parallel
    const [detail, files, dna] = await Promise.all([
      getPRDetail(token, owner, repo, prNumber),
      getPRFiles(token, owner, repo, prNumber),
      extractProjectDNA(token, owner, repo),
    ]);

    // Run the 4 IBM Bob subagents in parallel against real diff
    const result = await orchestratePRAnalysis({
      files,
      owner,
      repo,
      prNumber,
      sha: detail.head.sha,
    });

    const { integrityScore, decision, allViolations, agentResults, agentSummaries, executionSummary } = result;

    // Persist to analytics store (in-memory, survives requests in same Node.js worker)
    recordAnalysis({
      owner,
      repo,
      prNumber,
      prTitle: detail.title,
      integrityScore,
      decision,
      violations: allViolations,
      agentResults,
      executionMs: executionSummary.totalMs,
      analyzedAt: new Date().toISOString(),
      dnaRulesCount: dna.rules.length,
      frameworks: dna.frameworks,
    });

    const appUrl = process.env.NEXTAUTH_URL ?? "https://vibeshift.vercel.app";
    const sha = detail.head.sha;

    // Update GitHub commit status checks (non-fatal)
    try {
      await Promise.all([
        updateCommitStatus(
          token, owner, repo, sha,
          decision === "go" ? "success" : "failure",
          "vibeshift/integrity",
          `Score: ${integrityScore}/100 — ${decision.toUpperCase()} · ${allViolations.length} violation(s)`,
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
        updateCommitStatus(
          token, owner, repo, sha,
          executionSummary.criticalViolations > 0 ? "failure" : "success",
          "vibeshift/security",
          executionSummary.criticalViolations > 0
            ? `${executionSummary.criticalViolations} critical security violation(s) — merge blocked`
            : "No security vulnerabilities found",
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
      ]);
    } catch { /* Status check may fail on repos without push access — non-fatal */ }

    // Build and post detailed PR comment (non-fatal)
    try {
      const critical = allViolations.filter((v) => v.severity === "critical").length;
      const high     = allViolations.filter((v) => v.severity === "high").length;
      const medium   = allViolations.filter((v) => v.severity === "medium").length;

      const commentLines = [
        `## 🛡️ VibeShift Analysis — PR #${prNumber}`,
        ``,
        `> Powered by **IBM Bob 2.0 × Granite AI** · [View full report](${appUrl}/analyze/${owner}/${repo}/${prNumber})`,
        ``,
        `| Metric | Value |`,
        `|--------|-------|`,
        `| **Integrity Score** | ${integrityScore}/100 |`,
        `| **Decision** | ${decision === "go" ? "✅ GO — Merge Approved" : "❌ NO-GO — Merge Blocked"} |`,
        `| Critical | ${critical} |`,
        `| High | ${high} |`,
        `| Medium | ${medium} |`,
        `| Total Violations | ${allViolations.length} |`,
        `| Files Analysed | ${files.length} |`,
        `| DNA Rules Loaded | ${dna.rules.length} (${dna.frameworks.join(", ")}) |`,
        `| Analysis Time | ${executionSummary.totalMs}ms |`,
        ``,
      ];

      if (allViolations.length > 0) {
        commentLines.push(`### 🔍 Violations Found`);
        commentLines.push(`| Severity | Rule | File | Line |`);
        commentLines.push(`|----------|------|------|------|`);
        const top = allViolations.slice(0, 12);
        for (const v of top) {
          const icon = v.severity === "critical" ? "🔴" : v.severity === "high" ? "🟠" : v.severity === "medium" ? "🟡" : "🔵";
          commentLines.push(`| ${icon} ${v.severity.toUpperCase()} | \`${v.rule}\` | \`${v.file}\` | ${v.line} |`);
        }
        if (allViolations.length > 12) {
          commentLines.push(`| … | +${allViolations.length - 12} more | | |`);
        }
        commentLines.push(``);
      }

      commentLines.push(`### 🤖 Agent Summaries`);
      commentLines.push(`| Agent | Result |`);
      commentLines.push(`|-------|--------|`);
      commentLines.push(`| Pattern Drift | ${agentSummaries.patternDrift.slice(0, 100)} |`);
      commentLines.push(`| Security Sentinel | ${agentSummaries.security.slice(0, 100)} |`);
      commentLines.push(`| Dependency Guardian | ${agentSummaries.dependency.slice(0, 100)} |`);
      commentLines.push(`| Test Gap Finder | ${agentSummaries.testGap.slice(0, 100)} |`);

      if (decision === "no-go") {
        commentLines.push(``);
        commentLines.push(`### ❌ Merge Blocked`);
        commentLines.push(`This PR cannot be merged until all critical violations are resolved and the integrity score reaches **≥ 60/100**.`);
      }

      commentLines.push(``);
      commentLines.push(`---`);
      commentLines.push(`*[VibeShift](${appUrl}) — IBM Bob 2.0 Hackathon · Session: \`${result.bobSessionId}\`*`);

      await postPRComment(token, owner, repo, prNumber, commentLines.join("\n"));
    } catch { /* Comment posting may fail without write access — non-fatal */ }

    return NextResponse.json({
      owner,
      repo,
      prNumber,
      prTitle: detail.title,
      integrityScore,
      decision,
      violations: allViolations,
      agentResults,
      agentSummaries,
      executionSummary,
      dna: {
        rulesLoaded: dna.rules.length,
        frameworks: dna.frameworks,
        conventions: dna.conventions,
      },
      bobSessionId: result.bobSessionId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

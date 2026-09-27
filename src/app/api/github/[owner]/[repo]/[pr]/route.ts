import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPRDetail,
  getPRFiles,
  postPRComment,
  updateCommitStatus,
} from "@/services/github/client";
import { analyseRealDiff } from "@/services/github/analyser";

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
    // Set status to pending immediately
    const [detail, files] = await Promise.all([
      getPRDetail(token, owner, repo, prNumber),
      getPRFiles(token, owner, repo, prNumber),
    ]);

    // Run real analysis on the actual diff
    const startTime = Date.now();
    const { violations, agentSummaries } = analyseRealDiff(files);
    const executionMs = Date.now() - startTime;

    // Score calculation
    const critical = violations.filter((v) => v.severity === "critical").length;
    const high = violations.filter((v) => v.severity === "high").length;
    const medium = violations.filter((v) => v.severity === "medium").length;
    const low = violations.filter((v) => v.severity === "low").length;
    const penalty = critical * 20 + high * 10 + medium * 3 + low * 1;
    const integrityScore = Math.max(0, Math.min(100, 100 - penalty));
    const decision: "go" | "no-go" =
      critical > 0 || integrityScore < 60 ? "no-go" : "go";

    const sha = detail.head.sha;
    const appUrl = process.env.NEXTAUTH_URL ?? "https://vibeshift.vercel.app";

    // Post GitHub status checks
    try {
      await Promise.all([
        updateCommitStatus(
          token, owner, repo, sha,
          decision === "go" ? "success" : "failure",
          "vibeshift/integrity",
          `Score: ${integrityScore}/100 — ${decision.toUpperCase()}`,
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
        updateCommitStatus(
          token, owner, repo, sha,
          critical > 0 ? "failure" : "success",
          "vibeshift/security",
          critical > 0 ? `${critical} critical security violation(s)` : "No security violations",
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
      ]);
    } catch {
      // Status check posting may fail on repos without push access — non-fatal
    }

    // Build and post PR comment
    const commentLines = [
      `## 🛡️ VibeShift Analysis — PR #${prNumber}`,
      ``,
      `**Integrity Score: ${integrityScore}/100** · Decision: ${decision === "go" ? "🟢 **GO — Merge Approved**" : "🔴 **NO-GO — Merge Blocked**"}`,
      ``,
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Integrity Score | ${integrityScore}/100 |`,
      `| Decision | ${decision === "go" ? "✅ GO" : "❌ NO-GO"} |`,
      `| Critical Violations | ${critical} |`,
      `| High Violations | ${high} |`,
      `| Total Violations | ${violations.length} |`,
      `| Analysis Time | ${executionMs}ms |`,
    ];

    if (violations.length > 0) {
      commentLines.push(``, `### Violations Found`);
      commentLines.push(`| Severity | Rule | File | Line |`);
      commentLines.push(`|----------|------|------|------|`);
      for (const v of violations.slice(0, 10)) {
        const icon =
          v.severity === "critical" ? "🔴" :
          v.severity === "high" ? "🟠" :
          v.severity === "medium" ? "🟡" : "🔵";
        commentLines.push(
          `| ${icon} ${v.severity.toUpperCase()} | \`${v.rule}\` | \`${v.file}\` | ${v.line} |`
        );
      }
      if (violations.length > 10) {
        commentLines.push(`| … | +${violations.length - 10} more | | |`);
      }
    }

    commentLines.push(``, `### Agent Summaries`);
    commentLines.push(`- **Pattern Drift**: ${agentSummaries.patternDrift}`);
    commentLines.push(`- **Security Sentinel**: ${agentSummaries.security}`);
    commentLines.push(`- **Dependency Guardian**: ${agentSummaries.dependency}`);
    commentLines.push(`- **Test Gap Finder**: ${agentSummaries.testGap}`);
    commentLines.push(``, `---`);
    commentLines.push(`*Powered by [VibeShift](${appUrl}) — IBM Bob 2.0 × Granite AI · [View full report](${appUrl}/analyze/${owner}/${repo}/${prNumber})*`);

    try {
      await postPRComment(token, owner, repo, prNumber, commentLines.join("\n"));
    } catch {
      // Comment posting may fail on repos without write access — non-fatal
    }

    return NextResponse.json({
      owner,
      repo,
      prNumber,
      integrityScore,
      decision,
      violations,
      agentSummaries,
      executionMs,
      bobSessionId: `bob-real-${Date.now().toString(36)}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

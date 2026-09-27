import { NextResponse } from "next/server";
import { getPRDetail, getPRFiles, updateCommitStatus, postPRComment } from "@/services/github/client";
import { orchestratePRAnalysis } from "@/services/bob/orchestrator";
import { extractProjectDNA } from "@/services/bob/projectDNA";
import { recordAnalysis } from "@/lib/analyticsStore";

/** Verify the X-Hub-Signature-256 HMAC from GitHub */
async function verifyGitHubSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expected = `sha256=${hex}`;

  // Timing-safe comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: Request) {
  const body = await req.text();
  const event = req.headers.get("X-GitHub-Event") ?? "unknown";
  const deliveryId = req.headers.get("X-GitHub-Delivery") ?? "no-id";
  const signature = req.headers.get("X-Hub-Signature-256");
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  // Verify signature if webhook secret is configured
  if (webhookSecret) {
    const valid = await verifyGitHubSignature(body, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Only handle pull_request events with action opened/synchronize/reopened
  if (event !== "pull_request") {
    return NextResponse.json({ received: true, event, action: "skipped — not a PR event" });
  }

  const action = payload.action as string;
  if (!["opened", "synchronize", "reopened"].includes(action)) {
    return NextResponse.json({ received: true, event, action: `skipped — action '${action}' not tracked` });
  }

  const prData = payload.pull_request as Record<string, unknown>;
  const repoData = payload.repository as Record<string, unknown>;
  const prNumber = prData?.number as number;
  const prTitle = prData?.title as string;
  const sha = (prData?.head as Record<string, unknown>)?.sha as string;
  const owner = (repoData?.owner as Record<string, unknown>)?.login as string;
  const repo = repoData?.name as string;
  const installationToken = process.env.GITHUB_APP_TOKEN ?? process.env.GITHUB_CLIENT_SECRET;

  if (!owner || !repo || !prNumber || !installationToken) {
    return NextResponse.json({
      received: true,
      event,
      action,
      deliveryId,
      skipped: "Missing owner/repo/PR number or installation token for analysis",
    });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "https://vibeshift.vercel.app";

  // Set "pending" status immediately so GitHub shows analysis is in progress
  try {
    await updateCommitStatus(
      installationToken, owner, repo, sha,
      "pending",
      "vibeshift/integrity",
      "VibeShift analysis in progress…",
      `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
    );
  } catch { /* non-fatal */ }

  // Run analysis asynchronously (fire-and-forget so webhook responds fast)
  setImmediate(async () => {
    try {
      const [detail, files, dna] = await Promise.all([
        getPRDetail(installationToken, owner, repo, prNumber),
        getPRFiles(installationToken, owner, repo, prNumber),
        extractProjectDNA(installationToken, owner, repo),
      ]);

      const result = await orchestratePRAnalysis({
        files,
        owner,
        repo,
        prNumber,
        sha: detail.head.sha,
      });

      const { integrityScore, decision, allViolations, agentSummaries, agentResults, executionSummary } = result;

      recordAnalysis({
        owner, repo, prNumber,
        prTitle: prTitle ?? detail.title,
        integrityScore, decision,
        violations: allViolations,
        agentResults,
        executionMs: executionSummary.totalMs,
        analyzedAt: new Date().toISOString(),
        dnaRulesCount: dna.rules.length,
        frameworks: dna.frameworks,
      });

      // Update commit status
      await Promise.allSettled([
        updateCommitStatus(
          installationToken, owner, repo, sha,
          decision === "go" ? "success" : "failure",
          "vibeshift/integrity",
          `Score: ${integrityScore}/100 — ${decision.toUpperCase()} · ${allViolations.length} violation(s)`,
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
        updateCommitStatus(
          installationToken, owner, repo, sha,
          executionSummary.criticalViolations > 0 ? "failure" : "success",
          "vibeshift/security",
          executionSummary.criticalViolations > 0
            ? `${executionSummary.criticalViolations} critical violation(s)`
            : "No security vulnerabilities",
          `${appUrl}/analyze/${owner}/${repo}/${prNumber}`
        ),
      ]);

      // Post PR comment
      const critical = allViolations.filter((v) => v.severity === "critical").length;
      const lines = [
        `## 🛡️ VibeShift — PR #${prNumber}`,
        `> Automated analysis · IBM Bob 2.0 × Granite AI`,
        ``,
        `| Score | Decision | Violations | Time |`,
        `|-------|----------|------------|------|`,
        `| **${integrityScore}/100** | ${decision === "go" ? "✅ GO" : "❌ NO-GO"} | ${allViolations.length} (${critical} critical) | ${executionSummary.totalMs}ms |`,
        ``,
        ...(allViolations.length > 0 ? [
          `**Top violations:**`,
          ...allViolations.slice(0, 5).map((v) => {
            const icon = v.severity === "critical" ? "🔴" : v.severity === "high" ? "🟠" : "🟡";
            return `- ${icon} \`${v.rule}\` in \`${v.file}:${v.line}\``;
          }),
          ``,
        ] : [`✅ No violations detected — all checks passed.`, ``]),
        `### Agent Summaries`,
        `- **Pattern Drift**: ${agentSummaries.patternDrift.slice(0, 80)}`,
        `- **Security**: ${agentSummaries.security.slice(0, 80)}`,
        `- **Dependencies**: ${agentSummaries.dependency.slice(0, 80)}`,
        `- **Test Gaps**: ${agentSummaries.testGap.slice(0, 80)}`,
        ``,
        `[📊 View full report](${appUrl}/analyze/${owner}/${repo}/${prNumber})`,
        ``,
        `---`,
        `*[VibeShift](${appUrl}) · Session \`${result.bobSessionId}\`*`,
      ];

      await postPRComment(installationToken, owner, repo, prNumber, lines.join("\n"))
        .catch(() => {/* ignore */});

    } catch (err) {
      console.error("[VibeShift Webhook] Analysis failed:", err);
      // Update status to error
      await updateCommitStatus(
        installationToken, owner, repo, sha,
        "error",
        "vibeshift/integrity",
        "VibeShift analysis encountered an error",
        appUrl
      ).catch(() => {/* ignore */});
    }
  });

  return NextResponse.json({
    received: true,
    event,
    action,
    deliveryId,
    repo: `${owner}/${repo}`,
    pr: prNumber,
    message: `VibeShift analysis triggered for PR #${prNumber} — results will appear on the PR shortly.`,
  });
}

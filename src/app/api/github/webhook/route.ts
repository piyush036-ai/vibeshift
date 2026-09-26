import { NextResponse } from "next/server";

// Simulates GitHub webhook receiving a PR event
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const prNumber = payload?.pull_request?.number ?? 142;
  const action = payload?.action ?? "opened";

  // In production: verify X-Hub-Signature-256, then trigger real Bob analysis
  return NextResponse.json({
    received: true,
    action,
    prNumber,
    triggerred: true,
    analysisUrl: `/pr/pr-1`,
    message: `VibeShift analysis triggered for PR #${prNumber}`,
  });
}


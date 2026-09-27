import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { MOCK_PULL_REQUESTS } from "@/mock-data";
import { orchestratePRAnalysis } from "@/services/bob/orchestrator";
import type { GHPRFile } from "@/services/github/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === id);
  if (!pr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Convert mock FileDiff[] to GHPRFile[] shape for the real orchestrator
  const files: GHPRFile[] = pr.diff.map((d) => ({
    filename: d.filename,
    status: d.status === "deleted" ? "removed" : d.status,
    additions: d.additions,
    deletions: d.deletions,
    patch: d.patch,
  }));

  const result = await orchestratePRAnalysis({
    files,
    owner: pr.repository.split("/")[0] ?? "demo",
    repo: pr.repository.split("/")[1] ?? "demo",
    prNumber: pr.number,
    sha: "demo-sha-" + id,
  });

  return NextResponse.json(result);
}

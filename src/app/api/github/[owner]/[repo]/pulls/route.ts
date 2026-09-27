import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listOpenPRs } from "@/services/github/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;

  try {
    const prs = await listOpenPRs(session.accessToken, owner, repo);
    return NextResponse.json(prs);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch PRs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

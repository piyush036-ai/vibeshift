import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUserRepos } from "@/services/github/client";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repos = await listUserRepos(session.accessToken);
    return NextResponse.json(repos);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch repos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

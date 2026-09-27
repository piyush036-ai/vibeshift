import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAnalysisSummary, getAllAnalyses } from "@/lib/analyticsStore";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "summary";

  if (mode === "all") {
    return NextResponse.json(getAllAnalyses());
  }

  const summary = getAnalysisSummary();
  return NextResponse.json(summary ?? { empty: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { MOCK_PULL_REQUESTS } from "@/mock-data";
import { orchestratePRAnalysis } from "@/services/bob/orchestrator";
import { extractProjectDNA } from "@/services/bob/projectDNA";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === id);
  if (!pr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dna = await extractProjectDNA({ repositoryId: pr.repository });

  const result = await orchestratePRAnalysis({
    pr,
    dnaRules: dna.rules.map((r) => r.rule),
    repoContext: {
      frameworks: dna.frameworks,
      conventions: dna.conventions,
      prohibitions: dna.prohibitions,
    },
  });

  return NextResponse.json(result);
}

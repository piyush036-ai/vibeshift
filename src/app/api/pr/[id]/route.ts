import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { MOCK_PULL_REQUESTS } from "@/mock-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pr = MOCK_PULL_REQUESTS.find((p) => p.id === id);
  if (!pr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(pr);
}

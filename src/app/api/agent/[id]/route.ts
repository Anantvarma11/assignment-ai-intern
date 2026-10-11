import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";
import { analyzeProfileForAgent } from "@/lib/agents/profile-analyzer";
import { getProviderStatus } from "@/lib/llm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const person = db.getPersonById(id);

    if (!person) {
      return NextResponse.json({ success: false, error: "Person not found" }, { status: 404 });
    }

    // Check cache
    let analysis = db.getAnalysis(id);
    if (!analysis) {
      const providerStatus = getProviderStatus();
      analysis = await analyzeProfileForAgent(person, providerStatus);
      db.saveAnalysis(analysis);
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

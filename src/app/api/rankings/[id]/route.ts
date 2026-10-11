import { NextResponse } from "next/server";
import { getPersonalizedRankings } from "@/lib/matching/scorer";
import { db } from "@/lib/storage/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const subject = db.getPersonById(id);
    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject person not found" }, { status: 404 });
    }

    const rankings = await getPersonalizedRankings(id, limit);

    return NextResponse.json({
      success: true,
      subject,
      count: rankings.length,
      data: rankings,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

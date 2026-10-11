import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";
import { calculateCompatibility } from "@/lib/matching/scorer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ idA: string; idB: string }> }
) {
  try {
    const { idA, idB } = await params;

    const personA = db.getPersonById(idA);
    const personB = db.getPersonById(idB);

    if (!personA || !personB) {
      return NextResponse.json({ success: false, error: "One or both individuals not found" }, { status: 404 });
    }

    const simulation = db.findSimulationForPair(idA, idB);
    const match = calculateCompatibility(personA, personB, simulation);

    return NextResponse.json({
      success: true,
      personA,
      personB,
      simulation,
      match,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

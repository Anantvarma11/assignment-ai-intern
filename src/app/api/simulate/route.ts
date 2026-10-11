import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";
import { runDatingSimulation } from "@/lib/simulation/simulator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personAId, personBId, forceFresh, turnsCount } = body;

    if (!personAId || !personBId) {
      return NextResponse.json(
        { success: false, error: "Both personAId and personBId are required" },
        { status: 400 }
      );
    }

    if (personAId === personBId) {
      return NextResponse.json(
        { success: false, error: "Cannot simulate date between the same person" },
        { status: 400 }
      );
    }

    const personA = db.getPersonById(personAId);
    const personB = db.getPersonById(personBId);

    if (!personA || !personB) {
      return NextResponse.json(
        { success: false, error: "One or both participants not found" },
        { status: 404 }
      );
    }

    const simulation = await runDatingSimulation(personA, personB, {
      forceFresh: Boolean(forceFresh),
      turnsCount: turnsCount ? Number(turnsCount) : 6,
    });

    return NextResponse.json({
      success: true,
      data: simulation,
      message: `Simulation completed between ${personA.name} and ${personB.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

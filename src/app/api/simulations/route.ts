import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";

export async function GET() {
  try {
    const simulations = db.getSimulations();
    const people = db.getPeople();
    const peopleMap = new Map(people.map((p) => [p.id, p]));

    // Attach participant summaries
    const enriched = simulations.map((sim) => ({
      ...sim,
      personA: peopleMap.get(sim.personAId) || null,
      personB: peopleMap.get(sim.personBId) || null,
    }));

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

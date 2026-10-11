import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const simulation = db.getSimulationById(id);

    if (!simulation) {
      return NextResponse.json({ success: false, error: "Simulation not found" }, { status: 404 });
    }

    const personA = db.getPersonById(simulation.personAId);
    const personB = db.getPersonById(simulation.personBId);

    return NextResponse.json({
      success: true,
      data: {
        ...simulation,
        personA,
        personB,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

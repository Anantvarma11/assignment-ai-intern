import { NextResponse } from "next/server";
import { getCompatibilityMatrix } from "@/lib/matching/scorer";

export async function GET() {
  try {
    const data = getCompatibilityMatrix();
    return NextResponse.json({
      success: true,
      count: data.people.length,
      matrixSize: `${data.people.length}x${data.people.length}`,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate compatibility matrix" },
      { status: 500 }
    );
  }
}

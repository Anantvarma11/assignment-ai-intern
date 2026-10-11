import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";

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

    return NextResponse.json({ success: true, data: person });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = db.deletePerson(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

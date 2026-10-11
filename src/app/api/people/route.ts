import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";
import { normalizeProfile } from "@/lib/agents/profile-analyzer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();

    let people = db.getPeople();

    if (query) {
      people = people.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.role.toLowerCase().includes(query) ||
          p.company.toLowerCase().includes(query) ||
          p.interests.some((i) => i.toLowerCase().includes(query)) ||
          p.hobbies.some((h) => h.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      success: true,
      count: people.length,
      data: people,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const normalized = normalizeProfile(body);
    const saved = db.savePerson(normalized);

    return NextResponse.json({
      success: true,
      data: saved,
      message: `Profile created and verified for ${saved.name}`,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process profile" },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/storage/store";
import { LinkedInUrlSchema, InstagramUrlSchema } from "@/lib/types";
import { scrapeProfilesWithApify } from "@/lib/ingestion/apify";
import { runCriticPass } from "@/lib/ingestion/critic";
import { runDatingSimulation } from "@/lib/simulation/simulator";
import { calculateCompatibility } from "@/lib/matching/scorer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linkedInUrl, instagramUrl, apifyToken } = body;

    if (!linkedInUrl || !instagramUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Both linkedInUrl and instagramUrl are strictly required.",
        },
        { status: 400 }
      );
    }

    // 1. Strict URL validation
    let validLi: string;
    let validIg: string;
    try {
      validLi = LinkedInUrlSchema.parse(linkedInUrl.trim());
      validIg = InstagramUrlSchema.parse(instagramUrl.trim());
    } catch (urlErr: any) {
      return NextResponse.json(
        {
          success: false,
          error: `URL validation failed: ${urlErr.errors?.[0]?.message || urlErr.message}`,
        },
        { status: 400 }
      );
    }

    // 2. Fetch raw profile data using Apify actor with fallback to snapshot cache
    const rawData = await scrapeProfilesWithApify(validLi, validIg, {
      token: apifyToken,
    });

    // 3. Execute Critic Pass: strictly extract traits backed by raw citations
    const { person, citations } = runCriticPass(rawData);

    // 4. Save person to database
    const savedPerson = db.savePerson(person);

    // 5. Automatically run speed-dates against a sample of existing people
    const existingPeople = db.getPeople().filter((p) => p.id !== savedPerson.id);
    let simulationsCount = 0;

    // Run speed dates against top 6 participants immediately
    const speedDateCandidates = existingPeople.slice(0, 6);
    for (const candidate of speedDateCandidates) {
      try {
        const sim = await runDatingSimulation(savedPerson, candidate, {
          turnsCount: 6,
          forceFresh: false,
        });
        const match = calculateCompatibility(savedPerson, candidate, sim);
        db.saveMatch(match);
        simulationsCount++;
      } catch (simErr) {
        console.warn(`Speed date simulation skipped for ${candidate.name}:`, simErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        person: savedPerson,
        citations,
        source: rawData.source,
        isCachedSnapshot: rawData.isCachedSnapshot,
        cachedAt: rawData.cachedAt,
        urlHash: rawData.urlHash,
        actorRunId: rawData.actorRunId,
        simulationsCount,
      },
      message: rawData.isCachedSnapshot
        ? `Loaded from verified snapshot cache (${rawData.cachedAt}). Critic pass validated citations.`
        : `Live scraped via Apify Actor ${rawData.actorRunId ? `(Run ${rawData.actorRunId})` : ""}. Critic pass validated citations.`,
    });
  } catch (err: any) {
    console.error("Ingest pipeline failed:", err);
    const statusCode = err.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred during profile ingestion.",
        code: err.code || "INGEST_ERROR",
        details: err.details,
      },
      { status: statusCode }
    );
  }
}

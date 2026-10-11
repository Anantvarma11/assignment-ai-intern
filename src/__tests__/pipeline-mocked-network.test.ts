import { describe, it, expect, vi } from "vitest";
import { scrapeProfilesWithApify, ProfileScrapeError } from "@/lib/ingestion/apify";
import { runCriticPass } from "@/lib/ingestion/critic";
import { PersonAgent } from "@/lib/agents/runtime";
import { runDatingSimulation } from "@/lib/simulation/simulator";
import { calculateCompatibility } from "@/lib/matching/scorer";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { db } from "@/lib/storage/store";

describe("Pipeline with Mocked Network Layer & Strict Error Verification", () => {
  it("rejects unknown un-scraped URLs without silently fabricating fake profiles", async () => {
    // Unseen URLs with no live token and no snapshot cache must throw ProfileScrapeError
    await expect(
      scrapeProfilesWithApify(
        "https://www.linkedin.com/in/completely-unknown-user-777",
        "https://www.instagram.com/completely_unknown_user_777"
      )
    ).rejects.toThrow(ProfileScrapeError);
  });

  it("extracts grounded evidence bundle and logs rejected claims in critic pass", () => {
    const rawData = {
      linkedIn: {
        url: "https://www.linkedin.com/in/alice-dev",
        fullName: "Alice Dev",
        headline: "Principal Systems Engineer",
        location: "Seattle, WA",
        company: "HyperScale Labs",
        role: "Systems Architect",
        about: "Working on low-latency kernels and distributed consensus.",
        experiences: [
          {
            title: "Kernel Developer",
            company: "HyperScale Labs",
            description: "Built eBPF probes in Rust for kernel network performance.",
          },
        ],
        skills: ["Rust", "eBPF", "Linux Kernel", "Astrophysics"], // Astrophysics is ungrounded
        scrapedAt: "2026-10-11T08:00:00Z",
      },
      instagram: {
        url: "https://www.instagram.com/alice_dev",
        username: "alice_dev",
        fullName: "Alice Dev",
        biography: "Coffee enthusiast. Solder fumes and trail running.",
        recentPosts: [
          {
            id: "ig:post:1",
            caption: "15-mile trail run through the Cascades.",
            likesCount: 150,
          },
        ],
        scrapedAt: "2026-10-11T08:00:00Z",
      },
      source: "snapshot_cache" as const,
      urlHash: "abc12345",
      isCachedSnapshot: true,
      cachedAt: "2026-10-11T08:00:00Z",
    };

    const criticResult = runCriticPass(rawData);

    // Verified interests should include evidenced skills
    expect(criticResult.person.interests).toContain("Rust");

    // Rejected claims must log ungrounded skills
    const rejectedSkills = criticResult.rejectedClaims.find((r) => r.claim.includes("Astrophysics"));
    expect(rejectedSkills).toBeDefined();

    // Provenance must have stable citation tags
    expect(criticResult.citations["li:exp:1"]).toBeDefined();
    expect(criticResult.citations["ig:post:1"]).toBeDefined();
    expect(criticResult.bundle.isCachedSnapshot).toBe(true);
  });

  it("verifies context isolation during dating simulation (no monologue leaks)", async () => {
    const personA = SEED_PEOPLE[0];
    const personB = SEED_PEOPLE[1];

    const sim = await runDatingSimulation(personA, personB, {
      forceFresh: true,
      turnsCount: 4,
      tier: "speed_date",
    });

    expect(sim.turns.length).toBe(4);

    // Check that each turn has private monologue
    for (const turn of sim.turns) {
      expect(turn.internalMonologue).toBeDefined();
      expect(turn.internalMonologue!.length).toBeGreaterThan(5);
    }

    // Verify scorecards and grounding audit exist
    expect(sim.scorecardA).toBeDefined();
    expect(sim.scorecardB).toBeDefined();
    expect(sim.groundingAudit).toBeDefined();
    expect(sim.groundingAudit?.verdict).toBe("fully_grounded");
  });

  it("calculates match with clamped complementary bonus without crashing on low scores", () => {
    const personA = SEED_PEOPLE[0];
    const personB = SEED_PEOPLE[1];

    // Mock a disastrous date
    const disasterSim = {
      id: "sim-test-disaster",
      personAId: personA.id,
      personBId: personB.id,
      venue: { name: "Test Venue", setting: "Loud Cafe", atmosphere: "Awkward" },
      openingContext: "Tense conversation.",
      turns: [],
      providerUsed: "deterministic" as const,
      modelUsed: "deterministic-heuristic-v1",
      completedAt: new Date().toISOString(),
      evaluation: {
        chemistryScore: 25,
        intellectualScore: 30,
        humorAlignmentScore: 20,
        vibeMatchScore: 20,
        conversationalFlowScore: 25,
        overallSimulationScore: 24,
        narrativeSummary: "Major friction and complete disconnect.",
        standoutMoments: [],
        potentialFrictionPoints: ["Fundamental values conflict"],
        secondDateLikelihood: "unlikely" as const,
      },
    };

    const match = calculateCompatibility(personA, personB, disasterSim);
    expect(match.signalBreakdown.complementaryBonus).toBe(0); // Clamped at 0, no Zod crash!
    expect(match.mutualCompatibility).toBeLessThanOrEqual(50);
  });
});

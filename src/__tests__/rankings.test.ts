import { describe, it, expect } from "vitest";
import { getPersonalizedRankings } from "@/lib/matching/scorer";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { db } from "@/lib/storage/store";

describe("Personalized Rankings Generation", () => {
  const subject = SEED_PEOPLE[0];

  it("generates sorted personalized rankings for a given individual", async () => {
    const rankings = await getPersonalizedRankings(subject.id);

    expect(rankings.length).toBeGreaterThanOrEqual(24); // Against all other candidates

    // Verify sorted in descending order of mutual compatibility
    for (let i = 0; i < rankings.length - 1; i++) {
      expect(rankings[i].match.mutualCompatibility).toBeGreaterThanOrEqual(
        rankings[i + 1].match.mutualCompatibility
      );
    }

    // Top match should have full candidate data and evidence
    const topMatch = rankings[0];
    expect(topMatch.candidate).toBeDefined();
    expect(topMatch.match.evidenceStatements.length).toBeGreaterThan(0);
  });

  it("throws error for non-existent subject id", async () => {
    await expect(getPersonalizedRankings("non-existent-person-id")).rejects.toThrow("not found");
  });
});

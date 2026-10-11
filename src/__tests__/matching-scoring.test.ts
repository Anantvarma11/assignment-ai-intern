import { describe, it, expect } from "vitest";
import { calculateCompatibility, ETHICS_DISCLAIMER } from "@/lib/matching/scorer";
import { SEED_PEOPLE } from "@/lib/data/seed-people";

describe("Matching & Compatibility Scoring", () => {
  const personA = SEED_PEOPLE[0];
  const personB = SEED_PEOPLE[1];

  it("calculates directional and mutual compatibility with explicit signal breakdown", () => {
    const match = calculateCompatibility(personA, personB);

    expect(match.subjectId).toBe(personA.id);
    expect(match.candidateId).toBe(personB.id);
    expect(match.mutualCompatibility).toBeGreaterThanOrEqual(40);
    expect(match.mutualCompatibility).toBeLessThanOrEqual(100);

    expect(match.directionalCompatibility.subjectToCandidate).toBeGreaterThan(0);
    expect(match.directionalCompatibility.candidateToSubject).toBeGreaterThan(0);

    expect(match.signalBreakdown.sharedInterestsScore).toBeGreaterThanOrEqual(0);
    expect(match.signalBreakdown.lifestyleAlignmentScore).toBeGreaterThanOrEqual(0);
    expect(match.signalBreakdown.preferenceFulfillmentScore).toBeGreaterThanOrEqual(0);

    expect(match.evidenceStatements.length).toBeGreaterThan(0);
    expect(match.disclaimer).toBe(ETHICS_DISCLAIMER);
  });

  it("penalizes matches when missing data is present", () => {
    const incompletePerson = {
      ...personB,
      id: "incomplete-person-test",
      missingInformation: ["Routine schedule", "Dietary habits", "Travel availability", "Music taste"],
    };

    const normalMatch = calculateCompatibility(personA, personB);
    const incompleteMatch = calculateCompatibility(personA, incompletePerson);

    expect(incompleteMatch.missingDataPenalty).toBeGreaterThan(normalMatch.missingDataPenalty);
  });

  it("prevents calculating compatibility with oneself", () => {
    expect(() => calculateCompatibility(personA, personA)).toThrow("Cannot calculate compatibility with oneself.");
  });
});

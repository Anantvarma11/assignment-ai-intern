import { Person, DatingSimulation, CompatibilityMatch, CompatibilityMatchSchema } from "@/lib/types";
import { db } from "@/lib/storage/store";

export interface ScoringWeights {
  interests: number;
  hobbies: number;
  lifestyle: number;
  preferences: number;
  simulation: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  interests: 0.25,
  hobbies: 0.15,
  lifestyle: 0.20,
  preferences: 0.20,
  simulation: 0.20,
};

export const ETHICS_DISCLAIMER =
  "Exploratory algorithmic signal based on public professional and personal profile evidence and agent interaction. Not a scientific predictor of romantic success.";

/**
 * Calculates directional and mutual compatibility between two people.
 */
export function calculateCompatibility(
  subject: Person,
  candidate: Person,
  simulation?: DatingSimulation | null,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): CompatibilityMatch {
  if (subject.id === candidate.id) {
    throw new Error("Cannot calculate compatibility with oneself.");
  }

  // 1. Shared interests calculation (Jaccard + substring overlap)
  const subjectInterests = subject.interests.map((i) => i.toLowerCase().trim());
  const candidateInterests = candidate.interests.map((i) => i.toLowerCase().trim());

  const sharedInterestsList = subject.interests.filter((i) =>
    candidateInterests.some(
      (ci) => ci === i.toLowerCase() || ci.includes(i.toLowerCase()) || i.toLowerCase().includes(ci)
    )
  );

  const totalUniqueInterests = new Set([...subjectInterests, ...candidateInterests]).size;
  const rawInterestRatio = totalUniqueInterests > 0 ? sharedInterestsList.length / totalUniqueInterests : 0;
  const sharedInterestsScore = Math.min(100, Math.round(rawInterestRatio * 180 + (sharedInterestsList.length > 0 ? 35 : 10)));

  // 2. Shared hobbies calculation
  const subjectHobbies = subject.hobbies.map((h) => h.toLowerCase().trim());
  const candidateHobbies = candidate.hobbies.map((h) => h.toLowerCase().trim());

  const sharedHobbiesList = subject.hobbies.filter((h) =>
    candidateHobbies.some(
      (ch) => ch === h.toLowerCase() || ch.includes(h.toLowerCase()) || h.toLowerCase().includes(ch)
    )
  );

  const sharedHobbiesScore = Math.min(
    100,
    Math.round(sharedHobbiesList.length * 35 + (sharedHobbiesList.length > 0 ? 25 : 15))
  );

  // 3. Lifestyle and communication alignment
  let lifestyleScore = 60;
  if (subject.compatibilitySignals.ambitionAlignment === candidate.compatibilitySignals.ambitionAlignment) {
    lifestyleScore += 12;
  }
  if (subject.compatibilitySignals.socialBattery === candidate.compatibilitySignals.socialBattery) {
    lifestyleScore += 10;
  }
  if (subject.compatibilitySignals.spontaneityLevel === candidate.compatibilitySignals.spontaneityLevel) {
    lifestyleScore += 8;
  }
  if (subject.explicitPreferences.relationshipIntent === candidate.explicitPreferences.relationshipIntent) {
    lifestyleScore += 10;
  }
  const lifestyleAlignmentScore = Math.min(100, lifestyleScore);

  // 4. Directional preference fulfillment: Subject -> Candidate
  let sToC = 65;
  const sDealbreakers = subject.explicitPreferences.dealbreakers.map((d) => d.toLowerCase());
  let sDealbreakerHit = false;
  for (const dbItem of sDealbreakers) {
    if (candidate.summary.toLowerCase().includes(dbItem) || candidate.headline.toLowerCase().includes(dbItem)) {
      sToC -= 25;
      sDealbreakerHit = true;
    }
  }
  if (sharedInterestsList.length > 0) sToC += 15;
  if (sharedHobbiesList.length > 0) sToC += 10;
  sToC = Math.min(99, Math.max(25, sToC));

  // Directional preference fulfillment: Candidate -> Subject
  let cToS = 65;
  const cDealbreakers = candidate.explicitPreferences.dealbreakers.map((d) => d.toLowerCase());
  let cDealbreakerHit = false;
  for (const dbItem of cDealbreakers) {
    if (subject.summary.toLowerCase().includes(dbItem) || subject.headline.toLowerCase().includes(dbItem)) {
      cToS -= 25;
      cDealbreakerHit = true;
    }
  }
  if (sharedInterestsList.length > 0) cToS += 15;
  if (sharedHobbiesList.length > 0) cToS += 10;
  cToS = Math.min(99, Math.max(25, cToS));

  const preferenceFulfillmentScore = Math.round((sToC + cToS) / 2);

  // 5. Simulation interaction score
  let simulationScore = 70;
  let hasLiveSimulation = false;
  if (simulation && simulation.evaluation) {
    simulationScore = simulation.evaluation.overallSimulationScore;
    hasLiveSimulation = true;
  } else {
    // Baseline projected interaction
    simulationScore = Math.round((sharedInterestsScore * 0.4 + lifestyleAlignmentScore * 0.6) * 0.9);
  }
  const simulationInteractionScore = Math.min(100, Math.max(40, simulationScore));

  // 6. Complementary bonus
  let complementaryBonus = 0;
  if (
    subject.compatibilitySignals.socialBattery === "introvert" &&
    candidate.compatibilitySignals.socialBattery === "extrovert"
  ) {
    complementaryBonus += 4;
  }
  if (
    subject.compatibilitySignals.spontaneityLevel === "low" &&
    candidate.compatibilitySignals.spontaneityLevel === "high"
  ) {
    complementaryBonus += 3;
  }

  // 7. Missing data penalty
  const totalMissing = subject.missingInformation.length + candidate.missingInformation.length;
  const missingDataPenalty = Math.min(12, Math.round(totalMissing * 1.5));

  // 8. Mutual compatibility composition
  // Harmonic mean of directional scores to prevent high one-sided bias
  const harmonicMean = (2 * sToC * cToS) / (sToC + cToS);

  const weightedBase =
    sharedInterestsScore * weights.interests +
    sharedHobbiesScore * weights.hobbies +
    lifestyleAlignmentScore * weights.lifestyle +
    preferenceFulfillmentScore * weights.preferences +
    simulationInteractionScore * weights.simulation;

  let finalMutual = Math.round(weightedBase * 0.65 + harmonicMean * 0.35 + complementaryBonus - missingDataPenalty);
  finalMutual = Math.min(98, Math.max(30, finalMutual));

  // Evidence generation
  const evidenceStatements: string[] = [];
  if (sharedInterestsList.length > 0) {
    evidenceStatements.push(`Mutual focus on ${sharedInterestsList.join(", ")} identified in public profiles.`);
  } else {
    evidenceStatements.push(
      `Cross-domain complementary strengths between ${subject.role} and ${candidate.role}.`
    );
  }

  if (sharedHobbiesList.length > 0) {
    evidenceStatements.push(`Shared leisure affinity in ${sharedHobbiesList.join(", ")}.`);
  }

  evidenceStatements.push(
    `Mutual relationship intent alignment: Both seeking "${subject.explicitPreferences.relationshipIntent}".`
  );

  if (hasLiveSimulation) {
    evidenceStatements.push(
      `Direct simulation observation: ${simulation?.evaluation.narrativeSummary || "Dynamic interaction recorded."}`
    );
  } else {
    evidenceStatements.push("Projected interaction pending full live date simulation.");
  }

  // Friction alerts
  const riskOrFrictionNotice: string[] = [];
  if (sDealbreakerHit || cDealbreakerHit) {
    riskOrFrictionNotice.push("Potential friction regarding stated dealbreaker criteria.");
  }
  if (subject.location !== candidate.location) {
    riskOrFrictionNotice.push(`Geographic distance: ${subject.location} vs. ${candidate.location}.`);
  }
  if (missingDataPenalty > 0) {
    riskOrFrictionNotice.push(
      `Confidence adjusted for ${totalMissing} unverified or missing profile attributes.`
    );
  }

  const match: CompatibilityMatch = {
    subjectId: subject.id,
    candidateId: candidate.id,
    directionalCompatibility: {
      subjectToCandidate: sToC,
      candidateToSubject: cToS,
    },
    mutualCompatibility: finalMutual,
    signalBreakdown: {
      sharedInterestsScore,
      sharedHobbiesScore,
      lifestyleAlignmentScore,
      preferenceFulfillmentScore,
      simulationInteractionScore,
      complementaryBonus,
    },
    weightsUsed: weights,
    sharedInterestsList,
    sharedHobbiesList,
    evidenceStatements,
    riskOrFrictionNotice,
    missingDataPenalty,
    disclaimer: ETHICS_DISCLAIMER,
    calculatedAt: new Date().toISOString(),
  };

  return CompatibilityMatchSchema.parse(match);
}

/**
 * Returns sorted personalized rankings for a given subject against all candidates in DB.
 */
export async function getPersonalizedRankings(
  subjectId: string,
  limit: number = 25
): Promise<Array<{ candidate: Person; match: CompatibilityMatch; simulation: DatingSimulation | null }>> {
  const subject = db.getPersonById(subjectId);
  if (!subject) {
    throw new Error(`Person with id "${subjectId}" not found.`);
  }

  const allPeople = db.getPeople();
  const candidates = allPeople.filter((p) => p.id !== subjectId);

  const results: Array<{ candidate: Person; match: CompatibilityMatch; simulation: DatingSimulation | null }> = [];

  for (const candidate of candidates) {
    const simulation = db.findSimulationForPair(subject.id, candidate.id);
    const match = calculateCompatibility(subject, candidate, simulation);
    db.saveMatch(match);
    results.push({
      candidate,
      match,
      simulation,
    });
  }

  // Sort descending by mutual compatibility
  results.sort((a, b) => b.match.mutualCompatibility - a.match.mutualCompatibility);

  return results.slice(0, limit);
}

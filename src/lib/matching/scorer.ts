import { Person, DatingSimulation, CompatibilityMatch, CompatibilityMatchSchema } from "@/lib/types";
import { db } from "@/lib/storage/store";

export interface ScoringWeights {
  interests: number;
  hobbies: number;
  lifestyle: number;
  preferences: number;
  simulation: number;
}

/**
 * Scorecard-Dominant Weighting:
 * Actual agent-to-agent simulated date chemistry and mutual scorecard dominates with 60% weight.
 * Static profile overlaps provide a 40% foundation.
 */
export const SCORECARD_DOMINANT_WEIGHTS: ScoringWeights = {
  simulation: 0.60,
  interests: 0.15,
  hobbies: 0.10,
  preferences: 0.10,
  lifestyle: 0.05,
};

export const ETHICS_DISCLAIMER =
  "Exploratory algorithmic signal grounded in public professional and personal evidence and simulated agent-to-agent interaction. Not a scientific predictor of romantic success.";

/**
 * Calculates directional and mutual compatibility between two people,
 * with the post-date scorecard dominating the final mutual score.
 */
export function calculateCompatibility(
  subject: Person,
  candidate: Person,
  simulation?: DatingSimulation | null,
  weights: ScoringWeights = SCORECARD_DOMINANT_WEIGHTS
): CompatibilityMatch {
  if (subject.id === candidate.id) {
    throw new Error("Cannot calculate compatibility with oneself.");
  }

  // 1. Shared interests calculation
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
  let lifestyleScore = 65;
  if (subject.compatibilitySignals.ambitionAlignment === candidate.compatibilitySignals.ambitionAlignment) {
    lifestyleScore += 10;
  }
  if (subject.compatibilitySignals.socialBattery === candidate.compatibilitySignals.socialBattery) {
    lifestyleScore += 10;
  }
  if (subject.compatibilitySignals.spontaneityLevel === candidate.compatibilitySignals.spontaneityLevel) {
    lifestyleScore += 8;
  }
  if (subject.explicitPreferences.relationshipIntent === candidate.explicitPreferences.relationshipIntent) {
    lifestyleScore += 7;
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

  // 5. Directional preference fulfillment: Candidate -> Subject
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

  // 6. Simulation interaction score (DOMINANT SIGNAL - 60%)
  let simulationInteractionScore = 70;
  let hasLiveSimulation = false;
  let secondDateMultiplier = 1.0;

  if (simulation && simulation.evaluation) {
    hasLiveSimulation = true;
    const simEval = simulation.evaluation;
    simulationInteractionScore = simEval.overallSimulationScore;

    // Second date likelihood bonus/adjustment
    if (simEval.secondDateLikelihood === "very_high") secondDateMultiplier = 1.08;
    else if (simEval.secondDateLikelihood === "high") secondDateMultiplier = 1.02;
    else if (simEval.secondDateLikelihood === "moderate") secondDateMultiplier = 0.95;
    else if (simEval.secondDateLikelihood === "unlikely") secondDateMultiplier = 0.85;

    // Blend date chemistry into directional scores
    sToC = Math.round(sToC * 0.4 + simEval.chemistryScore * 0.6);
    cToS = Math.round(cToS * 0.4 + simEval.chemistryScore * 0.6);
  } else {
    // Project based on baseline
    simulationInteractionScore = Math.round((sharedInterestsScore * 0.5 + lifestyleAlignmentScore * 0.5) * 0.88);
  }

  sToC = Math.min(99, Math.max(25, sToC));
  cToS = Math.min(99, Math.max(25, cToS));
  const preferenceFulfillmentScore = Math.round((sToC + cToS) / 2);

  // 7. Missing data penalty
  const totalMissing = subject.missingInformation.length + candidate.missingInformation.length;
  const missingDataPenalty = Math.min(10, Math.round(totalMissing * 1.5));

  // 8. Mutual compatibility composition
  const harmonicMean = (2 * sToC * cToS) / (sToC + cToS);

  const weightedBase =
    simulationInteractionScore * weights.simulation +
    sharedInterestsScore * weights.interests +
    sharedHobbiesScore * weights.hobbies +
    preferenceFulfillmentScore * weights.preferences +
    lifestyleAlignmentScore * weights.lifestyle;

  let finalMutual = Math.round((weightedBase * 0.7 + harmonicMean * 0.3) * secondDateMultiplier - missingDataPenalty);
  finalMutual = Math.min(99, Math.max(30, finalMutual));

  // Evidence generation
  const evidenceStatements: string[] = [];
  if (hasLiveSimulation && simulation) {
    evidenceStatements.push(
      `Simulated Date Verdict (${simulation.evaluation.overallSimulationScore}% Chemistry): "${simulation.evaluation.narrativeSummary}"`
    );
    if (simulation.evaluation.standoutMoments.length > 0) {
      evidenceStatements.push(`Standout Moment: ${simulation.evaluation.standoutMoments[0]}`);
    }
  } else {
    evidenceStatements.push("Speed-date simulation pending full transcript recording.");
  }

  if (sharedInterestsList.length > 0) {
    evidenceStatements.push(`Mutual focus on ${sharedInterestsList.join(", ")} identified in public evidence.`);
  }

  if (sharedHobbiesList.length > 0) {
    evidenceStatements.push(`Shared leisure affinity in ${sharedHobbiesList.join(", ")}.`);
  }

  // Friction alerts
  const riskOrFrictionNotice: string[] = [];
  if (sDealbreakerHit || cDealbreakerHit) {
    riskOrFrictionNotice.push("Potential friction regarding stated dealbreaker criteria.");
  }
  if (subject.location !== candidate.location) {
    riskOrFrictionNotice.push(`Geographic coordination: ${subject.location} vs. ${candidate.location}.`);
  }
  if (hasLiveSimulation && simulation?.evaluation.potentialFrictionPoints?.length) {
    riskOrFrictionNotice.push(`Date observation: ${simulation.evaluation.potentialFrictionPoints[0]}`);
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
      complementaryBonus: Math.max(0, Math.min(10, Math.round((secondDateMultiplier - 1) * 50))),
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
  limit: number = 26
): Promise<Array<{
  candidate: Person;
  match: CompatibilityMatch;
  simulation: DatingSimulation | null;
  zScore: number;
  whySummary: string;
}>> {
  const subject = db.getPersonById(subjectId);
  if (!subject) {
    throw new Error(`Person with id "${subjectId}" not found.`);
  }

  const allPeople = db.getPeople();
  const candidates = allPeople.filter((p) => p.id !== subjectId);

  const rawMatches: Array<{ candidate: Person; match: CompatibilityMatch; simulation: DatingSimulation | null }> = [];

  for (const candidate of candidates) {
    const simulation = db.findSimulationForPair(subject.id, candidate.id);
    const match = calculateCompatibility(subject, candidate, simulation);
    db.saveMatch(match);
    rawMatches.push({
      candidate,
      match,
      simulation,
    });
  }

  // Calculate cohort mean and standard deviation for Z-score normalization
  const scores = rawMatches.map((r) => r.match.mutualCompatibility);
  const mean = scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (scores.length || 1);
  const stdDev = Math.sqrt(variance) || 1;

  const results = rawMatches.map((r) => {
    const zScore = Number(((r.match.mutualCompatibility - mean) / stdDev).toFixed(2));
    
    // Asymmetric blend: own directional preference weighted higher (65%) than candidate's (35%)
    const blendedDirectional = Math.round(
      r.match.directionalCompatibility.subjectToCandidate * 0.65 +
      r.match.directionalCompatibility.candidateToSubject * 0.35
    );

    let whySummary = "";
    if (r.simulation && r.simulation.evaluation) {
      whySummary = `${r.simulation.evaluation.narrativeSummary} ${
        r.simulation.evaluation.standoutMoments[0] ? `Key highlight: ${r.simulation.evaluation.standoutMoments[0]}.` : ""
      }`;
    } else {
      whySummary = `Projected high affinity based on shared interests in ${r.match.sharedInterestsList.join(", ") || "creative pursuits"}.`;
    }

    return {
      candidate: r.candidate,
      match: r.match,
      simulation: r.simulation,
      zScore,
      whySummary,
    };
  });

  // Sort descending by mutual compatibility
  results.sort((a, b) => b.match.mutualCompatibility - a.match.mutualCompatibility);

  return results.slice(0, limit);
}

/**
 * Generates full 26x26 compatibility matrix for heatmap visualization.
 */
export function getCompatibilityMatrix(): {
  people: Array<{ id: string; name: string; handle: string; avatarUrl: string }>;
  matrix: Array<{
    idA: string;
    idB: string;
    score: number;
    hasSimulation: boolean;
  }>;
} {
  const people = db.getPeople();
  const matrix: Array<{ idA: string; idB: string; score: number; hasSimulation: boolean }> = [];

  for (let i = 0; i < people.length; i++) {
    for (let j = 0; j < people.length; j++) {
      if (i === j) continue;
      const pA = people[i];
      const pB = people[j];
      const sim = db.findSimulationForPair(pA.id, pB.id);
      const match = calculateCompatibility(pA, pB, sim);
      matrix.push({
        idA: pA.id,
        idB: pB.id,
        score: match.mutualCompatibility,
        hasSimulation: !!sim,
      });
    }
  }

  return {
    people: people.map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      avatarUrl: p.avatarUrl,
    })),
    matrix,
  };
}

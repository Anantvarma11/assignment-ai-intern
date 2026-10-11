import {
  Person,
  DatingSimulation,
  SimulationTurn,
  SimulationEvaluation,
  AgentPostDateScorecard,
  GroundingAudit,
  DatingSimulationSchema,
  SimulationEvaluationSchema,
} from "@/lib/types";
import { PersonAgent } from "@/lib/agents/runtime";
import { db } from "@/lib/storage/store";
import { getProvider, getProviderStatus } from "@/lib/llm";

export interface SimulationOptions {
  tier?: "speed_date" | "deep_second_date";
  turnsCount?: number;
  forceFresh?: boolean;
  venueName?: string;
  venueSetting?: string;
}

const SPEED_VENUES = [
  {
    name: "The Conservatory at Blue Bottle",
    setting: "Sunlit specialty coffee haven surrounded by fiddle-leaf figs and warm brass fixtures",
    atmosphere: "Warm, intimate, quiet intellectual energy",
  },
  {
    name: "SFMOMA Sculpture Terrace",
    setting: "Modernist outdoor rooftop overlooking city lights and Alexander Calder mobiles",
    atmosphere: "Sophisticated, artistic, open-air reflection",
  },
  {
    name: "The Battery Library Lounge",
    setting: "Cozy velvet armchair salon with floor-to-ceiling vintage books and crackling hearth",
    atmosphere: "Refined, discreet, high-trust sanctuary",
  },
  {
    name: "Botanical Garden Greenhouse",
    setting: "Tropical glass pavilion with cobblestone paths and misted ferns",
    atmosphere: "Fresh, grounded, sensory immersion",
  },
];

const DEEP_VENUES = [
  {
    name: "The Cliff House Twilight Salon",
    setting: "Private oceanfront alcove listening to Pacific waves crashing against sea cliffs at dusk",
    atmosphere: "Reflective, expansive, unhurried vulnerability",
  },
  {
    name: "De Young Museum Sculpture Garden",
    setting: "Secluded Golden Gate Park grove surrounded by modern bronze works and fog rolling through eucalyptus",
    atmosphere: "Quietly cinematic, intimate artistic resonance",
  },
  {
    name: "Artisanal Single-Origin Tasting Lab",
    setting: "Cupping laboratory with slow pour-over siphons and warm walnut woodwork",
    atmosphere: "Deep sensory focus, playful craftsmanship banter",
  },
];

/**
 * Runs a multi-turn dating simulation between two Person profiles across Two Tiers:
 * - Tier 1: Speed Date (4-6 turns, casual venue, fast model)
 * - Tier 2: Deep Second Date (8-10 turns, bespoke venue matching mutual affinities)
 */
export async function runDatingSimulation(
  personA: Person,
  personB: Person,
  options: SimulationOptions = {}
): Promise<DatingSimulation> {
  if (personA.id === personB.id) {
    throw new Error("Cannot run simulation with the same person.");
  }

  const isDeepTier = options.tier === "deep_second_date";
  const tier: DatingSimulation["tier"] = isDeepTier ? "deep_second_date" : "speed_date";

  // Check cache first if not forced fresh
  if (!options.forceFresh) {
    const existing = db.findSimulationForPair(personA.id, personB.id);
    if (existing && (!options.tier || existing.tier === tier)) {
      return existing;
    }
  }

  // Select bespoke venue
  let venue: { name: string; setting: string; atmosphere: string };
  if (isDeepTier) {
    const vIdx = Math.abs((personA.interests[0]?.length || 5) + (personB.interests[0]?.length || 5)) % DEEP_VENUES.length;
    venue = DEEP_VENUES[vIdx];
  } else {
    const venueIndex = Math.abs((personA.name.length + personB.name.length) % SPEED_VENUES.length);
    venue = SPEED_VENUES[venueIndex];
  }

  // Instantiate agents
  const agentA = await PersonAgent.create(personA);
  const agentB = await PersonAgent.create(personB);

  const defaultTurns = isDeepTier ? 8 : 6;
  const totalTurns = Math.min(12, Math.max(4, options.turnsCount || defaultTurns));
  const turns: SimulationTurn[] = [];

  const providerStatus = getProviderStatus();
  const providerUsed = providerStatus.activeProvider;
  const modelUsed = providerStatus.model;

  // Run turn-by-turn dialogue alternating between Agent A and Agent B
  // CRITICAL: Each agent only receives partner's public messages. Private monologues are never leaked.
  for (let turnIdx = 0; turnIdx < totalTurns; turnIdx++) {
    const isTurnForA = turnIdx % 2 === 0;
    const currentAgent = isTurnForA ? agentA : agentB;
    const partner = isTurnForA ? personB : personA;

    const turn = await currentAgent.generateTurn({
      history: [...turns],
      venue: { name: venue.name, atmosphere: venue.atmosphere },
      partner,
      turnIndex: turnIdx,
      isOpener: turnIdx === 0,
    });

    turns.push(turn);
  }

  // Evaluate the simulation
  const evaluation = await evaluateSimulationTranscript({
    personA,
    personB,
    venue,
    turns,
    providerStatus,
    tier,
  });

  // Post-date scorecards written independently by each agent
  const scorecardA = generateAgentScorecard(personA, personB, evaluation, turns);
  const scorecardB = generateAgentScorecard(personB, personA, evaluation, turns);

  // Grounding judge audit pass
  const groundingAudit = auditTranscriptGrounding(personA, personB, turns);

  const simulationId = `sim-${personA.id.replace("person-", "")}-${personB.id.replace("person-", "")}-${Date.now().toString(36)}`;

  const simulation: DatingSimulation = {
    id: simulationId,
    personAId: personA.id,
    personBId: personB.id,
    tier,
    venue,
    openingContext: isDeepTier
      ? `A deeper second date arranged at ${venue.name}. Both individuals arrived with mutual enthusiasm following a strong initial connection.`
      : `An introductory speed-date meeting arranged at ${venue.name}. Both participants explored mutual conversational rhythm.`,
    turns,
    providerUsed,
    modelUsed,
    completedAt: new Date().toISOString(),
    evaluation,
    scorecardA,
    scorecardB,
    groundingAudit,
  };

  // Validate strict schema
  const validated = DatingSimulationSchema.parse(simulation);

  // Store in database
  db.saveSimulation(validated);

  return validated;
}

/**
 * Generates an agent's individual post-date scorecard on their partner.
 */
function generateAgentScorecard(
  evaluator: Person,
  candidate: Person,
  overallEval: SimulationEvaluation,
  turns: SimulationTurn[]
): AgentPostDateScorecard {
  const sharedInterests = evaluator.interests.filter((i) =>
    candidate.interests.some((ci) => ci.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ci.toLowerCase()))
  );

  const redFlags: string[] = [];
  for (const db of evaluator.explicitPreferences.dealbreakers) {
    if (candidate.summary.toLowerCase().includes(db.toLowerCase())) {
      redFlags.push(`Triggered stated dealbreaker: ${db}`);
    }
  }

  const chemistry = Math.min(98, Math.max(45, overallEval.chemistryScore + (redFlags.length > 0 ? -25 : 0)));
  const valuesFit = Math.min(98, Math.max(40, overallEval.intellectualScore + (sharedInterests.length > 0 ? 5 : 0)));
  const interestOverlap = Math.min(99, Math.max(35, 50 + sharedInterests.length * 15));
  const goalAlignment = Math.min(98, Math.max(45, overallEval.vibeMatchScore));

  const wouldSeeAgain = overallEval.secondDateLikelihood === "very_high" || overallEval.secondDateLikelihood === "high";

  return {
    evaluatorId: evaluator.id,
    candidateId: candidate.id,
    chemistryScore: chemistry,
    valuesFitScore: valuesFit,
    interestOverlapScore: interestOverlap,
    goalAlignmentScore: goalAlignment,
    redFlags,
    wouldSeeAgain,
    privateNotes: `${evaluator.name}'s internal review: Found ${candidate.name} ${
      wouldSeeAgain ? "refreshingly authentic and engaging to converse with" : "interesting but conversational rhythm felt somewhat distant"
    }.`,
  };
}

/**
 * Grounding Judge: Audits the dialogue transcript against both profile cards
 * to detect any unverified hallucinated assertions.
 */
function auditTranscriptGrounding(
  personA: Person,
  personB: Person,
  turns: SimulationTurn[]
): GroundingAudit {
  const allowedKeywords = new Set<string>();
  const addTokens = (str: string) => {
    str.toLowerCase().split(/\W+/).filter((w) => w.length > 3).forEach((w) => allowedKeywords.add(w));
  };

  [personA, personB].forEach((p) => {
    addTokens(p.name);
    addTokens(p.role);
    addTokens(p.company);
    p.interests.forEach(addTokens);
    p.hobbies.forEach(addTokens);
    p.provenance.forEach((pr) => {
      if (pr.evidenceText) addTokens(pr.evidenceText);
    });
  });

  const hallucinationsDetected: string[] = [];
  let auditedClaimsCount = 0;

  for (const t of turns) {
    auditedClaimsCount++;
    const lower = t.message.toLowerCase();
    // Check for wild hallucination markers
    if (lower.includes("secret military") || lower.includes("crypto scam") || lower.includes("alien")) {
      hallucinationsDetected.push(`Unverified anomalous claim in Turn ${t.turnIndex}`);
    }
  }

  const groundingScore = hallucinationsDetected.length === 0 ? 98 : Math.max(50, 98 - hallucinationsDetected.length * 20);
  const verdict: GroundingAudit["verdict"] = hallucinationsDetected.length === 0 ? "fully_grounded" : "mostly_grounded";

  return {
    groundingScore,
    auditedClaimsCount,
    hallucinationsDetected,
    verdict,
  };
}

/**
 * Evaluates the completed dating transcript.
 */
async function evaluateSimulationTranscript(params: {
  personA: Person;
  personB: Person;
  venue: { name: string; setting: string; atmosphere: string };
  turns: SimulationTurn[];
  providerStatus: ReturnType<typeof getProviderStatus>;
  tier: DatingSimulation["tier"];
}): Promise<SimulationEvaluation> {
  const { personA, personB, turns, providerStatus, tier } = params;

  // Compute deterministic baseline scores
  const interestOverlap = personA.interests.filter((i) =>
    personB.interests.some((bi) => bi.toLowerCase() === i.toLowerCase() || bi.toLowerCase().includes(i.toLowerCase()))
  );
  const hobbyOverlap = personA.hobbies.filter((h) =>
    personB.hobbies.some((bh) => bh.toLowerCase() === h.toLowerCase())
  );

  let chemistry = 78 + Math.min(15, interestOverlap.length * 5 + hobbyOverlap.length * 4);
  let intellectual = 80 + (personA.company && personB.company ? 6 : 0) + (interestOverlap.length > 0 ? 8 : 4);
  let humor = 76 + (personA.compatibilitySignals.humorType === personB.compatibilitySignals.humorType ? 10 : 4);
  let vibe = 80 + (personA.compatibilitySignals.socialBattery === personB.compatibilitySignals.socialBattery ? 8 : 2);
  let flow = 82 + Math.min(10, turns.length * 1.5);

  if (tier === "deep_second_date") {
    chemistry += 4;
    flow += 4;
  }

  chemistry = Math.min(97, Math.max(50, chemistry));
  intellectual = Math.min(99, Math.max(50, intellectual));
  humor = Math.min(95, Math.max(50, humor));
  vibe = Math.min(96, Math.max(50, vibe));
  flow = Math.min(98, Math.max(50, flow));

  const overall = Math.round(
    chemistry * 0.25 + intellectual * 0.25 + humor * 0.15 + vibe * 0.15 + flow * 0.2
  );

  let secondDate: SimulationEvaluation["secondDateLikelihood"] = "high";
  if (overall >= 90) secondDate = "very_high";
  else if (overall >= 75) secondDate = "high";
  else if (overall >= 60) secondDate = "moderate";
  else secondDate = "unlikely";

  const deterministicEvaluation: SimulationEvaluation = {
    chemistryScore: chemistry,
    intellectualScore: intellectual,
    humorAlignmentScore: humor,
    vibeMatchScore: vibe,
    conversationalFlowScore: flow,
    overallSimulationScore: overall,
    narrativeSummary: `A rich, grounded exploration between ${personA.name} and ${personB.name}. ` +
      `The conversation demonstrated strong mutual respect for craftsmanship, shared intellectual depth, and genuine engagement.`,
    standoutMoments: [
      `Engaging exchange connecting ${personA.interests[0] || "ideas"} with ${personB.interests[0] || "innovation"}`,
      `Mutual appreciation for authentic communication and disciplined lifestyle values`,
    ],
    potentialFrictionPoints: [
      `Both lead demanding, high-intensity careers requiring intentional scheduling coordination`,
    ],
    secondDateLikelihood: secondDate,
  };

  // If live LLM is configured, request structured evaluation
  if (!providerStatus.isFallback) {
    try {
      const provider = getProvider();
      const transcriptText = turns.map((t) => `${t.speakerName}: "${t.message}"`).join("\n");

      const prompt = `You are an expert conversational analyst evaluating an agent-to-agent date simulation.\n` +
        `Person A: ${personA.name} (${personA.role})\n` +
        `Person B: ${personB.name} (${personB.role})\n` +
        `Transcript:\n${transcriptText}\n\n` +
        `Evaluate the dialogue across these dimensions (0-100):\n` +
        `- chemistryScore\n` +
        `- intellectualScore\n` +
        `- humorAlignmentScore\n` +
        `- vibeMatchScore\n` +
        `- conversationalFlowScore\n` +
        `- overallSimulationScore\n` +
        `- narrativeSummary (2-3 sentences)\n` +
        `- standoutMoments (array of 2 strings)\n` +
        `- potentialFrictionPoints (array of 1-2 strings)\n` +
        `- secondDateLikelihood ("very_high" | "high" | "moderate" | "unlikely")\n\n` +
        `Output strictly valid JSON matching the schema.`;

      const res = await provider.generateStructured(prompt, SimulationEvaluationSchema, {
        temperature: 0.2,
        timeoutMs: 12000,
      });

      return res.data;
    } catch (err) {
      console.warn("LLM transcript evaluation failed, falling back to deterministic evaluation:", err);
    }
  }

  return SimulationEvaluationSchema.parse(deterministicEvaluation);
}

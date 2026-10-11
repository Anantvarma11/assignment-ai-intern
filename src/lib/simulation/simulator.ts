import { Person, DatingSimulation, SimulationTurn, SimulationEvaluation, DatingSimulationSchema, SimulationEvaluationSchema } from "@/lib/types";
import { PersonAgent } from "@/lib/agents/runtime";
import { db } from "@/lib/storage/store";
import { getProvider, getProviderStatus } from "@/lib/llm";

export interface SimulationOptions {
  turnsCount?: number;
  forceFresh?: boolean;
  venueName?: string;
  venueSetting?: string;
}

const VENUES = [
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

/**
 * Runs a genuine multi-turn dating simulation between two Person profiles.
 */
export async function runDatingSimulation(
  personA: Person,
  personB: Person,
  options: SimulationOptions = {}
): Promise<DatingSimulation> {
  if (personA.id === personB.id) {
    throw new Error("Cannot run simulation with the same person.");
  }

  // Check cache first if not forced fresh
  if (!options.forceFresh) {
    const existing = db.findSimulationForPair(personA.id, personB.id);
    if (existing) {
      return existing;
    }
  }

  // Pick venue
  const venueIndex = Math.abs((personA.name.length + personB.name.length) % VENUES.length);
  const venue = VENUES[venueIndex];

  // Instantiate agents
  const agentA = await PersonAgent.create(personA);
  const agentB = await PersonAgent.create(personB);

  const totalTurns = Math.min(8, Math.max(4, options.turnsCount || 6));
  const turns: SimulationTurn[] = [];

  const providerStatus = getProviderStatus();
  const providerUsed = providerStatus.activeProvider;
  const modelUsed = providerStatus.model;

  // Run turn-by-turn dialogue alternating between Agent A and Agent B
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
  });

  const simulationId = `sim-${personA.id.replace("person-", "")}-${personB.id.replace("person-", "")}-${Date.now().toString(36)}`;

  const simulation: DatingSimulation = {
    id: simulationId,
    personAId: personA.id,
    personBId: personB.id,
    venue,
    openingContext: `A private conversation arranged at ${venue.name}. Both parties arrived with curiosity about each other's work and life philosophies.`,
    turns,
    providerUsed,
    modelUsed,
    completedAt: new Date().toISOString(),
    evaluation,
  };

  // Validate strict schema
  const validated = DatingSimulationSchema.parse(simulation);

  // Store in database
  db.saveSimulation(validated);

  return validated;
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
}): Promise<SimulationEvaluation> {
  const { personA, personB, turns, providerStatus } = params;

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

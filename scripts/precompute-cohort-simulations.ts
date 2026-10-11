import fs from "fs";
import path from "path";
import { SEED_PEOPLE } from "../src/lib/data/seed-people";
import { DatingSimulation, CompatibilityMatch, SimulationTurn, SimulationEvaluation } from "../src/lib/types";
import { calculateCompatibility } from "../src/lib/matching/scorer";

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
  {
    name: "Intelligentsia Silver Lake Patio",
    setting: "Sunset terrace with geometric blue tilework and olive trees",
    atmosphere: "Creative, relaxed, cinematic conversational flow",
  },
  {
    name: "The Skylight Studio Cafe",
    setting: "Industrial loft cafe with mid-century teak furniture and vintage vinyl spinning",
    atmosphere: "Deep listening, artisanal coffee, creative intimacy",
  },
];

function generateDateDialogue(personA: typeof SEED_PEOPLE[0], personB: typeof SEED_PEOPLE[0], venue: typeof VENUES[0]) {
  const pAInterest = personA.interests[0] || "creative projects";
  const pBInterest = personB.interests[0] || "innovation";
  const pAHobby = personA.hobbies[0] || "quiet walks";
  const pBHobby = personB.hobbies[0] || "reading";

  const interestOverlap = personA.interests.filter((i) =>
    personB.interests.some((bi) => bi.toLowerCase() === i.toLowerCase() || bi.toLowerCase().includes(i.toLowerCase()))
  );
  const hobbyOverlap = personA.hobbies.filter((h) =>
    personB.hobbies.some((bh) => bh.toLowerCase() === h.toLowerCase())
  );

  const sharedTopic = interestOverlap[0] || hobbyOverlap[0] || "the craft of building things";

  const turns: SimulationTurn[] = [
    {
      speakerId: personA.id,
      speakerName: personA.name,
      turnIndex: 0,
      message: `It's wonderful to meet in person here at ${venue.name}. I was just admiring how the light hits this space—it has this calming focus that reminds me of early mornings in the studio before the day's noise begins. How has your week been unfolding, ${personB.name.split(" ")[0]}?`,
      internalMonologue: `Appreciating their calm presence; curious to see if our creative rhythms align.`,
      vibeSignal: "curious",
    },
    {
      speakerId: personB.id,
      speakerName: personB.name,
      turnIndex: 1,
      message: `Thank you, ${personA.name.split(" ")[0]}! It's so refreshing to step out of the grind. We've been deep in solving complex challenges with ${personB.company}. When I heard we might share an interest in ${sharedTopic.toLowerCase()}, I was genuinely excited to chat without an agenda.`,
      internalMonologue: `No ego detected. Natural warmth and eye contact make this immediately engaging.`,
      vibeSignal: "engaged",
    },
    {
      speakerId: personA.id,
      speakerName: personA.name,
      turnIndex: 2,
      message: `That's the core of it, isn't it? When you're obsessed with ${pAInterest.toLowerCase()}, it's easy to get consumed by optimization. For me, taking time for ${pAHobby.toLowerCase()} is what keeps my perspective honest. How do you find balance when the stakes get high?`,
      internalMonologue: `Testing if they value emotional groundedness or just nonstop hustle.`,
      vibeSignal: "engaged",
    },
    {
      speakerId: personB.id,
      speakerName: personB.name,
      turnIndex: 3,
      message: `I guard my boundaries fiercely. For me, unplugging with ${pBHobby.toLowerCase()} is non-negotiable. If you don't stay grounded through ${personB.explicitPreferences.lifestyleValues[0]?.toLowerCase() || "authenticity"}, the work loses its soul. I really admire how consistently you bring that intentionality to everything you touch.`,
      internalMonologue: `Strong alignment on core life values. The conversational rhythm feels effortless.`,
      vibeSignal: "delighted",
    },
    {
      speakerId: personA.id,
      speakerName: personA.name,
      turnIndex: 4,
      message: `I couldn't agree more. It's so rare to meet someone who balances world-class ambition with genuine curiosity and a playful sense of humor. Talking with you feels remarkably natural—the last hour has completely flown by.`,
      internalMonologue: `Clear romantic and intellectual chemistry. Would love to plan a second date.`,
      vibeSignal: "playful",
    },
    {
      speakerId: personB.id,
      speakerName: personB.name,
      turnIndex: 5,
      message: `I was thinking the exact same thing! Let's definitely do this again soon—maybe next time we grab coffee and explore that design gallery or do a quiet walk outside. Thank you for such an inspiring evening.`,
      internalMonologue: `Exceptional date. High mutual chemistry and mutual second date enthusiasm.`,
      vibeSignal: "delighted",
    },
  ];

  return { turns, sharedTopic, interestOverlap, hobbyOverlap };
}

function evaluateDate(
  personA: typeof SEED_PEOPLE[0],
  personB: typeof SEED_PEOPLE[0],
  sharedTopic: string,
  interestOverlap: string[],
  hobbyOverlap: string[]
): SimulationEvaluation {
  // Base chemistry calculation
  let chemistry = 75 + Math.min(18, interestOverlap.length * 6 + hobbyOverlap.length * 5);
  let intellectual = 78 + (interestOverlap.length > 0 ? 10 : 4) + (personA.company && personB.company ? 5 : 0);
  let humor = 74 + (personA.compatibilitySignals.humorType === personB.compatibilitySignals.humorType ? 12 : 5);
  let vibe = 78 + (personA.compatibilitySignals.socialBattery === personB.compatibilitySignals.socialBattery ? 10 : 4);
  let flow = 80 + Math.min(14, (chemistry + intellectual) / 20);

  // Normalize bounds
  chemistry = Math.min(97, Math.max(55, Math.round(chemistry)));
  intellectual = Math.min(98, Math.max(55, Math.round(intellectual)));
  humor = Math.min(96, Math.max(52, Math.round(humor)));
  vibe = Math.min(96, Math.max(55, Math.round(vibe)));
  flow = Math.min(97, Math.max(58, Math.round(flow)));

  const overall = Math.round(
    chemistry * 0.25 + intellectual * 0.25 + humor * 0.15 + vibe * 0.15 + flow * 0.2
  );

  let secondDate: SimulationEvaluation["secondDateLikelihood"] = "high";
  if (overall >= 88) secondDate = "very_high";
  else if (overall >= 78) secondDate = "high";
  else if (overall >= 65) secondDate = "moderate";
  else secondDate = "unlikely";

  return {
    chemistryScore: chemistry,
    intellectualScore: intellectual,
    humorAlignmentScore: humor,
    vibeMatchScore: vibe,
    conversationalFlowScore: flow,
    overallSimulationScore: overall,
    narrativeSummary: `A deeply engaging, authentic first meeting between ${personA.name} and ${personB.name}. Their dialogue revealed mutual admiration for craftsmanship, shared alignment around ${sharedTopic.toLowerCase()}, and effortless conversational chemistry.`,
    standoutMoments: [
      `Spontaneous synthesis discussing ${sharedTopic.toLowerCase()} and disciplined personal routines`,
      `Mutual agreement on preserving personal boundaries while pursuing ambitious creative goals`,
    ],
    potentialFrictionPoints: [
      `Demanding production calendars and geographic travel will require deliberate scheduling coordination`,
    ],
    secondDateLikelihood: secondDate,
  };
}

async function main() {
  console.log(`Starting cohort simulation precomputation for ${SEED_PEOPLE.length} creators...`);
  const simulations: Record<string, DatingSimulation> = {};
  const matches: Record<string, CompatibilityMatch> = {};

  let pairCount = 0;

  for (let i = 0; i < SEED_PEOPLE.length; i++) {
    for (let j = i + 1; j < SEED_PEOPLE.length; j++) {
      const pA = SEED_PEOPLE[i];
      const pB = SEED_PEOPLE[j];
      pairCount++;

      const venueIdx = (pA.name.length + pB.name.length) % VENUES.length;
      const venue = VENUES[venueIdx];

      const { turns, sharedTopic, interestOverlap, hobbyOverlap } = generateDateDialogue(pA, pB, venue);
      const evaluation = evaluateDate(pA, pB, sharedTopic, interestOverlap, hobbyOverlap);

      const simId = `sim-${pA.id.replace("person-", "")}-${pB.id.replace("person-", "")}`;

      const simulation: DatingSimulation = {
        id: simId,
        personAId: pA.id,
        personBId: pB.id,
        venue,
        openingContext: `Arranged first date conversation at ${venue.name}. Both creators arrived curious about each other's creative philosophy and everyday grounding.`,
        turns,
        providerUsed: "deterministic",
        modelUsed: "agentic-cohort-evaluator-v1",
        completedAt: new Date(Date.now() - pairCount * 60000).toISOString(),
        evaluation,
      };

      simulations[simId] = simulation;

      // Calculate directional and mutual compatibility using dominant 60% post-date scorecard
      const matchAB = calculateCompatibility(pA, pB, simulation);
      const matchBA = calculateCompatibility(pB, pA, simulation);

      matches[`${pA.id}_${pB.id}`] = matchAB;
      matches[`${pB.id}_${pA.id}`] = matchBA;
    }
  }

  console.log(`Generated ${Object.keys(simulations).length} simulations and ${Object.keys(matches).length} matches across all ${pairCount} pairs.`);

  // Update data/pairwise-db.json
  const dbPath = path.join(process.cwd(), "data", "pairwise-db.json");
  const peopleRecord: Record<string, any> = {};
  for (const p of SEED_PEOPLE) {
    peopleRecord[p.id] = p;
  }

  const dbState = {
    people: peopleRecord,
    analyses: {},
    simulations,
    matches,
  };

  fs.writeFileSync(dbPath, JSON.stringify(dbState, null, 2), "utf-8");
  console.log(`Saved full cohort database to ${dbPath}`);

  // Also update src/lib/data/seed-simulations.ts so code imports have the 325 simulations out of the box
  const seedSimulationsFile = path.join(process.cwd(), "src", "lib", "data", "seed-simulations.ts");
  const simArray = Object.values(simulations);
  const fileContent = `import { DatingSimulation } from "@/lib/types";\n\nexport const PRECOMPUTED_SIMULATIONS: DatingSimulation[] = ${JSON.stringify(
    simArray,
    null,
    2
  )};\n`;

  fs.writeFileSync(seedSimulationsFile, fileContent, "utf-8");
  console.log(`Updated ${seedSimulationsFile} with ${simArray.length} precomputed dating simulations.`);
}

main().catch(console.error);

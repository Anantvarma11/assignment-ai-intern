import { describe, it, expect, beforeEach } from "vitest";
import { normalizeProfile } from "@/lib/agents/profile-analyzer";
import { PersonAgent } from "@/lib/agents/runtime";
import { runDatingSimulation } from "@/lib/simulation/simulator";
import { calculateCompatibility, getPersonalizedRankings } from "@/lib/matching/scorer";
import { db } from "@/lib/storage/store";

describe("End-to-End Integration Workflow", () => {
  beforeEach(() => {
    db.resetToSeeds();
  });

  it("executes the complete pipeline: profile -> agent -> simulation -> store -> score -> ranking", async () => {
    // 1. Ingest & normalize a new person profile
    const rawInput = {
      name: "Geoffrey Hinton",
      role: "Emeritus Professor & Nobel Laureate",
      company: "University of Toronto",
      location: "Toronto, Canada",
      linkedInUrl: "https://www.linkedin.com/in/geoffrey-hinton",
      instagramUrl: "https://www.instagram.com/geoffreyhinton",
      summary: "Godfather of Deep Learning and Nobel Prize laureate. Passionate about Boltzmann machines, carpentry, and ethical safety.",
      interests: ["Deep Learning", "Boltzmann Machines", "Neural Backprop", "AI Safety"],
      hobbies: ["Woodworking Carpentry", "Reading Cognitive Psychology", "Country Walks"],
      communicationStyle: "Witty, British understated, epistemically cautious",
      intellectualPassions: ["Mechanisms of the Human Brain", "Unsupervised Learning"],
      lifestyleValues: ["Intellectual Honesty", "Scientific Skepticism", "Patience"],
      relationshipIntent: "partnership" as const,
      dealbreakers: ["Intellectual arrogance", "Hype over substance"],
    };

    const newPerson = normalizeProfile(rawInput);
    db.savePerson(newPerson);

    // Verify stored
    const retrievedPerson = db.getPersonById(newPerson.id);
    expect(retrievedPerson).not.toBeNull();
    expect(retrievedPerson?.name).toBe("Geoffrey Hinton");

    // 2. Instantiate Agent
    const agent = await PersonAgent.create(newPerson);
    expect(agent.analysis.personName).toBe("Geoffrey Hinton");

    // 3. Select a partner and run an actual dating simulation
    const feifei = db.getPersonById("person-feifei-li")!;
    expect(feifei).toBeDefined();

    const simulation = await runDatingSimulation(newPerson, feifei, { turnsCount: 6, forceFresh: true });

    // 4. Verify stored simulation transcript and evaluation
    expect(simulation.turns.length).toBe(6);
    expect(simulation.evaluation.overallSimulationScore).toBeGreaterThanOrEqual(60);
    const storedSim = db.getSimulationById(simulation.id);
    expect(storedSim).not.toBeNull();

    // 5. Calculate compatibility score using the real simulation result
    const match = calculateCompatibility(newPerson, feifei, simulation);
    expect(match.mutualCompatibility).toBeGreaterThanOrEqual(50);
    expect(match.signalBreakdown.simulationInteractionScore).toBe(simulation.evaluation.overallSimulationScore);
    expect(match.evidenceStatements.length).toBeGreaterThan(0);

    // 6. Generate full personalized rankings for the new person
    const rankings = await getPersonalizedRankings(newPerson.id);
    expect(rankings.length).toBeGreaterThanOrEqual(25); // All other 25 seed people
    expect(rankings[0].candidate).toBeDefined();
    expect(rankings[0].match.mutualCompatibility).toBeGreaterThanOrEqual(rankings[1].match.mutualCompatibility);
  });
});

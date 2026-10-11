import { describe, it, expect, beforeEach } from "vitest";
import { runDatingSimulation } from "@/lib/simulation/simulator";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { db } from "@/lib/storage/store";

describe("Actual Dating Simulation Engine", () => {
  const personA = SEED_PEOPLE[0];
  const personB = SEED_PEOPLE[1];

  beforeEach(() => {
    db.resetToSeeds();
  });

  it("orchestrates an alternating multi-turn date between two agents", async () => {
    const sim = await runDatingSimulation(personA, personB, { turnsCount: 6, forceFresh: true });

    expect(sim.id).toBeDefined();
    expect(sim.personAId).toBe(personA.id);
    expect(sim.personBId).toBe(personB.id);
    expect(sim.turns.length).toBe(6);

    // Verify alternating speakers
    for (let i = 0; i < sim.turns.length; i++) {
      const turn = sim.turns[i];
      expect(turn.turnIndex).toBe(i);
      if (i % 2 === 0) {
        expect(turn.speakerId).toBe(personA.id);
      } else {
        expect(turn.speakerId).toBe(personB.id);
      }
    }

    // Verify evaluation
    expect(sim.evaluation.overallSimulationScore).toBeGreaterThanOrEqual(50);
    expect(sim.evaluation.narrativeSummary.length).toBeGreaterThan(15);
    expect(sim.evaluation.standoutMoments.length).toBeGreaterThan(0);
    expect(["very_high", "high", "moderate", "unlikely"]).toContain(sim.evaluation.secondDateLikelihood);
  });

  it("persists the simulation in storage and reuses cache on second request", async () => {
    const sim1 = await runDatingSimulation(personA, personB, { forceFresh: true });
    expect(db.getSimulationById(sim1.id)).not.toBeNull();

    // Calling again without forceFresh should return cached instance
    const sim2 = await runDatingSimulation(personA, personB, { forceFresh: false });
    expect(sim2.id).toBe(sim1.id);
  });

  it("refuses to simulate date between a person and themselves", async () => {
    await expect(runDatingSimulation(personA, personA)).rejects.toThrow("Cannot run simulation with the same person.");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { runDatingSimulation } from "@/lib/simulation/simulator";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { db } from "@/lib/storage/store";

describe("Actual Dating Simulation Engine", () => {
  const feifei = SEED_PEOPLE.find((p) => p.name.includes("Fei-Fei Li"))!;
  const demis = SEED_PEOPLE.find((p) => p.name === "Demis Hassabis")!;

  beforeEach(() => {
    db.resetToSeeds();
  });

  it("orchestrates an alternating multi-turn date between two agents", async () => {
    const sim = await runDatingSimulation(feifei, demis, { turnsCount: 6, forceFresh: true });

    expect(sim.id).toBeDefined();
    expect(sim.personAId).toBe(feifei.id);
    expect(sim.personBId).toBe(demis.id);
    expect(sim.turns.length).toBe(6);

    // Verify alternating speakers
    for (let i = 0; i < sim.turns.length; i++) {
      const turn = sim.turns[i];
      expect(turn.turnIndex).toBe(i);
      if (i % 2 === 0) {
        expect(turn.speakerId).toBe(feifei.id);
      } else {
        expect(turn.speakerId).toBe(demis.id);
      }
    }

    // Verify evaluation
    expect(sim.evaluation.overallSimulationScore).toBeGreaterThanOrEqual(50);
    expect(sim.evaluation.narrativeSummary.length).toBeGreaterThan(15);
    expect(sim.evaluation.standoutMoments.length).toBeGreaterThan(0);
    expect(["very_high", "high", "moderate", "unlikely"]).toContain(sim.evaluation.secondDateLikelihood);
  });

  it("persists the simulation in storage and reuses cache on second request", async () => {
    const sim1 = await runDatingSimulation(feifei, demis, { forceFresh: true });
    expect(db.getSimulationById(sim1.id)).not.toBeNull();

    // Calling again without forceFresh should return cached instance
    const sim2 = await runDatingSimulation(feifei, demis, { forceFresh: false });
    expect(sim2.id).toBe(sim1.id);
  });

  it("refuses to simulate date between a person and themselves", async () => {
    await expect(runDatingSimulation(feifei, feifei)).rejects.toThrow("Cannot run simulation with the same person.");
  });
});

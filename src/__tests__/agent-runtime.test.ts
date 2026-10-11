import { describe, it, expect } from "vitest";
import { PersonAgent } from "@/lib/agents/runtime";
import { SEED_PEOPLE } from "@/lib/data/seed-people";

describe("Agent Runtime & Differentiation", () => {
  const satya = SEED_PEOPLE.find((p) => p.name === "Satya Nadella")!;
  const jensen = SEED_PEOPLE.find((p) => p.name === "Jensen Huang")!;
  const mira = SEED_PEOPLE.find((p) => p.name === "Mira Murati")!;

  it("instantiates distinct agent identities for each person", async () => {
    const agentSatya = await PersonAgent.create(satya);
    const agentJensen = await PersonAgent.create(jensen);
    const agentMira = await PersonAgent.create(mira);

    expect(agentSatya.person.id).not.toBe(agentJensen.person.id);
    expect(agentSatya.analysis.coreIdentityPrompt).toContain("Satya Nadella");
    expect(agentJensen.analysis.coreIdentityPrompt).toContain("Jensen Huang");
    expect(agentMira.analysis.coreIdentityPrompt).toContain("Mira Murati");

    expect(agentSatya.analysis.conversationalTone).not.toBe(agentJensen.analysis.conversationalTone);
  });

  it("evaluates a candidate directionally with custom reasoning", async () => {
    const agentSatya = await PersonAgent.create(satya);
    const evalResult = await agentSatya.evaluateCandidate(mira);

    expect(evalResult.directionalScore).toBeGreaterThan(40);
    expect(evalResult.directionalScore).toBeLessThanOrEqual(100);
    expect(evalResult.reasoning).toContain(satya.name);
    expect(evalResult.reasoning).toContain(mira.name);
    expect(evalResult.sharedHighlights.length).toBeGreaterThan(0);
  });

  it("generates contextual conversation turns referencing person's real interests", async () => {
    const agentSatya = await PersonAgent.create(satya);
    const turn = await agentSatya.generateTurn({
      history: [],
      venue: { name: "The Conservatory at Blue Bottle", atmosphere: "Quiet and bright" },
      partner: mira,
      turnIndex: 0,
      isOpener: true,
    });

    expect(turn.speakerId).toBe(satya.id);
    expect(turn.speakerName).toBe(satya.name);
    expect(turn.turnIndex).toBe(0);
    expect(turn.message.length).toBeGreaterThan(20);
    expect(turn.vibeSignal).toBeDefined();
  });
});

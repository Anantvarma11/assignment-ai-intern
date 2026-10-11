import { describe, it, expect } from "vitest";
import { PersonAgent } from "@/lib/agents/runtime";
import { SEED_PEOPLE } from "@/lib/data/seed-people";

describe("Agent Runtime & Differentiation", () => {
  const personA = SEED_PEOPLE[0];
  const personB = SEED_PEOPLE[1];
  const personC = SEED_PEOPLE[2];

  it("instantiates distinct agent identities for each person", async () => {
    const agentA = await PersonAgent.create(personA);
    const agentB = await PersonAgent.create(personB);
    const agentC = await PersonAgent.create(personC);

    expect(agentA.person.id).not.toBe(agentB.person.id);
    expect(agentA.analysis.coreIdentityPrompt).toContain(personA.name);
    expect(agentB.analysis.coreIdentityPrompt).toContain(personB.name);
    expect(agentC.analysis.coreIdentityPrompt).toContain(personC.name);

    expect(agentA.analysis.conversationalTone).not.toBe(agentB.analysis.conversationalTone);
  });

  it("evaluates a candidate directionally with custom reasoning", async () => {
    const agentA = await PersonAgent.create(personA);
    const evalResult = await agentA.evaluateCandidate(personC);

    expect(evalResult.directionalScore).toBeGreaterThan(40);
    expect(evalResult.directionalScore).toBeLessThanOrEqual(100);
    expect(evalResult.reasoning).toContain(personA.name);
    expect(evalResult.reasoning).toContain(personC.name);
    expect(evalResult.sharedHighlights.length).toBeGreaterThan(0);
  });

  it("generates contextual conversation turns referencing person's real interests", async () => {
    const agentA = await PersonAgent.create(personA);
    const turn = await agentA.generateTurn({
      history: [],
      venue: { name: "The Conservatory at Blue Bottle", atmosphere: "Quiet and bright" },
      partner: personC,
      turnIndex: 0,
      isOpener: true,
    });

    expect(turn.speakerId).toBe(personA.id);
    expect(turn.speakerName).toBe(personA.name);
    expect(turn.turnIndex).toBe(0);
    expect(turn.message.length).toBeGreaterThan(20);
    expect(turn.vibeSignal).toBeDefined();
  });
});

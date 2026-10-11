import { describe, it, expect } from "vitest";
import { scrapeProfilesWithApify } from "@/lib/ingestion/apify";
import { runCriticPass } from "@/lib/ingestion/critic";
import { getCompatibilityMatrix } from "@/lib/matching/scorer";
import { db } from "@/lib/storage/store";

describe("Ingestion, Critic Pass, & Heatmap Matrix", () => {
  it("ingests profile via snapshot cache and generates raw evidence citations", async () => {
    const raw = await scrapeProfilesWithApify(
      "https://www.linkedin.com/in/marquesbrownlee",
      "https://www.instagram.com/mkbhd"
    );

    expect(raw).toBeDefined();
    expect(raw.linkedIn.fullName).toBe("Marques Brownlee");
    expect(raw.instagram.username).toBe("mkbhd");
    expect(raw.source).toBe("snapshot_cache");

    // Run Critic Pass
    const { person, citations } = runCriticPass(raw);

    expect(person.name).toBe("Marques Brownlee");
    expect(person.verifiedSources.linkedIn).toBe(true);
    expect(person.verifiedSources.instagram).toBe(true);

    // Citations must be populated with specific IDs
    expect(citations["li:about"] || citations["li:exp:1"]).toBeDefined();
    expect(citations["ig:bio"] || citations["ig:post:1"]).toBeDefined();

    // Check that every provenance item links to a verified citation
    expect(person.provenance.length).toBeGreaterThan(0);
    for (const p of person.provenance) {
      expect(p.verified).toBe(true);
    }
  });

  it("produces full 26x26 compatibility matrix with precomputed simulations", () => {
    const matrixData = getCompatibilityMatrix();

    expect(matrixData.people.length).toBe(26);
    // Directed pairs between distinct people: 26 * 25 = 650
    expect(matrixData.matrix.length).toBe(650);

    // Verify simulated dates are present across pairs
    const simulatedPairs = matrixData.matrix.filter((m) => m.hasSimulation);
    expect(simulatedPairs.length).toBeGreaterThan(0);

    // Verify compatibility scores are within valid bounds
    for (const cell of matrixData.matrix) {
      expect(cell.score).toBeGreaterThanOrEqual(30);
      expect(cell.score).toBeLessThanOrEqual(100);
    }
  });
});

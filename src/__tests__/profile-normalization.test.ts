import { describe, it, expect } from "vitest";
import { normalizeProfile } from "@/lib/agents/profile-analyzer";

describe("Profile Normalization and Analysis Output", () => {
  it("normalizes a valid input into a full Person entity", () => {
    const input = {
      name: "Ada Lovelace",
      role: "Mathematician & Computer Pioneer",
      company: "Analytical Engine Project",
      location: "London, UK",
      linkedInUrl: "https://www.linkedin.com/in/adalovelace",
      instagramUrl: "https://www.instagram.com/adalovelace",
      summary: "First computer programmer, pioneer of algorithmic thinking and poetic science.",
      interests: ["Algorithmic Computation", "Poetic Science", "Bernoulli Numbers"],
      hobbies: ["Harp Playing", "Equestrian Sports", "Mathematics Puzzles"],
    };

    const person = normalizeProfile(input);

    expect(person.name).toBe("Ada Lovelace");
    expect(person.id).toContain("person-adalovelace");
    expect(person.interests.length).toBe(3);
    expect(person.hobbies.length).toBe(3);
    expect(person.provenance.length).toBeGreaterThan(0);
    expect(person.confidenceScore).toBeGreaterThan(0.5);
    expect(person.confidenceScore).toBeLessThanOrEqual(1.0);
  });

  it("identifies missing information and flags uncertainty", () => {
    const incompleteInput = {
      name: "Alan Turing",
      role: "Cryptanalyst & Mathematician",
      company: "Bletchley Park",
      location: "Manchester, UK",
      linkedInUrl: "https://www.linkedin.com/in/alanturing",
      instagramUrl: "https://www.instagram.com/alanturing",
      summary: "Pioneer in artificial intelligence, cryptography, and morphological biology.",
      interests: ["Turing Machines", "Enigma Decryption"],
      hobbies: ["Long Distance Marathon Running", "Chess"],
      // explicitPreferences omitted
    };

    const person = normalizeProfile(incompleteInput);

    expect(person.missingInformation.length).toBeGreaterThan(0);
    expect(person.missingInformation).toContain("Explicit communication style");
    expect(person.uncertaintyFlags.length).toBeGreaterThan(0);
  });

  it("throws validation error on invalid URLs during normalization", () => {
    const invalidInput = {
      name: "Invalid User",
      role: "Tester",
      company: "Acme",
      location: "NYC",
      linkedInUrl: "https://google.com/test", // Not LinkedIn
      instagramUrl: "https://www.instagram.com/tester",
      summary: "Testing validation boundaries.",
      interests: ["Testing", "Quality"],
      hobbies: ["Hiking", "Reading"],
    };

    expect(() => normalizeProfile(invalidInput)).toThrow();
  });
});

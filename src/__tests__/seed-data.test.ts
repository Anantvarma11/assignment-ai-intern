import { describe, it, expect } from "vitest";
import { SEED_PEOPLE } from "@/lib/data/seed-people";
import { PersonSchema } from "@/lib/types";

describe("Seed People Dataset Verification", () => {
  it("contains at least 25 real people", () => {
    expect(SEED_PEOPLE.length).toBeGreaterThanOrEqual(25);
  });

  it("all profiles validate strictly against PersonSchema", () => {
    for (const person of SEED_PEOPLE) {
      const result = PersonSchema.safeParse(person);
      if (!result.success) {
        console.error(`Validation failed for ${person.name}:`, result.error.format());
      }
      expect(result.success).toBe(true);
    }
  });

  it("each person has official LinkedIn and Instagram profile URLs", () => {
    for (const person of SEED_PEOPLE) {
      expect(person.linkedInUrl).toContain("linkedin.com");
      expect(person.instagramUrl).toContain("instagram.com");
      expect(person.verifiedSources.linkedIn).toBe(true);
      expect(person.verifiedSources.instagram).toBe(true);
    }
  });

  it("has no duplicate IDs or handles", () => {
    const ids = new Set<string>();
    const handles = new Set<string>();
    for (const person of SEED_PEOPLE) {
      expect(ids.has(person.id)).toBe(false);
      expect(handles.has(person.handle)).toBe(false);
      ids.add(person.id);
      handles.add(person.handle);
    }
  });

  it("each person has structured provenance with verified flags", () => {
    for (const person of SEED_PEOPLE) {
      expect(person.provenance.length).toBeGreaterThan(0);
      for (const item of person.provenance) {
        expect(["linkedin", "instagram", "user_input", "inferred"]).toContain(item.source);
        expect(typeof item.verified).toBe("boolean");
      }
    }
  });
});

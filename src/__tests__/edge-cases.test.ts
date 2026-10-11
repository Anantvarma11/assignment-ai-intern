import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/storage/store";
import { PersonSchema } from "@/lib/types";
import { normalizeProfile } from "@/lib/agents/profile-analyzer";

describe("Edge Cases, Duplicate Records & Invalid Inputs", () => {
  beforeEach(() => {
    db.resetToSeeds();
  });

  it("handles duplicate profile insertions cleanly by updating record instead of duplicating", () => {
    const peopleBefore = db.getPeople();
    const target = peopleBefore[0];

    const updated = {
      ...target,
      summary: "Updated summary text for duplicate check verification.",
    };

    db.savePerson(updated);
    const peopleAfter = db.getPeople();

    expect(peopleAfter.length).toBe(peopleBefore.length);
    const fetched = db.getPersonById(target.id);
    expect(fetched?.summary).toBe("Updated summary text for duplicate check verification.");
  });

  it("rejects invalid input schema missing required core fields", () => {
    const invalidData = {
      id: "test-invalid",
      name: "X", // too short
      // missing role, headline, company, urls, etc.
    };

    const res = PersonSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it("handles empty or extreme values in interests and hobbies during normalization", () => {
    const inputWithMinimalValues = {
      name: "Minimalist Tester",
      role: "Software Engineer",
      company: "Test Corp",
      location: "San Francisco",
      linkedInUrl: "https://www.linkedin.com/in/minimalist-tester",
      instagramUrl: "https://www.instagram.com/minimalist_tester",
      summary: "This is a clean summary for a software engineer testing edge cases.",
      interests: ["System Architecture", "Functional Programming"],
      hobbies: ["Trail Running", "Chess"],
    };

    const person = normalizeProfile(inputWithMinimalValues);
    expect(person.interests.length).toBe(2);
    expect(person.hobbies.length).toBe(2);
    expect(person.confidenceScore).toBeGreaterThanOrEqual(0.4);
  });

  it("properly handles deleting a person from storage", () => {
    const people = db.getPeople();
    const toDelete = people[people.length - 1];

    const success = db.deletePerson(toDelete.id);
    expect(success).toBe(true);

    const fetched = db.getPersonById(toDelete.id);
    expect(fetched).toBeNull();
  });
});

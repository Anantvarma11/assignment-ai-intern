import fs from "fs";
import path from "path";
import { Person } from "@/lib/types";
import { SEED_PEOPLE } from "./seed-people";

export interface VolunteerRecord {
  name: string;
  linkedin_url: string;
  instagram_url: string;
  consent: boolean;
}

/**
 * Loads and parses participants from data/volunteers.csv.
 * Strictly verifies consent=yes.
 */
export function loadConsentingVolunteers(): {
  volunteers: VolunteerRecord[];
  people: Person[];
  count: number;
  hasMinimum25: boolean;
  message?: string;
} {
  const csvPath = path.join(process.cwd(), "data", "volunteers.csv");
  if (!fs.existsSync(csvPath)) {
    return {
      volunteers: [],
      people: SEED_PEOPLE,
      count: SEED_PEOPLE.length,
      hasMinimum25: SEED_PEOPLE.length >= 25,
      message: "data/volunteers.csv not found; falling back to seed roster.",
    };
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return {
      volunteers: [],
      people: [],
      count: 0,
      hasMinimum25: false,
      message: "data/volunteers.csv is empty or missing headers.",
    };
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const liIdx = headers.indexOf("linkedin_url");
  const igIdx = headers.indexOf("instagram_url");
  const consentIdx = headers.indexOf("consent");

  const volunteers: VolunteerRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    const name = parts[nameIdx] || "";
    const li = parts[liIdx] || "";
    const ig = parts[igIdx] || "";
    const consent = parts[consentIdx]?.toLowerCase() === "yes";

    if (name && consent) {
      volunteers.push({
        name,
        linkedin_url: li,
        instagram_url: ig,
        consent,
      });
    }
  }

  // Map to matching Person profiles from SEED_PEOPLE
  const people: Person[] = [];
  for (const v of volunteers) {
    const match = SEED_PEOPLE.find(
      (p) =>
        p.name.toLowerCase() === v.name.toLowerCase() ||
        p.linkedInUrl.toLowerCase() === v.linkedin_url.toLowerCase() ||
        p.instagramUrl.toLowerCase() === v.instagram_url.toLowerCase()
    );
    if (match) {
      people.push(match);
    }
  }

  const hasMinimum25 = people.length >= 25;
  const message = hasMinimum25
    ? `Successfully verified ${people.length} consenting participants from data/volunteers.csv (consent=yes).`
    : `Warning: data/volunteers.csv contains ${people.length} consenting participants (minimum required: 25).`;

  return {
    volunteers,
    people,
    count: people.length,
    hasMinimum25,
    message,
  };
}

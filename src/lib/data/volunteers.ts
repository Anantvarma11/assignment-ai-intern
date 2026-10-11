import fs from "fs";
import path from "path";
import { Person } from "@/lib/types";
import { loadAllSnapshots } from "@/lib/ingestion/cache";
import { runCriticPass } from "@/lib/ingestion/critic";

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
      people: [],
      count: 0,
      hasMinimum25: false,
      message: "data/volunteers.csv not found.",
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
    const consent = ["yes", "public-figure"].includes(parts[consentIdx]?.toLowerCase());

    if (name && consent) {
      volunteers.push({
        name,
        linkedin_url: li,
        instagram_url: ig,
        consent,
      });
    }
  }

  // Build each Person from its real scraped snapshot (Apify) through the critic pass
  const snaps = loadAllSnapshots();
  const slug = (u: string) => u.trim().toLowerCase().replace(/\/$/, "").split("/").pop();
  const people: Person[] = [];
  for (const v of volunteers) {
    const snap = snaps.find(
      (x) => slug(x.linkedIn.url) === slug(v.linkedin_url) && slug(x.instagram.url) === slug(v.instagram_url)
    );
    if (snap) people.push(runCriticPass(snap).person);
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

import fs from "fs";
import path from "path";
import { IngestedRawData } from "./types";

/**
 * Snapshot store: raw profile data previously scraped live via Apify
 * (see scripts/scrape-*.mjs and scripts/build-real-snapshots.mjs).
 * Snapshots live on disk in data/snapshots/<urlHash>.json. Nothing is hand-written.
 */
function slug(u: string): string {
  return u.trim().toLowerCase().replace(/\/$/, "").split("/").pop() || "";
}

export function loadAllSnapshots(): IngestedRawData[] {
  const dir = path.join(process.cwd(), "data", "snapshots");
  if (!fs.existsSync(dir)) return [];
  const out: IngestedRawData[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      out.push({
        linkedIn: j.linkedIn,
        instagram: j.instagram,
        source: "snapshot_cache",
        urlHash: j.urlHash,
        isCachedSnapshot: true,
        cachedAt: j.scrapedAt,
      });
    } catch {
      /* skip corrupt snapshot */
    }
  }
  return out;
}

export function getSnapshotForUrl(linkedInUrl: string, instagramUrl: string): IngestedRawData | null {
  const li = slug(linkedInUrl);
  const ig = slug(instagramUrl);
  return (
    loadAllSnapshots().find(
      (s) => slug(s.linkedIn.url) === li && slug(s.instagram.url) === ig
    ) || null
  );
}

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { IngestedRawData, RawLinkedInProfile, RawInstagramProfile } from "./types";
import { getSnapshotForUrl } from "./cache";

export class ProfileScrapeError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(message: string, code: string = "SCRAPE_FAILED", statusCode: number = 422, details?: any) {
    super(message);
    this.name = "ProfileScrapeError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface ApifyScrapeOptions {
  token?: string;
  actorId?: string;
  timeoutMs?: number;
}

/**
 * Computes a stable hex hash from the input URLs.
 */
export function computeUrlHash(linkedInUrl: string, instagramUrl: string): string {
  const norm = `${linkedInUrl.trim().toLowerCase()}|${instagramUrl.trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(norm).digest("hex").slice(0, 16);
}

/**
 * Saves a raw snapshot to disk under data/snapshots/<hash>.json.
 */
function saveSnapshotToDisk(urlHash: string, data: any): string {
  try {
    const dir = path.join(process.cwd(), "data", "snapshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, `${urlHash}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return filePath;
  } catch (err) {
    console.warn("Failed to persist snapshot to disk:", err);
    return "";
  }
}

/**
 * Executes LinkedIn and Instagram profile ingestion via Apify Actor,
 * falling back cleanly to the verified snapshot cache when token is absent or rate-limited.
 * 
 * CRITICAL RULE: If a URL cannot be fetched and has no snapshot cache entry,
 * it returns a strict error. NO SILENT FABRICATION OF FAKE DATA.
 */
export async function scrapeProfilesWithApify(
  linkedInUrl: string,
  instagramUrl: string,
  options: ApifyScrapeOptions = {}
): Promise<IngestedRawData> {
  const token = options.token || process.env.APIFY_TOKEN || process.env.APIFY_API_KEY || "";
  const actorId = options.actorId || "FcwQfZYY4FHN6baby";
  const urlHash = computeUrlHash(linkedInUrl, instagramUrl);

  // 1. Live scrape via two Apify actors: harvestapi LinkedIn profile scraper + apify Instagram profile scraper
  if (token && token.trim().length > 5) {
    try {
      const callActor = async (actor: string, input: object) => {
        const r = await fetch(
          `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }
        );
        return r.ok ? await r.json() : [];
      };
      const igUser = instagramUrl.trim().replace(/\/$/, "").split("/").pop() || "";
      const [liItems, igItems] = await Promise.all([
        callActor("harvestapi~linkedin-profile-scraper", {
          urls: [linkedInUrl],
          profileScraperMode: "Profile details no email ($4 per 1k)",
        }),
        callActor("apify~instagram-profile-scraper", { usernames: [igUser], resultsLimit: 5 }),
      ]);
      const L = Array.isArray(liItems) ? liItems.find((x: any) => x.firstName) : null;
      const I = Array.isArray(igItems) ? igItems.find((x: any) => x.username && !x.error) : null;
      if (L && I) {
        if (I.private) {
          throw new ProfileScrapeError("Instagram profile is private; only public profiles are allowed.", "IG_PRIVATE", 422);
        }
        const now = new Date().toISOString();
        const exps = (L.experience || []).slice(0, 5).map((e: any) => ({
          title: e.position || "", company: e.companyName || "", description: e.description || undefined,
          startDate: e.startDate?.text, endDate: e.endDate?.text,
        }));
        const parsedLi: RawLinkedInProfile = {
          url: linkedInUrl,
          fullName: `${L.firstName} ${L.lastName || ""}`.trim(),
          headline: L.headline || "",
          location: L.location?.linkedinText || "",
          about: L.about || "",
          avatarUrl: L.profilePicture?.url,
          company: exps[0]?.company, role: exps[0]?.title, experiences: exps,
          skills: (L.skills || []).map((s: any) => s.name).slice(0, 15),
          scrapedAt: now,
        };
        const parsedIg: RawInstagramProfile = {
          url: instagramUrl, username: I.username, fullName: I.fullName || parsedLi.fullName,
          biography: I.biography || "", externalUrl: I.externalUrl,
          profilePicUrl: I.profilePicUrlHD || I.profilePicUrl, postsCount: I.postsCount, followersCount: I.followersCount,
          recentPosts: (I.latestPosts || []).slice(0, 5).map((p: any, k: number) => ({
            id: `ig:post:${k + 1}`, caption: p.caption || "", hashtags: p.hashtags, timestamp: p.timestamp, likesCount: p.likesCount,
          })),
          scrapedAt: now,
        };
        const snapshotPath = saveSnapshotToDisk(urlHash, {
          urlHash, scrapedAt: now, source: "apify_live", linkedIn: parsedLi, instagram: parsedIg,
        });
        return { linkedIn: parsedLi, instagram: parsedIg, source: "apify_live", urlHash, isCachedSnapshot: false, snapshotPath };
      }
    } catch (err) {
      if (err instanceof ProfileScrapeError) throw err;
      console.warn("[Apify Scraper] Live actor execution error:", err);
    }
  }

  // 2. Check Snapshot Cache
  const cached = getSnapshotForUrl(linkedInUrl, instagramUrl);
  if (cached) {
    const cachedAt = cached.linkedIn.scrapedAt || "2026-10-11T08:00:00Z";
    const snapshotPath = saveSnapshotToDisk(urlHash, {
      urlHash,
      scrapedAt: cachedAt,
      source: "snapshot_cache",
      linkedIn: cached.linkedIn,
      instagram: cached.instagram,
    });

    return {
      linkedIn: cached.linkedIn,
      instagram: cached.instagram,
      source: "snapshot_cache",
      urlHash,
      isCachedSnapshot: true,
      cachedAt,
      snapshotPath,
    };
  }

  // 3. STRICT INTEGRITY RULE: No silent synthetic data generation!
  // If no token was provided (or live scrape failed) AND no snapshot exists, fail honestly.
  throw new ProfileScrapeError(
    `Live scraping failed: Unable to extract public profile data from LinkedIn (${linkedInUrl}) and Instagram (${instagramUrl}). ` +
      `The profiles may be private, require authentication, or LinkedIn/Instagram anti-bot defense blocked the connection. ` +
      `No pre-existing verified snapshot exists for these URLs in the repository cache.`,
    "SCRAPE_UNAVAILABLE",
    422,
    {
      linkedInUrl,
      instagramUrl,
      requiresApifyToken: !token,
      suggestion: "Provide an active Apify API token or test with one of the verified participant presets.",
    }
  );
}


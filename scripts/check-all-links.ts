import https from "https";
import { SEED_PEOPLE } from "../src/lib/data/seed-people";

interface LinkResult {
  person: string;
  platform: "LinkedIn" | "Instagram";
  url: string;
  status: number;
  redirectUrl?: string;
  classification: "OK" | "LOGIN_WALL" | "REDIRECT" | "BLOCKED" | "NOT_FOUND" | "ERROR";
}

function fetchStatus(urlStr: string): Promise<{ status: number; location?: string }> {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(
        u,
        {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          timeout: 7000,
        },
        (res) => {
          resolve({ status: res.statusCode || 0, location: res.headers.location });
        }
      );
      req.on("error", (err) => resolve({ status: 0 }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ status: 408 });
      });
      req.end();
    } catch (e) {
      resolve({ status: 0 });
    }
  });
}

async function main() {
  console.log("Checking all 52 links in SEED_PEOPLE...\n");
  const results: LinkResult[] = [];

  for (const person of SEED_PEOPLE) {
    // Check LinkedIn
    const liRes = await fetchStatus(person.linkedInUrl);
    let liClass: LinkResult["classification"] = "OK";
    if (liRes.status === 999 || liRes.status === 429) liClass = "BLOCKED"; // LinkedIn bot block
    else if (liRes.status === 301 || liRes.status === 302) {
      if (liRes.location?.includes("authwall") || liRes.location?.includes("login")) liClass = "LOGIN_WALL";
      else liClass = "REDIRECT";
    } else if (liRes.status === 404) liClass = "NOT_FOUND";
    else if (liRes.status === 0 || liRes.status === 408) liClass = "ERROR";

    results.push({
      person: person.name,
      platform: "LinkedIn",
      url: person.linkedInUrl,
      status: liRes.status,
      redirectUrl: liRes.location,
      classification: liClass,
    });

    // Check Instagram
    const igRes = await fetchStatus(person.instagramUrl);
    let igClass: LinkResult["classification"] = "OK";
    if (igRes.status === 301 || igRes.status === 302) {
      if (igRes.location?.includes("login") || igRes.location?.includes("accounts/login")) igClass = "LOGIN_WALL";
      else igClass = "REDIRECT";
    } else if (igRes.status === 404) igClass = "NOT_FOUND";
    else if (igRes.status === 429) igClass = "BLOCKED";
    else if (igRes.status === 0 || igRes.status === 408) igClass = "ERROR";

    results.push({
      person: person.name,
      platform: "Instagram",
      url: person.instagramUrl,
      status: igRes.status,
      redirectUrl: igRes.location,
      classification: igClass,
    });
  }

  console.log("| Person | Platform | URL | HTTP Status | Classification | Notes |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const r of results) {
    console.log(
      `| ${r.person} | ${r.platform} | \`${r.url}\` | ${r.status} | **${r.classification}** | ${
        r.redirectUrl ? `Redirects to ${r.redirectUrl.slice(0, 40)}...` : "-"
      } |`
    );
  }

  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.classification] = (counts[r.classification] || 0) + 1;
  }
  console.log("\nSummary Counts:", counts);
}

main().catch(console.error);

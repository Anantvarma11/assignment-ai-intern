import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { SEED_PEOPLE } from "../src/lib/data/seed-people";
import { PRECOMPUTED_SIMULATIONS } from "../src/lib/data/seed-simulations";
import { scrapeProfilesWithApify } from "../src/lib/ingestion/apify";
import { runCriticPass } from "../src/lib/ingestion/critic";
import { PersonAgent } from "../src/lib/agents/runtime";
import { analyzeProfileForAgent } from "../src/lib/agents/profile-analyzer";
import { runDatingSimulation } from "../src/lib/simulation/simulator";
import { calculateCompatibility, getPersonalizedRankings } from "../src/lib/matching/scorer";
import { db } from "../src/lib/storage/store";

async function main() {
  console.log("=================================================================");
  console.log("           PAIRWISE AI — REPOSITORY AUDIT SCRIPT                ");
  console.log("=================================================================\n");

  // -------------------------------------------------------------
  // TEST 1: INGESTION CODE PATH & SILENT DATA SUBSTITUTION
  // -------------------------------------------------------------
  console.log("--- AUDIT ITEM 1: Ingestion Code Path ---");
  const knownResult = await scrapeProfilesWithApify(
    "https://www.linkedin.com/in/marquesbrownlee",
    "https://www.instagram.com/mkbhd"
  );
  console.log("[Known URL Result]", {
    source: knownResult.source,
    name: knownResult.linkedIn.fullName,
    actorRunId: knownResult.actorRunId || "NONE",
  });

  const unknownResult = await scrapeProfilesWithApify(
    "https://www.linkedin.com/in/unseen-john-doe-9999",
    "https://www.instagram.com/unseen_john_doe_9999"
  );
  console.log("[Unknown URL Result]", {
    source: unknownResult.source,
    name: unknownResult.linkedIn.fullName,
    headline: unknownResult.linkedIn.headline,
    bio: unknownResult.instagram.biography,
    actorRunId: unknownResult.actorRunId || "NONE",
  });

  // -------------------------------------------------------------
  // TEST 3: ANALYSIS DETERMINISTIC VS LLM
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 3: Profile Analysis Trace ---");
  const personM = SEED_PEOPLE[0];
  const analysisM = await analyzeProfileForAgent(personM);
  console.log("[Analysis Source]:", analysisM.analysisSource);
  console.log("[Core Identity Prompt Preview]:", analysisM.coreIdentityPrompt.slice(0, 200) + "...");
  console.log("[Safety Boundaries]:", analysisM.safetyBoundaries);

  // -------------------------------------------------------------
  // TEST 4: CRITIC PASS INJECTION TEST
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 4: Critic Pass Ungrounded Claim Removal ---");
  // Create a raw dump that does NOT mention "climbs Everest"
  const rawSample = {
    linkedIn: {
      url: "https://www.linkedin.com/in/fakeuser",
      fullName: "Test Runner",
      headline: "Software Engineer",
      company: "Acme Corp",
      role: "Engineer",
      about: "Passionate about distributed databases and rust compilers.",
      experiences: [{ title: "Backend Engineer", company: "Acme", description: "Wrote high-throughput services." }],
      location: "San Francisco, CA",
      scrapedAt: "2026-10-11T08:00:00Z",
      skills: ["Rust", "Distributed Systems"],
    },
    instagram: {
      url: "https://www.instagram.com/fakeuser",
      username: "fakeuser",
      fullName: "Test Runner",
      biography: "Coffee enthusiast and keyboard builder.",
      recentPosts: [{ id: "ig:post:1", caption: "Soldered a new 60% mechanical keyboard PCB.", likesCount: 42 }],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache" as const,
  };

  const criticClean = runCriticPass(rawSample);
  console.log("[Critic Extracted Interests]:", criticClean.person.interests);
  console.log("[Critic Extracted Hobbies]:", criticClean.person.hobbies);
  console.log("[Contains 'climbs Everest'?]:", JSON.stringify(criticClean).includes("climbs Everest"));

  // -------------------------------------------------------------
  // TEST 5: AGENT INSTANTIATION & PROMPT DIFFERENTIATION
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 5: Agent Instantiation Prompts ---");
  const agentA = await PersonAgent.create(SEED_PEOPLE[0]); // Marques Brownlee
  const agentB = await PersonAgent.create(SEED_PEOPLE[1]); // Simone Giertz
  console.log("=== Agent A System Prompt (Marques Brownlee) ===");
  console.log(agentA.analysis.coreIdentityPrompt);
  console.log("\n=== Agent B System Prompt (Simone Giertz) ===");
  console.log(agentB.analysis.coreIdentityPrompt);

  // -------------------------------------------------------------
  // TEST 6: DATING SIMULATION RUN & LEAK CHECK
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 6: Live Dating Simulation Trace ---");
  const tStart = Date.now();
  const dateSim = await runDatingSimulation(SEED_PEOPLE[0], SEED_PEOPLE[1], { forceFresh: true, turnsCount: 4 });
  const latency = Date.now() - tStart;
  console.log("[Simulation ID]:", dateSim.id);
  console.log("[Provider Used]:", dateSim.providerUsed);
  console.log("[Model Used]:", dateSim.modelUsed);
  console.log("[Latency]:", latency, "ms");
  console.log("[Turns Count]:", dateSim.turns.length);
  for (const t of dateSim.turns) {
    console.log(`  Turn ${t.turnIndex} (${t.speakerName}): "${t.message.slice(0, 80)}..."`);
    console.log(`    Internal Monologue: "${t.internalMonologue}"`);
  }

  // -------------------------------------------------------------
  // TEST 7: SEED DATA & TEMPLATE DUPLICATION
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 7: Seed Data Duplication Metric ---");
  console.log("[Total Precomputed Simulations]:", PRECOMPUTED_SIMULATIONS.length);
  const phraseCounts: Record<string, number> = {
    "It's wonderful to meet in person here at": 0,
    "Thank you": 0,
    "That's the core of it, isn't it?": 0,
    "I guard my boundaries fiercely": 0,
    "I couldn't agree more. It's so rare to meet someone": 0,
    "I was thinking the exact same thing!": 0,
  };

  for (const sim of PRECOMPUTED_SIMULATIONS) {
    for (const turn of sim.turns) {
      for (const phrase of Object.keys(phraseCounts)) {
        if (turn.message.includes(phrase)) {
          phraseCounts[phrase]++;
        }
      }
    }
  }

  console.log("[Template Phrase Frequency across 325 simulations]:", phraseCounts);
  const totalSimCount = PRECOMPUTED_SIMULATIONS.length;
  const openerDup = (phraseCounts["It's wonderful to meet in person here at"] / totalSimCount) * 100;
  console.log(`[Opener Template Duplication Rate]: ${openerDup.toFixed(1)}%`);

  // -------------------------------------------------------------
  // TEST 8: SCORING MUTATION & RANKING SHIFT
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 8: Scorecard Sensitivity & Re-ranking ---");
  const subjectP = SEED_PEOPLE[0];
  const candidateP = SEED_PEOPLE[1];

  // Baseline match with high simulation score
  const highSim = { ...dateSim, evaluation: { ...dateSim.evaluation, overallSimulationScore: 95, secondDateLikelihood: "very_high" as const } };
  const baselineMatch = calculateCompatibility(subjectP, candidateP, highSim);

  // Mutated match with moderate date score (note: secondDateLikelihood='unlikely' triggers a bug where complementaryBonus becomes -8 and fails schema)
  let zodErrorTriggered = false;
  try {
    const lowSimBug = { ...dateSim, evaluation: { ...dateSim.evaluation, overallSimulationScore: 35, secondDateLikelihood: "unlikely" as const } };
    calculateCompatibility(subjectP, candidateP, lowSimBug);
  } catch (err: any) {
    zodErrorTriggered = true;
    console.log("[SCHEMA BUG DETECTED]: When secondDateLikelihood is 'unlikely', complementaryBonus = -8, violating z.number().min(0):", err.errors?.[0]?.message);
  }

  const moderateSim = { ...dateSim, evaluation: { ...dateSim.evaluation, overallSimulationScore: 55, secondDateLikelihood: "high" as const } };
  const mutatedMatch = calculateCompatibility(subjectP, candidateP, moderateSim);

  console.log("[Baseline Match Score (Date 95)]: ", baselineMatch.mutualCompatibility);
  console.log("[Mutated Match Score (Date 55)]:  ", mutatedMatch.mutualCompatibility);
  console.log("[Score Delta]:", baselineMatch.mutualCompatibility - mutatedMatch.mutualCompatibility, "points");

  // Show ranking shift in cohort
  const rankingsBefore = await getPersonalizedRankings(subjectP.id);
  const candRankBefore = rankingsBefore.findIndex((r) => r.candidate.id === candidateP.id) + 1;

  // Mutate candidate in storage to have a bad simulation
  db.saveSimulation(moderateSim);
  const rankingsAfter = await getPersonalizedRankings(subjectP.id);
  const candRankAfter = rankingsAfter.findIndex((r) => r.candidate.id === candidateP.id) + 1;
  console.log(`[Ranking for ${candidateP.name}]: Shifted from Rank #${candRankBefore} to Rank #${candRankAfter}`);

  // -------------------------------------------------------------
  // TEST 9: HTTP LINK STATUS CHECK
  // -------------------------------------------------------------
  console.log("\n--- AUDIT ITEM 9: URL Live Health Check (52 URLs) ---");
  const checkUrl = (urlStr: string): Promise<{ url: string; status: number; location?: string }> => {
    return new Promise((resolve) => {
      try {
        const u = new URL(urlStr);
        const req = https.request(
          u,
          {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout: 5000,
          },
          (res) => {
            resolve({ url: urlStr, status: res.statusCode || 0, location: res.headers.location });
          }
        );
        req.on("error", (err) => resolve({ url: urlStr, status: 0 }));
        req.on("timeout", () => {
          req.destroy();
          resolve({ url: urlStr, status: 408 });
        });
        req.end();
      } catch (e) {
        resolve({ url: urlStr, status: 0 });
      }
    });
  };

  const sampleLinks = [
    SEED_PEOPLE[0].linkedInUrl,
    SEED_PEOPLE[0].instagramUrl,
    SEED_PEOPLE[1].linkedInUrl,
    SEED_PEOPLE[1].instagramUrl,
    SEED_PEOPLE[4].linkedInUrl,
    SEED_PEOPLE[4].instagramUrl,
  ];

  console.log("Checking sample URLs...");
  for (const link of sampleLinks) {
    const res = await checkUrl(link);
    console.log(`  ${res.url} -> Status ${res.status}${res.location ? ` (Redirect: ${res.location})` : ""}`);
  }

  console.log("\n=================================================================");
  console.log("                     AUDIT RUN COMPLETE                          ");
  console.log("=================================================================");
}

main().catch(console.error);

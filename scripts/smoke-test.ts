import { scrapeProfilesWithApify } from "../src/lib/ingestion/apify";
import { runCriticPass } from "../src/lib/ingestion/critic";
import { PersonAgent } from "../src/lib/agents/runtime";
import { runDatingSimulation } from "../src/lib/simulation/simulator";
import { calculateCompatibility, getPersonalizedRankings } from "../src/lib/matching/scorer";
import { db } from "../src/lib/storage/store";
import { SEED_PEOPLE } from "../src/lib/data/seed-people";

async function runSmokeTest() {
  console.log("=================================================================");
  console.log("       PAIRWISE AI — END-TO-END MANUAL SMOKE TEST               ");
  console.log("=================================================================\n");

  const startTime = Date.now();

  const linkedInUrl = process.argv[2] || "https://www.linkedin.com/in/marquesbrownlee";
  const instagramUrl = process.argv[3] || "https://www.instagram.com/mkbhd";

  console.log(`[Input LinkedIn URL]:  ${linkedInUrl}`);
  console.log(`[Input Instagram URL]: ${instagramUrl}\n`);

  // Step 1: Ingestion
  console.log("Step 1: Ingesting Profile Data...");
  const rawData = await scrapeProfilesWithApify(linkedInUrl, instagramUrl);
  console.log("  -> Ingestion Source:", rawData.source.toUpperCase());
  console.log("  -> Is Cached Snapshot:", rawData.isCachedSnapshot);
  if (rawData.isCachedSnapshot) {
    console.log(`  -> Snapshot Cached At: ${rawData.cachedAt}`);
  }
  console.log(`  -> URL Hash: ${rawData.urlHash}`);
  console.log(`  -> Full Name: ${rawData.linkedIn.fullName}`);
  console.log(`  -> Headline: ${rawData.linkedIn.headline}`);
  console.log(`  -> Instagram Handle: @${rawData.instagram.username}\n`);

  // Step 2: Critic Pass
  console.log("Step 2: Executing Grounded Critic Pass...");
  const { person, citations, bundle, rejectedClaims } = runCriticPass(rawData);
  console.log(`  -> Verified Evidence Citations: ${Object.keys(citations).length} tags`);
  console.log(`  -> Citations Registered: ${Object.keys(citations).join(", ")}`);
  console.log(`  -> Verified Interests: ${person.interests.join(", ")}`);
  console.log(`  -> Verified Hobbies: ${person.hobbies.join(", ")}`);
  console.log(`  -> Grounded Dealbreakers: ${person.explicitPreferences.dealbreakers.join(", ")}`);
  console.log(`  -> Rejected Ungrounded Claims: ${rejectedClaims.length} items logged\n`);

  // Step 3: Instantiate Persona Agent
  console.log("Step 3: Instantiating Twin Persona Agent...");
  const agent = await PersonAgent.create(person);
  console.log("  -> Agent Identity Prompt Length:", agent.analysis.coreIdentityPrompt.length, "chars");
  console.log("  -> Safety Boundaries Count:", agent.analysis.safetyBoundaries.length);
  console.log("  -> Cognitive Vibe:", agent.analysis.cognitiveStyle, "\n");

  // Step 4: Speed Date Simulation with a Peer
  console.log("Step 4: Executing Agent-to-Agent Dating Simulation...");
  const partner = SEED_PEOPLE.find((p) => p.id !== person.id) || SEED_PEOPLE[1];
  console.log(`  -> Date Partner: ${partner.name} (${partner.role})`);

  const sim = await runDatingSimulation(person, partner, {
    turnsCount: 6,
    forceFresh: true,
    tier: "speed_date",
  });

  console.log(`  -> Simulation ID: ${sim.id}`);
  console.log(`  -> Provider Badge: [${sim.providerUsed.toUpperCase()}] Model: ${sim.modelUsed}`);
  console.log(`  -> Venue: ${sim.venue.name} (${sim.venue.atmosphere})`);
  console.log(`  -> Total Alternating Turns: ${sim.turns.length}`);
  console.log(`  -> Chemistry Score: ${sim.evaluation.chemistryScore}%`);
  console.log(`  -> Second Date Likelihood: ${sim.evaluation.secondDateLikelihood}`);
  console.log(`  -> Narrative Summary: "${sim.evaluation.narrativeSummary}"\n`);

  // Step 5: Post-Date Scorecards & Grounding Audit
  console.log("Step 5: Verifying Private Scorecards & Grounding Judge Audit...");
  if (sim.scorecardA) {
    console.log(`  -> ${person.name}'s Scorecard on ${partner.name}:`);
    console.log(`     Chemistry: ${sim.scorecardA.chemistryScore}% | Values Fit: ${sim.scorecardA.valuesFitScore}% | Would See Again: ${sim.scorecardA.wouldSeeAgain}`);
  }
  if (sim.groundingAudit) {
    console.log(`  -> Grounding Judge Verdict: ${sim.groundingAudit.verdict.toUpperCase()}`);
    console.log(`  -> Grounding Score: ${sim.groundingAudit.groundingScore}% (${sim.groundingAudit.auditedClaimsCount} turns audited)`);
  }
  console.log();

  // Step 6: Compatibility Match & Personalized Rankings
  console.log("Step 6: Calculating Compatibility Match & Cohort Ranking...");
  const match = calculateCompatibility(person, partner, sim);
  console.log(`  -> Mutual Compatibility: ${match.mutualCompatibility}% (Simulation 60% Dominant Weight)`);
  console.log(`  -> Directional Fit (${person.name} -> ${partner.name}): ${match.directionalCompatibility.subjectToCandidate}%`);
  console.log(`  -> Directional Fit (${partner.name} -> ${person.name}): ${match.directionalCompatibility.candidateToSubject}%`);
  console.log(`  -> Complementary Bonus: +${match.signalBreakdown.complementaryBonus}%`);

  const rankings = await getPersonalizedRankings(person.id, 5);
  console.log(`\n  Top 3 Ranked Matches for ${person.name}:`);
  rankings.slice(0, 3).forEach((r, idx) => {
    console.log(`    #${idx + 1}: ${r.candidate.name} — ${r.match.mutualCompatibility}% (Z-Score: ${r.zScore})`);
    console.log(`        "${r.whySummary.slice(0, 90)}..."`);
  });

  const totalTimeMs = Date.now() - startTime;
  console.log("\n=================================================================");
  console.log(`      SMOKE TEST PASSED SUCCESSFULLY IN ${totalTimeMs}ms        `);
  console.log("=================================================================");
}

runSmokeTest().catch((err) => {
  console.error("SMOKE TEST FAILED WITH ERROR:", err);
  process.exit(1);
});

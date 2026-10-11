import { db } from "../src/lib/storage/store";
import { runDatingSimulation } from "../src/lib/simulation/simulator";
import { calculateCompatibility } from "../src/lib/matching/scorer";
(async () => {
  const p = db.getPeople(); const n = p.length; const seen = new Set<string>(); const pairs: any[] = [];
  for (let i = 0; i < n; i++) for (let d = 1; d <= 3; d++) { const j = (i + d) % n; const k = [i, j].sort().join("-"); if (!seen.has(k)) { seen.add(k); pairs.push([p[i], p[j]]); } }
  console.log("LLM dates:", pairs.length); let done = 0;
  const run = async ([a, b]: any) => { try { const s = await runDatingSimulation(a, b, { turnsCount: 4, forceFresh: true });
    db.saveMatch(calculateCompatibility(a, b, s)); db.saveMatch(calculateCompatibility(b, a, s)); console.log("done", ++done, a.name, "x", b.name, s.provider ?? ""); } catch (e) { console.warn("skip", String(e).slice(0, 80)); } };
  const C = 15; for (let k = 0; k < pairs.length; k += C) await Promise.all(pairs.slice(k, k + C).map(run));
  console.log("ALL DONE");
})();

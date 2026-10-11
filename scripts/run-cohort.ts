import { db } from "../src/lib/storage/store";
import { runDatingSimulation } from "../src/lib/simulation/simulator";
import { calculateCompatibility } from "../src/lib/matching/scorer";
import { getProviderStatus } from "../src/lib/llm";

async function main() {
  const people = db.getPeople();
  console.log("people:", people.length, "provider:", getProviderStatus().providerName);
  const pairs: [typeof people[0], typeof people[0]][] = [];
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) pairs.push([people[i], people[j]]);
  let n = 0;
  const run = async ([a, b]: (typeof pairs)[0]) => {
    try {
      const sim = await runDatingSimulation(a, b, { turnsCount: 6, forceFresh: true });
      db.saveMatch(calculateCompatibility(a, b, sim));
      db.saveMatch(calculateCompatibility(b, a, sim));
      if (++n % 20 === 0) console.log("dates done", n, "/", pairs.length);
    } catch (e) { console.warn("skip", a.name, b.name, String(e).slice(0, 80)); }
  };
  const C = 6;
  for (let k = 0; k < pairs.length; k += C) await Promise.all(pairs.slice(k, k + C).map(run));
  console.log("DONE", n);
}
main();

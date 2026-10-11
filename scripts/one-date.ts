import { db } from "../src/lib/storage/store";
import { runDatingSimulation } from "../src/lib/simulation/simulator";
import { getProviderStatus } from "../src/lib/llm";
(async()=>{const p=db.getPeople();const t=Date.now();console.log(getProviderStatus().providerName);
const s=await runDatingSimulation(p[0],p[1],{turnsCount:6,forceFresh:true});
console.log((Date.now()-t)/1000+"s", JSON.stringify(s).slice(0,900));})();

import fs from "fs";
import { scrapeProfilesWithApify } from "../src/lib/ingestion/apify";
const [li, ig, name] = process.argv.slice(2);
scrapeProfilesWithApify(li, ig).then((r) => {
  fs.appendFileSync("data/volunteers.csv", `${r.linkedIn.fullName},${li},${ig},public-figure\n`);
  console.log("added", r.linkedIn.fullName, r.source);
}).catch((e) => console.error("FAILED", e.message));

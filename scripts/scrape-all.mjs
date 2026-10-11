import fs from "fs";
const T = process.env.APIFY_TOKEN;
const rows = fs.readFileSync("data/volunteers.csv","utf8").trim().split("\n").slice(1).map(l=>{const [name,li,ig]=l.split(",");return {name,li,ig:ig.replace(/\/$/,"").split("/").pop()};});
const run = async (actor, input) => (await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${T}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)})).json();
const [ig, li] = await Promise.all([
  run("apify~instagram-profile-scraper",{usernames:rows.map(r=>r.ig),resultsLimit:5}),
  run("harvestapi~linkedin-profile-scraper",{urls:rows.map(r=>r.li),profileScraperMode:"Profile details no email ($4 per 1k)"}),
]);
fs.writeFileSync("data/raw/ig.json",JSON.stringify(ig,null,1));
fs.writeFileSync("data/raw/li.json",JSON.stringify(li,null,1));
console.log("ig",ig.length,"li",li.length, "li ok", li.filter(x=>x.firstName).length);
console.log(li.filter(x=>!x.firstName).map(x=>x.originalQuery?.url));

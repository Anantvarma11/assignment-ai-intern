import fs from "fs";
const T=process.env.APIFY_TOKEN;
const extra=[["satyanadella","satyanadella"],["garyvaynerchuk","garyvee"],["richardbranson","richardbranson"],["simonsinek","simonsinek"],["arianahuffington","arianahuffington"],["neilkpatel","neilpatel"],["adammgrant","adamgrant"],["brenebrown","brenebrown"]];
const run=async(a,i)=>(await fetch(`https://api.apify.com/v2/acts/${a}/run-sync-get-dataset-items?token=${T}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})).json();
const [li,ig]=await Promise.all([run("harvestapi~linkedin-profile-scraper",{urls:extra.map(e=>"https://www.linkedin.com/in/"+e[0]),profileScraperMode:"Profile details no email ($4 per 1k)"}),run("apify~instagram-profile-scraper",{usernames:extra.map(e=>e[1]),resultsLimit:5})]);
fs.writeFileSync("data/raw/li2.json",JSON.stringify(li,null,1));fs.writeFileSync("data/raw/ig2.json",JSON.stringify(ig,null,1));
console.log("li ok",li.filter(x=>x.firstName).map(x=>x.publicIdentifier),"ig",ig.map(x=>x.username));

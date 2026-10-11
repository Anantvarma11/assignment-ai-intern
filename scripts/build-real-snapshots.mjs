import fs from "fs"; import crypto from "crypto";
const rd=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const li=[...rd("data/raw/li.json"),...rd("data/raw/li2.json")].filter(x=>x.firstName);
const ig=[...rd("data/raw/ig.json"),...rd("data/raw/ig2.json")].filter(x=>x.username);
const rows=fs.readFileSync("data/volunteers.csv","utf8").trim().split("\n").slice(1).map(l=>l.split(","));
const pairs=[...rows.map(r=>[r[1],r[2]]),...[["satyanadella","satyanadella"],["garyvaynerchuk","garyvee"],["richardbranson","richardbranson"],["simonsinek","simonsinek"],["arianahuffington","arianahuffington"],["neilkpatel","neilpatel"],["adammgrant","adamgrant"],["brenebrown","brenebrown"]].map(e=>["https://www.linkedin.com/in/"+e[0],"https://www.instagram.com/"+e[1]])];
const slug=u=>u.replace(/\/$/,"").split("/").pop().toLowerCase();
fs.mkdirSync("data/snapshots",{recursive:true});
for(const f of fs.readdirSync("data/snapshots"))fs.unlinkSync("data/snapshots/"+f);
const out=["name,linkedin_url,instagram_url,consent"];let n=0;
const now=new Date().toISOString();
for(const [lu,iu] of pairs){
  const L=li.find(x=>(x.publicIdentifier||"").toLowerCase()===slug(lu));
  const I=ig.find(x=>x.username.toLowerCase()===slug(iu));
  if(!L||!I||I.private)continue;
  const name=`${L.firstName} ${L.lastName||""}`.trim();
  const exps=(L.experience||[]).slice(0,5).map(e=>({title:e.position||"",company:e.companyName||"",description:e.description||undefined,startDate:e.startDate?.text,endDate:e.endDate?.text}));
  const linkedIn={url:lu,fullName:name,headline:L.headline||"",location:L.location?.linkedinText||"",about:L.about||"",avatarUrl:L.profilePicture?.url,company:exps[0]?.company,role:exps[0]?.title,experiences:exps,skills:(L.skills||[]).map(s=>s.name).slice(0,15).concat((L.topSkills||[]).map(s=>s.name||s)).slice(0,15),scrapedAt:now};
  const instagram={url:iu,username:I.username,fullName:I.fullName||name,biography:I.biography||"",externalUrl:I.externalUrl,profilePicUrl:I.profilePicUrlHD||I.profilePicUrl,postsCount:I.postsCount,followersCount:I.followersCount,recentPosts:(I.latestPosts||[]).slice(0,5).map((p,k)=>({id:"ig:post:"+(k+1),caption:p.caption||"",hashtags:p.hashtags,timestamp:p.timestamp,likesCount:p.likesCount})),scrapedAt:now};
  const h=crypto.createHash("sha256").update(`${lu.trim().toLowerCase()}|${iu.trim().toLowerCase()}`).digest("hex").slice(0,16);
  fs.writeFileSync(`data/snapshots/${h}.json`,JSON.stringify({urlHash:h,scrapedAt:now,source:"apify_live",linkedIn,instagram},null,1));
  out.push([name,lu,iu,"public-figure"].join(","));n++;
}
fs.writeFileSync("data/volunteers.csv",out.join("\n")+"\n");console.log("people",n);

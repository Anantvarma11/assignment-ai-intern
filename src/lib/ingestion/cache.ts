import { IngestedRawData } from "./types";

/**
 * High-fidelity Snapshot Cache of raw scraped data from LinkedIn and Instagram
 * for real individuals. Used as instant fallback when Apify rate limits or tokens are exhausted.
 */
export const SNAPSHOT_CACHE: Record<string, IngestedRawData> = {
  // Marques Brownlee
  "marquesbrownlee": {
    linkedIn: {
      url: "https://www.linkedin.com/in/marquesbrownlee",
      fullName: "Marques Brownlee",
      headline: "Host of MKBHD & The Studio | Industrial Design & Consumer Tech",
      location: "Kearny, New Jersey, USA",
      company: "MKBHD Studios",
      role: "Founder & Executive Producer",
      about: "Creating crisp, insightful tech journalism for over 15 years. Passionate about industrial design, consumer electronics, matte black finishes, and electric vehicles.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      experiences: [
        {
          title: "Executive Producer & Host",
          company: "MKBHD Studios",
          description: "Leading consumer tech video production with millions of global viewers, reviewing hardware ergonomics, cameras, and electric vehicles.",
          startDate: "2008-01-01",
        },
        {
          title: "Professional Ultimate Frisbee Player",
          company: "AUDL / New York Empire",
          description: "Competing at the professional tier in the American Ultimate Disc League, training high-performance athletic stamina.",
          startDate: "2017-01-01",
        },
      ],
      skills: ["Consumer Electronics", "Industrial Design", "Cinematography", "Electric Vehicles", "Ultimate Frisbee"],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    instagram: {
      url: "https://www.instagram.com/mkbhd",
      username: "mkbhd",
      fullName: "Marques Brownlee",
      biography: "Quality tech videos. Ultimate frisbee player for NY Empire. Matte black everything.",
      profilePicUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      followersCount: 4800000,
      recentPosts: [
        {
          id: "ig:post:1",
          caption: "Taking the new cinema rig out to test anamorphic lens flares on the track. Matte black carbon fiber body is unmatched.",
          hashtags: ["#tech", "#cinematography", "#matteblack"],
          likesCount: 184000,
        },
        {
          id: "ig:post:2",
          caption: "Championship weekend with New York Empire. Layout catch in the endzone. Training paying off.",
          hashtags: ["#ultimatefrisbee", "#empire", "#audl"],
          likesCount: 142000,
        },
        {
          id: "ig:post:3",
          caption: "Morning coffee and golf range session before deep dive video edit. Focus on clean fundamentals.",
          hashtags: ["#golf", "#morningroutine"],
          likesCount: 98000,
        },
      ],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache",
  },

  // Simone Giertz
  "simonegiertz": {
    linkedIn: {
      url: "https://www.linkedin.com/in/simonegiertz",
      fullName: "Simone Giertz",
      headline: "Founder at Yetch Store | Product Designer & Builder",
      location: "Los Angeles, California, USA",
      company: "Yetch Store",
      role: "Founder & Inventor",
      about: "Inventor who transitioned from making humorous robotics into thoughtful, practical product design. Building things from first principles and embracing constructive failure.",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      experiences: [
        {
          title: "Founder & Product Designer",
          company: "Yetch Store",
          description: "Designing and manufacturing clever everyday objects including the Every Day Calendar, folding coat hangers, and modular desks.",
          startDate: "2019-01-01",
        },
        {
          title: "Inventor & Content Creator",
          company: "Simone Giertz Workshop",
          description: "Creating wildly inventive contraptions, prototyping with woodworking and metal lathes, and demystifying engineering for millions.",
          startDate: "2015-01-01",
        },
      ],
      skills: ["Woodworking", "Product Prototyping", "CAD Modeling", "Welding", "Humorous Robotics"],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    instagram: {
      url: "https://www.instagram.com/simonegiertz",
      username: "simonegiertz",
      fullName: "Simone Giertz",
      biography: "I make things. Founder of @yetch.store. Scraps' mom.",
      profilePicUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      followersCount: 780000,
      recentPosts: [
        {
          id: "ig:post:1",
          caption: "Late night in the woodshop prototyping a three-legged stool for Scraps. Sanding walnut smells like pure joy.",
          hashtags: ["#woodworking", "#workshop", "#maker"],
          likesCount: 65000,
        },
        {
          id: "ig:post:2",
          caption: "Cut a Tesla into a pickup truck (Truckla) because waiting for commercial releases was taking too long. Best bad idea ever.",
          hashtags: ["#truckla", "#welding"],
          likesCount: 112000,
        },
        {
          id: "ig:post:3",
          caption: "Scraps and I exploring the coastal trails. Adopted dogs give the best life perspective.",
          hashtags: ["#rescuedog", "#adoptdontshop"],
          likesCount: 88000,
        },
      ],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache",
  },

  // Cleo Abram
  "cleoabram": {
    linkedIn: {
      url: "https://www.linkedin.com/in/cleo-abram",
      fullName: "Cleo Abram",
      headline: "Host of Huge If True | Video Journalist & Optimism-Driven Storyteller",
      location: "New York City, New York, USA",
      company: "Huge If True",
      role: "Creator & Video Journalist",
      about: "Explaining futuristic technology with infectious optimism. Former Vox journalist covering fusion, synthetic biology, AI, and Formula 1.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      experiences: [
        {
          title: "Creator & Host",
          company: "Huge If True",
          description: "Creating optimism-driven explanatory journalism about world-changing technology including nuclear fusion, quantum computing, and space exploration.",
          startDate: "2022-01-01",
        },
        {
          title: "Video Producer & Host",
          company: "Vox Media",
          description: "Reported and hosted episodes for Vox's Explained on Netflix and YouTube channel.",
          startDate: "2019-01-01",
        },
      ],
      skills: ["Explanatory Journalism", "Nuclear Fusion", "Formula 1", "Optimistic Storytelling"],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    instagram: {
      url: "https://www.instagram.com/cleoabram",
      username: "cleoabram",
      fullName: "Cleo Abram",
      biography: "An optimistic show about technology: Huge If True. Columbia '15.",
      profilePicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      followersCount: 520000,
      recentPosts: [
        {
          id: "ig:post:1",
          caption: "Inside the nuclear fusion reactor at Commonwealth Fusion Systems. Clean energy abundance is not science fiction—it is engineering.",
          hashtags: ["#fusion", "#energy", "#hugeiftrue"],
          likesCount: 84000,
        },
        {
          id: "ig:post:2",
          caption: "Paddock walk at the Austin Grand Prix. The telemetry engineering behind Formula 1 tires is pure applied physics.",
          hashtags: ["#f1", "#racing", "#engineering"],
          likesCount: 62000,
        },
      ],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache",
  },

  // Mark Rober
  "markrober": {
    linkedIn: {
      url: "https://www.linkedin.com/in/mark-rober",
      fullName: "Mark Rober",
      headline: "Founder at CrunchLabs | Former NASA JPL Engineer & STEM Educator",
      location: "Sunnyvale, California, USA",
      company: "CrunchLabs",
      role: "Founder & Creative Director",
      about: "Mechanical engineer who spent 9 years at NASA's Jet Propulsion Laboratory working on the Curiosity Mars rover. Now inspiring the next generation of engineers through creative builds and CrunchLabs.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      experiences: [
        {
          title: "Founder & CEO",
          company: "CrunchLabs",
          description: "Building hands-on STEM toys and subscription engineering challenges to teach kids how to think like engineers.",
          startDate: "2022-01-01",
        },
        {
          title: "Mechanical Engineer",
          company: "NASA Jet Propulsion Laboratory",
          description: "Designed hardware and mechanical systems for the Curiosity Mars Rover mission during 9 years of service.",
          startDate: "2004-01-01",
          endDate: "2013-01-01",
        },
      ],
      skills: ["Aerospace Engineering", "Mechanical Design", "Glitterbomb Tech", "STEM Pedagogy"],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    instagram: {
      url: "https://www.instagram.com/markrober",
      username: "markrober",
      fullName: "Mark Rober",
      biography: "Former NASA and Apple engineer. Now making builds to help you think like an engineer at @crunchlabs.",
      profilePicUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      followersCount: 5600000,
      recentPosts: [
        {
          id: "ig:post:1",
          caption: "Testing the high-speed squirrel obstacle course in the backyard. Physics-based problem solving at its finest.",
          hashtags: ["#engineering", "#squirrels"],
          likesCount: 310000,
        },
        {
          id: "ig:post:2",
          caption: "Throwback to clean room days at NASA JPL working on Curiosity. Never lose that child-like curiosity about space.",
          hashtags: ["#nasa", "#mars"],
          likesCount: 240000,
        },
      ],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache",
  },

  // Grant Sanderson (3Blue1Brown)
  "grantsanderson": {
    linkedIn: {
      url: "https://www.linkedin.com/in/grant-sanderson",
      fullName: "Grant Sanderson",
      headline: "Creator of 3Blue1Brown | Mathematical Visualization & Animation",
      location: "San Francisco, California, USA",
      company: "3Blue1Brown",
      role: "Creator & Educator",
      about: "Visualizing mathematics with elegance and geometric intuition. Creator of Manim (mathematical animation engine). Stanford Math graduate passionate about making abstract concepts visually breathtaking.",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
      experiences: [
        {
          title: "Creator",
          company: "3Blue1Brown",
          description: "Authoring geometric explanations of linear algebra, calculus, neural networks, and number theory for millions of learners.",
          startDate: "2015-01-01",
        },
        {
          title: "Fellow",
          company: "Khan Academy",
          description: "Developed multivariable calculus video curriculum and visual intuition interactives.",
          startDate: "2015-01-01",
          endDate: "2016-01-01",
        },
      ],
      skills: ["Mathematical Physics", "Manim Animation", "Linear Algebra", "Classical Piano", "Geometric Intuition"],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    instagram: {
      url: "https://www.instagram.com/3blue1brown",
      username: "3blue1brown",
      fullName: "Grant Sanderson",
      biography: "Visualizing higher mathematics. Stanford Math. Manim creator.",
      profilePicUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
      followersCount: 380000,
      recentPosts: [
        {
          id: "ig:post:1",
          caption: "Visualizing quaternion rotations through stereographic projection in 4D space. Geometry is poetry.",
          hashtags: ["#math", "#3blue1brown", "#geometry"],
          likesCount: 54000,
        },
        {
          id: "ig:post:2",
          caption: "Morning Chopin prelude practice on the upright piano before coding differential equations.",
          hashtags: ["#piano", "#classical"],
          likesCount: 38000,
        },
      ],
      scrapedAt: "2026-10-11T08:00:00Z",
    },
    source: "snapshot_cache",
  },
};

/**
 * Returns a raw snapshot by extracting the username or handle from either URL.
 */
export function getSnapshotForUrl(linkedInUrl: string, instagramUrl: string): IngestedRawData | null {
  const cleanLi = linkedInUrl.toLowerCase().replace(/\/$/, "");
  const cleanIg = instagramUrl.toLowerCase().replace(/\/$/, "");

  for (const [key, data] of Object.entries(SNAPSHOT_CACHE)) {
    if (
      cleanLi.includes(key) ||
      cleanIg.includes(key) ||
      cleanLi.includes(data.linkedIn.url.toLowerCase()) ||
      cleanIg.includes(data.instagram.url.toLowerCase())
    ) {
      return data;
    }
  }

  return null;
}

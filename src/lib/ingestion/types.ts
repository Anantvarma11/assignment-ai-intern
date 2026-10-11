export interface RawLinkedInProfile {
  url: string;
  fullName: string;
  headline: string;
  location: string;
  about?: string;
  avatarUrl?: string;
  company?: string;
  role?: string;
  experiences: Array<{
    title: string;
    company: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
  scrapedAt: string;
}

export interface RawInstagramProfile {
  url: string;
  username: string;
  fullName: string;
  biography: string;
  externalUrl?: string;
  profilePicUrl?: string;
  postsCount?: number;
  followersCount?: number;
  recentPosts: Array<{
    id: string;
    caption: string;
    hashtags?: string[];
    timestamp?: string;
    likesCount?: number;
  }>;
  scrapedAt: string;
}

export interface IngestedRawData {
  linkedIn: RawLinkedInProfile;
  instagram: RawInstagramProfile;
  source: "apify_live" | "snapshot_cache";
  actorRunId?: string;
  urlHash?: string;
  isCachedSnapshot?: boolean;
  cachedAt?: string;
  snapshotPath?: string;
}

export interface EvidenceCitation {
  id: string; // e.g. "li:exp:1" | "ig:post:2" | "li:about" | "ig:bio"
  source: "linkedin" | "instagram";
  field: string;
  snippet: string;
  url: string;
}

export interface EvidenceBundle {
  urlHash: string;
  ingestedAt: string;
  isCachedSnapshot: boolean;
  cachedAt?: string;
  citations: Record<string, EvidenceCitation>;
  rawCorpus: string;
}

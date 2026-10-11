import { z } from "zod";

export const LinkedInUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          (parsed.hostname === "linkedin.com" || parsed.hostname.endsWith(".linkedin.com"))
        );
      } catch {
        return false;
      }
    },
    { message: "URL must be an official LinkedIn profile (https://www.linkedin.com/in/...)" }
  );

export const InstagramUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          (parsed.hostname === "instagram.com" || parsed.hostname.endsWith(".instagram.com"))
        );
      } catch {
        return false;
      }
    },
    { message: "URL must be a valid Instagram profile (https://www.instagram.com/...)" }
  );

export const ProvenanceItemSchema = z.object({
  field: z.string(),
  source: z.enum(["linkedin", "instagram", "user_input", "inferred"]),
  timestamp: z.string(),
  verified: z.boolean(),
  evidenceText: z.string().optional(),
});

export const ExplicitPreferencesSchema = z.object({
  communicationStyle: z.string().min(2),
  intellectualPassions: z.array(z.string()).min(1),
  lifestyleValues: z.array(z.string()).min(1),
  relationshipIntent: z.enum(["long-term", "partnership", "exploratory", "casual"]),
  dealbreakers: z.array(z.string()),
  preferredLocations: z.array(z.string()).optional(),
  growthMindsetPriority: z.enum(["essential", "high", "moderate"]),
});

export const CompatibilitySignalsSchema = z.object({
  conversationVibe: z.string(),
  humorType: z.string(),
  spontaneityLevel: z.enum(["low", "medium", "high"]),
  ambitionAlignment: z.enum(["high", "moderate"]),
  socialBattery: z.enum(["introvert", "ambivert", "extrovert"]),
  conflictStyle: z.string(),
});

export const PersonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(1),
  role: z.string().min(2),
  headline: z.string().min(5),
  company: z.string().min(2),
  location: z.string().min(2),
  avatarUrl: z.string().url(),
  linkedInUrl: LinkedInUrlSchema,
  instagramUrl: InstagramUrlSchema,
  verifiedSources: z.object({
    linkedIn: z.boolean(),
    instagram: z.boolean(),
  }),
  summary: z.string().min(10),
  interests: z.array(z.string()).min(2, "Provide at least two interests"),
  hobbies: z.array(z.string()).min(2, "Provide at least two hobbies"),
  explicitPreferences: ExplicitPreferencesSchema,
  compatibilitySignals: CompatibilitySignalsSchema,
  missingInformation: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  uncertaintyFlags: z.array(z.string()),
  provenance: z.array(ProvenanceItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Person = z.infer<typeof PersonSchema>;
export type ExplicitPreferences = z.infer<typeof ExplicitPreferencesSchema>;
export type CompatibilitySignals = z.infer<typeof CompatibilitySignalsSchema>;
export type ProvenanceItem = z.infer<typeof ProvenanceItemSchema>;

export const AgentAnalysisSchema = z.object({
  personId: z.string(),
  personName: z.string(),
  coreIdentityPrompt: z.string(),
  conversationalPillars: z.array(z.string()),
  datingPriorities: z.object({
    mustHaves: z.array(z.string()),
    dealbreakers: z.array(z.string()),
    flexibilities: z.array(z.string()),
  }),
  cognitiveStyle: z.string(),
  conversationalTone: z.string(),
  safetyBoundaries: z.array(z.string()),
  analysisSource: z.enum(["cerebras", "openrouter", "deterministic"]),
  timestamp: z.string(),
});

export type AgentAnalysis = z.infer<typeof AgentAnalysisSchema>;

export const SimulationTurnSchema = z.object({
  speakerId: z.string(),
  speakerName: z.string(),
  turnIndex: z.number(),
  message: z.string(),
  internalMonologue: z.string().optional(),
  vibeSignal: z.enum(["curious", "engaged", "guarded", "delighted", "playful", "reflective"]).optional(),
});

export type SimulationTurn = z.infer<typeof SimulationTurnSchema>;

export const SimulationEvaluationSchema = z.object({
  chemistryScore: z.number().min(0).max(100),
  intellectualScore: z.number().min(0).max(100),
  humorAlignmentScore: z.number().min(0).max(100),
  vibeMatchScore: z.number().min(0).max(100),
  conversationalFlowScore: z.number().min(0).max(100),
  overallSimulationScore: z.number().min(0).max(100),
  narrativeSummary: z.string(),
  standoutMoments: z.array(z.string()),
  potentialFrictionPoints: z.array(z.string()),
  secondDateLikelihood: z.enum(["very_high", "high", "moderate", "unlikely"]),
});

export type SimulationEvaluation = z.infer<typeof SimulationEvaluationSchema>;

export const DatingSimulationSchema = z.object({
  id: z.string(),
  personAId: z.string(),
  personBId: z.string(),
  venue: z.object({
    name: z.string(),
    setting: z.string(),
    atmosphere: z.string(),
  }),
  openingContext: z.string(),
  turns: z.array(SimulationTurnSchema),
  providerUsed: z.enum(["cerebras", "openrouter", "deterministic"]),
  modelUsed: z.string(),
  completedAt: z.string(),
  evaluation: SimulationEvaluationSchema,
});

export type DatingSimulation = z.infer<typeof DatingSimulationSchema>;

export const CompatibilityMatchSchema = z.object({
  subjectId: z.string(),
  candidateId: z.string(),
  directionalCompatibility: z.object({
    subjectToCandidate: z.number().min(0).max(100),
    candidateToSubject: z.number().min(0).max(100),
  }),
  mutualCompatibility: z.number().min(0).max(100),
  signalBreakdown: z.object({
    sharedInterestsScore: z.number().min(0).max(100),
    sharedHobbiesScore: z.number().min(0).max(100),
    lifestyleAlignmentScore: z.number().min(0).max(100),
    preferenceFulfillmentScore: z.number().min(0).max(100),
    simulationInteractionScore: z.number().min(0).max(100),
    complementaryBonus: z.number().min(0).max(10),
  }),
  weightsUsed: z.object({
    interests: z.number(),
    hobbies: z.number(),
    lifestyle: z.number(),
    preferences: z.number(),
    simulation: z.number(),
  }),
  sharedInterestsList: z.array(z.string()),
  sharedHobbiesList: z.array(z.string()),
  evidenceStatements: z.array(z.string()),
  riskOrFrictionNotice: z.array(z.string()),
  missingDataPenalty: z.number(),
  disclaimer: z.string(),
  calculatedAt: z.string(),
});

export type CompatibilityMatch = z.infer<typeof CompatibilityMatchSchema>;

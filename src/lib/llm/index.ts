import { LLMProvider, ProviderMetadata } from "./types";
import { CerebrasProvider } from "./cerebras";
import { OpenRouterProvider } from "./openrouter";
import { DeterministicProvider } from "./deterministic";

export * from "./types";
export * from "./cerebras";
export * from "./openrouter";
export * from "./deterministic";

export interface ProviderStatusInfo {
  activeProvider: "cerebras" | "openrouter" | "deterministic";
  providerName: string;
  model: string;
  isFallback: boolean;
  cerebrasAvailable: boolean;
  openrouterAvailable: boolean;
  apifyAvailable: boolean;
  message: string;
}

// Runtime config overrides (stored in-memory, never persisted to repo or client)
let runtimeCerebrasKey: string | null = null;
let runtimeOpenRouterKey: string | null = null;
let runtimeApifyToken: string | null = null;
let forcedProvider: "cerebras" | "openrouter" | "deterministic" | null = null;

export function resetRuntimeKeys() {
  runtimeCerebrasKey = null;
  runtimeOpenRouterKey = null;
  runtimeApifyToken = null;
  forcedProvider = null;
}

export function setRuntimeKeys(keys: {
  cerebrasKey?: string | null;
  openrouterKey?: string | null;
  apifyToken?: string | null;
  forcedProvider?: "cerebras" | "openrouter" | "deterministic" | null;
}) {
  if ("cerebrasKey" in keys) runtimeCerebrasKey = keys.cerebrasKey || null;
  if ("openrouterKey" in keys) runtimeOpenRouterKey = keys.openrouterKey || null;
  if ("apifyToken" in keys) runtimeApifyToken = keys.apifyToken || null;
  if ("forcedProvider" in keys) forcedProvider = keys.forcedProvider ?? null;
}

export function getApifyToken(): string | null {
  return runtimeApifyToken || process.env.APIFY_TOKEN || process.env.APIFY_API_KEY || null;
}

export function getProviderStatus(): ProviderStatusInfo {
  const cerebrasKey = runtimeCerebrasKey || process.env.CEREBRAS_API_KEY || "";
  const openrouterKey = runtimeOpenRouterKey || process.env.OPENROUTER_API_KEY || "";
  const apifyToken = getApifyToken();

  const cerebrasAvailable = Boolean(cerebrasKey && cerebrasKey.trim().length > 5);
  const openrouterAvailable = Boolean(openrouterKey && openrouterKey.trim().length > 5);
  const apifyAvailable = Boolean(apifyToken && apifyToken.trim().length > 5);

  if (forcedProvider === "deterministic") {
    return {
      activeProvider: "deterministic",
      providerName: "Deterministic Heuristic Engine",
      model: "deterministic-heuristic-v1",
      isFallback: true,
      cerebrasAvailable,
      openrouterAvailable,
      apifyAvailable,
      message: "Forced offline fallback mode active.",
    };
  }

  if (forcedProvider === "cerebras" && cerebrasAvailable) {
    return {
      activeProvider: "cerebras",
      providerName: "Cerebras Ultra-Fast Inference",
      model: "llama-3.3-70b",
      isFallback: false,
      cerebrasAvailable,
      openrouterAvailable,
      apifyAvailable,
      message: "Connected to Cerebras Cloud (llama-3.3-70b).",
    };
  }

  if (forcedProvider === "openrouter" && openrouterAvailable) {
    return {
      activeProvider: "openrouter",
      providerName: "OpenRouter LLM Gateway",
      model: "meta-llama/llama-3.3-70b-instruct:free",
      isFallback: false,
      cerebrasAvailable,
      openrouterAvailable,
      apifyAvailable,
      message: "Connected to OpenRouter Gateway.",
    };
  }

  // Automatic preference cascade: Cerebras -> OpenRouter -> Deterministic
  if (cerebrasAvailable) {
    return {
      activeProvider: "cerebras",
      providerName: "Cerebras Ultra-Fast Inference",
      model: "llama-3.3-70b",
      isFallback: false,
      cerebrasAvailable,
      openrouterAvailable,
      apifyAvailable,
      message: "Operating with Cerebras Cloud (llama-3.3-70b).",
    };
  }

  if (openrouterAvailable) {
    return {
      activeProvider: "openrouter",
      providerName: "OpenRouter LLM Gateway",
      model: "meta-llama/llama-3.3-70b-instruct:free",
      isFallback: false,
      cerebrasAvailable,
      openrouterAvailable,
      apifyAvailable,
      message: "Operating with OpenRouter Gateway.",
    };
  }

  return {
    activeProvider: "deterministic",
    providerName: "Deterministic Engine (Offline Safe)",
    model: "deterministic-heuristic-v1",
    isFallback: true,
    cerebrasAvailable: false,
    openrouterAvailable: false,
    apifyAvailable,
    message: "Operating with profile-grounded deterministic engine. No live API keys detected.",
  };
}

export function getProvider(): LLMProvider {
  const status = getProviderStatus();

  if (status.activeProvider === "cerebras") {
    const key = runtimeCerebrasKey || process.env.CEREBRAS_API_KEY || "";
    return new CerebrasProvider(key, status.model);
  }

  if (status.activeProvider === "openrouter") {
    const key = runtimeOpenRouterKey || process.env.OPENROUTER_API_KEY || "";
    return new OpenRouterProvider(key, status.model);
  }

  return new DeterministicProvider();
}

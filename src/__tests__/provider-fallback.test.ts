import { describe, it, expect, beforeEach } from "vitest";
import {
  getProviderStatus,
  getProvider,
  setRuntimeKeys,
  resetRuntimeKeys,
  DeterministicProvider,
  CerebrasProvider,
  OpenRouterProvider,
  LLMError,
} from "@/lib/llm";
import { z } from "zod";

describe("Provider Abstraction, Fallback & Error Classification", () => {
  beforeEach(() => {
    resetRuntimeKeys();
  });

  it("operates in deterministic fallback mode when no keys are present", () => {
    const status = getProviderStatus();
    expect(status.activeProvider).toBe("deterministic");
    expect(status.isFallback).toBe(true);

    const provider = getProvider();
    const meta = provider.getMetadata();
    expect(meta.id).toBe("deterministic");
    expect(meta.isFallback).toBe(true);
  });

  it("activates Cerebras when Cerebras key is supplied", () => {
    setRuntimeKeys({ cerebrasKey: "csk-mock-key-12345" });
    const status = getProviderStatus();
    expect(status.activeProvider).toBe("cerebras");
    expect(status.isFallback).toBe(false);
    expect(status.cerebrasAvailable).toBe(true);
  });

  it("activates OpenRouter when only OpenRouter key is supplied", () => {
    setRuntimeKeys({ openrouterKey: "sk-or-mock-key-12345" });
    const status = getProviderStatus();
    expect(status.activeProvider).toBe("openrouter");
    expect(status.isFallback).toBe(false);
    expect(status.openrouterAvailable).toBe(true);
  });

  it("allows forcing deterministic fallback mode regardless of keys", () => {
    setRuntimeKeys({
      cerebrasKey: "csk-mock-key-12345",
      forcedProvider: "deterministic",
    });
    const status = getProviderStatus();
    expect(status.activeProvider).toBe("deterministic");
    expect(status.isFallback).toBe(true);
  });

  it("deterministic provider produces structured output without network access", async () => {
    const provider = new DeterministicProvider();
    const schema = z.object({
      chemistryScore: z.number(),
      secondDateLikelihood: z.string(),
    });

    const res = await provider.generateStructured("Please evaluate chemistryScore", schema);
    expect(res.provider).toBe("deterministic");
    expect(res.data.chemistryScore).toBeGreaterThan(0);
    expect(res.data.secondDateLikelihood).toBeDefined();
  });

  it("throws classified AUTH_ERROR when calling Cerebras without valid key", async () => {
    const provider = new CerebrasProvider("");
    await expect(provider.generateText("hello")).rejects.toThrow(LLMError);
    await expect(provider.generateText("hello")).rejects.toMatchObject({
      code: "AUTH_ERROR",
      provider: "cerebras",
    });
  });

  it("throws classified AUTH_ERROR when calling OpenRouter without valid key", async () => {
    const provider = new OpenRouterProvider("");
    await expect(provider.generateText("hello")).rejects.toThrow(LLMError);
    await expect(provider.generateText("hello")).rejects.toMatchObject({
      code: "AUTH_ERROR",
      provider: "openrouter",
    });
  });
});

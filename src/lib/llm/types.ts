import { z } from "zod";

export type ProviderId = "cerebras" | "openrouter" | "deterministic";

export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  defaultModel: string;
  isConfigured: boolean;
  isFallback: boolean;
}

export interface LLMOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
}

export interface LLMResponse {
  text: string;
  provider: ProviderId;
  model: string;
  latencyMs: number;
}

export interface StructuredLLMResponse<T> extends LLMResponse {
  data: T;
}

export type LLMErrorCode =
  | "AUTH_ERROR"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "PROVIDER_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export class LLMError extends Error {
  public code: LLMErrorCode;
  public provider: ProviderId;
  public status?: number;

  constructor(message: string, code: LLMErrorCode, provider: ProviderId, status?: number) {
    super(message);
    this.name = "LLMError";
    this.code = code;
    this.provider = provider;
    this.status = status;
  }
}

export interface LLMProvider {
  getMetadata(): ProviderMetadata;
  generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  generateStructured<T>(prompt: string, schema: z.ZodType<T>, options?: LLMOptions): Promise<StructuredLLMResponse<T>>;
}

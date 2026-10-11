import { z } from "zod";
import { LLMProvider, ProviderMetadata, LLMOptions, LLMResponse, StructuredLLMResponse, LLMError } from "./types";

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private defaultModel: string;
  private endpoint: string;

  constructor(apiKey?: string, model: string = "meta-llama/llama-3.3-70b-instruct:free") {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
    this.defaultModel = model;
    this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
  }

  public getMetadata(): ProviderMetadata {
    return {
      id: "openrouter",
      name: "OpenRouter",
      defaultModel: this.defaultModel,
      isConfigured: !!this.apiKey && this.apiKey.length > 5,
      isFallback: false,
    };
  }

  public async generateText(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new LLMError("OpenRouter API key is missing", "AUTH_ERROR", "openrouter", 401);
    }

    const timeoutMs = options.timeoutMs || 15000;
    const maxRetries = options.retries ?? 2;
    const start = Date.now();

    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const messages: Array<{ role: "system" | "user"; content: string }> = [];
        if (options.systemPrompt) {
          messages.push({ role: "system", content: options.systemPrompt });
        }
        messages.push({ role: "user", content: prompt });

        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://pairwise.ai",
            "X-Title": "Pairwise AI Dating Simulation",
          },
          body: JSON.stringify({
            model: this.defaultModel,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const status = res.status;
          const body = await res.text().catch(() => "");
          if (status === 401 || status === 403) {
            throw new LLMError(`OpenRouter auth failed (${status}): ${body}`, "AUTH_ERROR", "openrouter", status);
          }
          if (status === 429) {
            throw new LLMError(`OpenRouter rate limit reached (${status})`, "RATE_LIMIT", "openrouter", status);
          }
          throw new LLMError(`OpenRouter HTTP error (${status}): ${body}`, "PROVIDER_UNAVAILABLE", "openrouter", status);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || "";
        return {
          text,
          provider: "openrouter",
          model: this.defaultModel,
          latencyMs: Date.now() - start,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        if (err.name === "AbortError") {
          lastError = new LLMError(`OpenRouter request timed out after ${timeoutMs}ms`, "TIMEOUT", "openrouter", 408);
        }
        if (lastError instanceof LLMError && lastError.code === "AUTH_ERROR") {
          throw lastError;
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new LLMError("OpenRouter request failed", "UNKNOWN_ERROR", "openrouter");
  }

  public async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options: LLMOptions = {}
  ): Promise<StructuredLLMResponse<T>> {
    const systemPrompt = `${options.systemPrompt || "You are an analytical assistant."}\n` +
      "IMPORTANT: You MUST respond ONLY with a valid, parseable JSON object matching the requested schema. No conversational filler.";

    const response = await this.generateText(prompt, {
      ...options,
      systemPrompt,
      temperature: options.temperature ?? 0.2,
    });

    let clean = response.text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const parsed = JSON.parse(clean);
      const validated = schema.parse(parsed);
      return {
        ...response,
        data: validated,
      };
    } catch (parseErr: any) {
      throw new LLMError(
        `Failed to parse structured JSON from OpenRouter: ${parseErr.message}`,
        "INVALID_RESPONSE",
        "openrouter"
      );
    }
  }
}

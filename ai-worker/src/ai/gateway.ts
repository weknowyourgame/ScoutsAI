import { resolveProfile, type AiProfileId } from "./config";

const OPENROUTER_DIRECT_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface AiEnv {
  OPENROUTER_API_KEY?: string;
  AI_GATEWAY_URL?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ChatOptions {
  profile: AiProfileId;
  messages: ChatMessage[];
  userId?: string;
  scoutId?: string;
  stream?: boolean;
  maxTokens?: number;
  signal?: AbortSignal;
  onTextDelta?: (text: string) => void | Promise<void>;
}

export interface ChatResult {
  content: string;
  raw?: unknown;
}

function metadataHeaders(userId?: string, scoutId?: string): Record<string, string> {
  if (!userId && !scoutId) return {};
  return {
    "cf-aig-metadata": JSON.stringify({
      ...(userId ? { user_id: userId } : {}),
      ...(scoutId ? { scout_id: scoutId } : {}),
    }),
    ...(userId ? { "cf-aig-custom-cache-key": userId } : {}),
  };
}

function usableEnvValue(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("${") || trimmed.startsWith("your-")) {
    return undefined;
  }
  return trimmed;
}

function resolveUrlAndHeaders(env: AiEnv, userId?: string, scoutId?: string) {
  const openRouterKey = usableEnvValue(env.OPENROUTER_API_KEY);
  if (!openRouterKey) {
    throw new Error("Scouts model access is unavailable: missing OPENROUTER_API_KEY");
  }

  const gatewayBase = usableEnvValue(env.AI_GATEWAY_URL)?.replace(/\/$/, "");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${openRouterKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://scouts.local",
    "X-OpenRouter-Title": "ScoutsAI",
    ...metadataHeaders(userId, scoutId),
  };

  if (gatewayBase) {
    const gatewayUrl = `${gatewayBase}/openrouter/chat/completions`;
    try {
      new URL(gatewayUrl);
    } catch {
      console.warn(`Ignoring invalid AI_GATEWAY_URL: ${gatewayBase}`);
      return { url: OPENROUTER_DIRECT_URL, headers };
    }

    const cloudflareToken = usableEnvValue(env.CLOUDFLARE_API_TOKEN);
    if (cloudflareToken) {
      headers["cf-aig-authorization"] = `Bearer ${cloudflareToken}`;
    }
    return { url: gatewayUrl, headers };
  }

  return { url: OPENROUTER_DIRECT_URL, headers };
}

async function parseStreamingResponse(
  response: Response,
  onTextDelta?: (text: string) => void | Promise<void>,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No stream body from AI gateway");

  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      try {
        const event = JSON.parse(line.slice(6)) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          text += delta;
          await onTextDelta?.(delta);
        }
      } catch {
        // Ignore malformed SSE keepalive/provider lines.
      }
    }
  }

  return text.trim();
}

async function parseJsonResponse(response: Response): Promise<{ content: string; raw: unknown }> {
  const raw = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return {
    content: raw.choices?.[0]?.message?.content?.trim() ?? "",
    raw,
  };
}

export class GatewayClient {
  constructor(private readonly env: AiEnv) {}

  async chat(options: ChatOptions): Promise<ChatResult> {
    return this.chatWithRetry(options, 2);
  }

  private async chatWithRetry(options: ChatOptions, attemptsLeft: number): Promise<ChatResult> {
    const profile = resolveProfile(options.profile);
    const { url, headers } = resolveUrlAndHeaders(this.env, options.userId, options.scoutId);
    const model = profile.primary.model;
    const fallbacks = profile.fallbacks ?? [];
    const stream = options.stream ?? false;

    const body: Record<string, unknown> = {
      model,
      messages: options.messages,
      temperature: profile.temperature ?? 0.2,
      stream,
    };

    if (fallbacks.length > 0) body.models = [model, ...fallbacks];
    if (options.maxTokens) body.max_tokens = options.maxTokens;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      if (attemptsLeft > 1 && response.status >= 500) {
        return this.chatWithRetry(options, attemptsLeft - 1);
      }
      throw new Error(`AI gateway error ${response.status}: ${text}`);
    }

    const result = stream
      ? { content: await parseStreamingResponse(response, options.onTextDelta) }
      : await parseJsonResponse(response);

    if (!result.content && attemptsLeft > 1) {
      return this.chatWithRetry(options, attemptsLeft - 1);
    }

    return result;
  }
}

export function createGatewayClient(env: AiEnv) {
  return new GatewayClient(env);
}

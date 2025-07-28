import { ReqSchema } from "../schemas/gateway";
import { todoMakerPrompt } from "../prompts/todo";
import { z } from "zod";

type Req = z.infer<typeof ReqSchema>;

export async function callGatewayAI(env: Env, input: Req) {
  if (!input.provider) {
    throw new Error("Provider is required");
  }

  const apiKey =
    input.provider === "groq"
      ? env.GROQ_API_KEY
      : input.provider === "perplexity-ai"
        ? env.PERPLEXITY_API_KEY
        : null;

  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${input.provider}`);
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/${input.provider}/chat/completions`;

  const body = JSON.stringify({
    messages: [
      {
        role: "system",
        content: input.system_prompt || todoMakerPrompt,
      },
      {
        role: "user",
        content: input.prompt,
      }
    ],
    model: input.model_id,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

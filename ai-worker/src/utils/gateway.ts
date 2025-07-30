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

  // Combine system prompt and user prompt into single user message
  const combinedPrompt = input.system_prompt 
    ? `${input.system_prompt}\n\nUser Request: ${input.prompt}`
    : `${todoMakerPrompt}\n\nUser Request: ${input.prompt}`;

  const body = JSON.stringify({
    messages: [
      {
        role: "user",
        content: combinedPrompt,
      }
    ],
    model: input.model_id,
    // Groq reasoning model optimizations
    temperature: 0.6,            // Optimal for reasoning tasks (0.5-0.7 range)
    max_completion_tokens: 2048, // Increased for complex reasoning
    top_p: 0.95,
    
    // Reasoning format for step-by-step thinking
    reasoning_format: "raw",      // Shows reasoning in <think> tags
    // For Qwen 3 32B models add:
    // reasoning_effort: "default"
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

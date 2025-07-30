import { z } from "zod";

export const ReqSchema = z.object({
  provider: z.enum(["groq", "perplexity-ai", "google-ai-studio", "openai"]),
  model_id: z.enum([
    "gemini-2.5-flash", 
    "gemini-2.5-pro", 
    "llama-3.1-8b-instant", 
    "llama-3.1-70b-versatile", 
    "deepseek-r1-distill-llama-70b", // Reasoning model
    "qwen/qwen3-32b",                // Reasoning model
    "moonshotai/kimi-k2-instruct"
  ]),
  prompt: z.string(),
  system_prompt: z.string().optional(),
});

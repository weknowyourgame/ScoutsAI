import { z } from "zod";

export const analyzeReqSchema = z.object({
  provider: z.enum(["groq", "perplexity-ai", "google-ai-studio", "workers-ai"]),
  model_id: z.enum([
    "gemini-2.5-flash", 
    "gemini-2.5-pro", 
    "gemini-1.0-pro",
    "llama-3.1-8b-instant", 
    "llama-3.1-70b-versatile", 
    "deepseek-r1-distill-llama-70b",
    "qwen/qwen3-32b",
    "moonshotai/kimi-k2-instruct",
    "mistral-7b-instruct",
    "@cf/meta/llama-3.1-8b-instant"
  ]),
  prompt: z.string(),
  system_prompt: z.string().optional(),
}); 
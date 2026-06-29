import { z } from "zod";

export const analyzeReqSchema = z.object({
  provider: z.enum(["openrouter", "groq", "perplexity-ai", "google-ai-studio", "workers-ai"]).optional(),
  model_id: z.string().optional(),
  prompt: z.string(),
  system_prompt: z.string().optional(),
  userId: z.string().optional(),
  scoutId: z.string().optional(),
});

import { z } from "zod";

export const generateTasksSchema = z.object({
  scoutId: z.string(),
  userQuery: z.string(),
  userId: z.string().optional(),
  provider: z.enum(["openrouter", "groq", "perplexity-ai", "google-ai-studio", "workers-ai"]).optional(),
  model_id: z.string().optional(),
});

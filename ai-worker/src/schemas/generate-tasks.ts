import { z } from "zod";

export const generateTasksSchema = z.object({
  scoutId: z.string(),
  userQuery: z.string(),
  provider: z.enum(["groq", "perplexity-ai", "google-ai-studio", "workers-ai"]),
  model_id: z.string(),
}); 
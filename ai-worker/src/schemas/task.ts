import { z } from "zod";

export const ReqSchema = z.object({
  provider: z.enum(["groq", "perplexity-ai"]),
  model_id: z.string(),
  prompt: z.string(),
  system_prompt: z.string().optional(),
});

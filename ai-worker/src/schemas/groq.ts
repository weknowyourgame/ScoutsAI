import { z } from "zod";

export const groqReqSchema = z.object({
  model_id: z.string(),
  prompt: z.string(),
});

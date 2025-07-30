import { z } from "zod";

export const emailReqSchema = z.object({
  email: z.string(),
  subject: z.string(),
  body: z.string(),
});
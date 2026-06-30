import { analyzePrompt } from "../prompts/analyze";
import { todoMakerPrompt } from "../prompts/todo";
import { createGatewayClient } from "../ai/gateway";
import type { AiProfileId } from "../ai/config";
import { ReqSchema } from "../schemas/gateway";
import { analyzeReqSchema } from "../schemas/analyze";
import { z } from "zod";

type Req = z.infer<typeof ReqSchema>;
type AnalyzeReq = z.infer<typeof analyzeReqSchema>;

export async function callGatewayAI(env: Env, input: Req | AnalyzeReq) {
  const isAnalyzeRequest = "system_prompt" in input && input.system_prompt === "Analyze this monitoring request";
  const systemPrompt = isAnalyzeRequest ? analyzePrompt : (input.system_prompt || todoMakerPrompt);
  const profile = ("profile" in input && input.profile) || (isAnalyzeRequest ? "analyzer" : "task-generator");
  const maxTokens = isAnalyzeRequest ? 200 : profile === "task-generator" ? 4096 : 2048;
  const client = createGatewayClient(env);
  const result = await client.chat({
    profile: profile as AiProfileId,
    userId: input.userId,
    scoutId: input.scoutId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.prompt },
    ],
    maxTokens,
  });

  return {
    choices: [
      {
        message: {
          content: result.content,
        },
      },
    ],
  };
}

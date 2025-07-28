import { groqReqSchema } from "../schemas/groq";
import { todoMakerPrompt } from "../prompts/groq";
import { z } from "zod";

type GroqReq = z.infer<typeof groqReqSchema>;

export async function callGroqGateway(env: Env, input: GroqReq) {

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/groq/chat/completions`;

  const body = JSON.stringify({
    messages: [
      {
        role: "system",
        content: todoMakerPrompt,
      },
      {
        role: "user",
        content: input.prompt,
      }
    ],
    model: input.model_id,
  });
  
  console.log('Request URL:', url);
  console.log('Request body:', body);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response status:', response.status);
    console.error('Response headers:', Object.fromEntries(response.headers.entries()));
    console.error('Response body:', errorText);
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
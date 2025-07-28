import { Context } from "hono";
import { callGroqGateway } from "./utils/groq";
import { groqReqSchema } from "./schemas/groq";

export async function groqFetcher(c: Context) {
    const body = await c.req.json();
    const input = groqReqSchema.parse(body);
    const response = await callGroqGateway(c.env, input);

    return c.json(response);
}
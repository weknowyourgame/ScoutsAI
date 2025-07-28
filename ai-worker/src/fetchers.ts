import { Context } from "hono";
import { callGatewayAI } from "./utils/task";
import { ReqSchema } from "./schemas/task";

export async function taskFetcher(c: Context) {
    const body = await c.req.json();
    const input = ReqSchema.parse(body);
    const response = await callGatewayAI(c.env, input);

    return c.json(response);
}
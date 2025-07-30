import { Context } from "hono";
import { callGatewayAI } from "./utils/gateway";
import { ReqSchema } from "./schemas/gateway";
import { sendEmail } from "./emails/utils";
import { emailReqSchema } from "./schemas/email";

export async function taskFetcher(c: Context) {
    const body = await c.req.json();
    const input = ReqSchema.parse(body);
    const response = await callGatewayAI(c.env, input);

    return c.json(response);
}

export async function emailNotifier(c: Context) {
    const body = await c.req.json();
    const input = emailReqSchema.parse(body);
    const response = await sendEmail(c, input);

    return c.json(response);
}
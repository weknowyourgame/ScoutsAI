import { Context } from "hono";
import { emailReqSchema } from "../schemas/email";
import { z } from "zod";

type EmailReq = z.infer<typeof emailReqSchema>;

export async function sendEmail(c: Context, input: EmailReq) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: '<noreply@sarthakkapila.com>',
      to: [input.email],
      subject: input.subject,
      html: input.body,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return Response.json(data);
  }
}
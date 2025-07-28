import { Context, Hono } from "hono";

const app = new Hono();

app.get("/", (c: Context) => c.text("Hello World"));

export default app;
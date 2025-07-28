import { Context, Hono } from "hono";
import { taskFetcher } from "./fetchers";

const app = new Hono();

app.get("/health", (c: Context) => c.text("OK"));
app.post("/task", taskFetcher);

export default app;
import { Context, Hono } from "hono";
import { taskFetcher, emailNotifier } from "./fetchers";

const app = new Hono();

app.get("/health", (c: Context) => c.text("OK"));
app.post("/task", taskFetcher);
app.post("/email", emailNotifier);
export default app;
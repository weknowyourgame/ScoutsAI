import { Context, Hono } from "hono";
import { taskFetcher, emailNotifier, analyzeRequest } from "./fetchers";

const app = new Hono();

app.get("/health", (c: Context) => c.text("OK"));
app.post("/task", taskFetcher);
app.post("/email", emailNotifier);
app.post("/analyze", analyzeRequest);
export default app;
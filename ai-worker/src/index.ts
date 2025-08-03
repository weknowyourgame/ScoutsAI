import { Context, Hono } from "hono";
import { taskFetcher, emailNotifier, analyzeRequest, generateTasks } from "./fetchers";

const app = new Hono();

app.get("/health", (c: Context) => c.text("OK"));
app.post("/task", taskFetcher);
app.post("/email", emailNotifier);
app.post("/analyze", analyzeRequest);
app.post("/generate-tasks", generateTasks);
export default app;
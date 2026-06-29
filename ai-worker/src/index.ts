import { Context, Hono } from "hono";
import { taskFetcher, emailNotifier, analyzeRequest, generateTasks, queueTask } from "./fetchers";
import { processQueuedTask } from "./task-processor";

const app = new Hono();

app.get("/health", (c: Context) => c.text("OK"));
app.post("/task", taskFetcher);
app.post("/email", emailNotifier);
app.post("/analyze", analyzeRequest);
app.post("/generate-tasks", generateTasks);
app.post("/queue-task", queueTask);

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch, env: Env) {
    for (const message of batch.messages) {
      try {
        await processQueuedTask(env, message.body);
        message.ack();
      } catch (error) {
        console.error("Queued task failed:", error);
        message.retry();
      }
    }
  },
  async scheduled(_event: ScheduledEvent, env: Env) {
    const appUrl = env.SCOUTS_APP_URL || "http://localhost:3000";
    await fetch(`${appUrl.replace(/\/$/, "")}/api/scheduler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process" }),
    }).catch((error: unknown) => console.error("Scheduled scout processing failed:", error));
  },
};

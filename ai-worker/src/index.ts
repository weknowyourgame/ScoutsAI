import { Context, Hono } from "hono";
import { taskFetcher } from "./fetchers";

const app = new Hono();

app.get("/", (c: Context) => c.text("Hello World"));

app.post("/task", taskFetcher);

export default app;
import { Context, Hono } from "hono";
import { groqFetcher } from "./fetchers";

const app = new Hono();

app.get("/", (c: Context) => c.text("Hello World"));

app.post("/todo-maker", groqFetcher);

export default app;
import { createGatewayClient, type AiEnv } from "./ai/gateway";
import type { AiProfileId } from "./ai/config";
import { normalizeQueueTask, type QueueEnv } from "./queue";
import type { CompleteTask } from "./schemas/task";

export interface ProcessorEnv extends AiEnv, QueueEnv {
  SCOUTS_APP_URL?: string;
  SCOUTS_INTERNAL_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

type TaskResult =
  | { type: "RESEARCH_AGENT"; researchQuery: string; researchContent: string; completedAt: string }
  | { type: "BROWSER_AUTOMATION"; result: unknown; completedAt: string }
  | { type: "SEARCH_AGENT"; result: unknown; completedAt: string }
  | { type: "ACTION_SCOUT"; result: unknown; completedAt: string }
  | { type: "SUMMARY_AGENT"; summaryContent: string; relatedTodos: number; completedAt: string }
  | { type: "PLEX_AGENT"; result: unknown; completedAt: string };

function appUrl(env: ProcessorEnv) {
  return (env.SCOUTS_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function callApp(env: ProcessorEnv, path: string, body: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.SCOUTS_INTERNAL_API_TOKEN) {
    headers.Authorization = `Bearer ${env.SCOUTS_INTERNAL_API_TOKEN}`;
  }

  const response = await fetch(`${appUrl(env)}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Scouts app API error ${response.status}: ${text}`);
  }

  return response.json().catch(() => ({}));
}

async function textTask(env: ProcessorEnv, task: CompleteTask, system: string, prompt: string, profile: AiProfileId) {
  const ai = createGatewayClient(env);
  const result = await ai.chat({
    profile,
    userId: task.userId,
    scoutId: task.scoutId,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return result.content;
}

async function processResearchAgent(env: ProcessorEnv, task: CompleteTask): Promise<TaskResult> {
  const researchQuery = task.description || task.title;
  const researchContent = await textTask(
    env,
    task,
    "You are a comprehensive research assistant. Provide detailed, structured, current information with useful facts, trends, and caveats.",
    `Research this monitoring task:\n\n${researchQuery}`,
    "researcher",
  );
  return { type: "RESEARCH_AGENT", researchQuery, researchContent, completedAt: new Date().toISOString() };
}

async function processBrowserAutomation(env: ProcessorEnv, task: CompleteTask): Promise<TaskResult> {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Browser Run is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.");
  }

  const url = task.goTo?.[0] || (task.search?.[0] ? `https://www.google.com/search?q=${encodeURIComponent(task.search[0])}` : undefined);
  const prompt = [
    task.description || task.title,
    task.search?.length ? `Search targets: ${task.search.join(", ")}` : "",
    task.actions?.length ? `Actions: ${task.actions.map((action) => `${action.type}: ${action.description}`).join("; ")}` : "",
  ].filter(Boolean).join("\n");

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/json`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(url ? { url } : { html: `<main>${escapeHtml(prompt)}</main>` }),
      prompt,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Cloudflare Browser Run error ${response.status}: ${text}`);
  }

  return { type: "BROWSER_AUTOMATION", result: await response.json(), completedAt: new Date().toISOString() };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function processGenericAgent(env: ProcessorEnv, task: CompleteTask): Promise<TaskResult> {
  const profile = task.agentType === "SUMMARY_AGENT" ? "summarizer" : task.agentType === "ACTION_SCOUT" ? "action" : "search";
  const content = await textTask(
    env,
    task,
    "You are a ScoutsAI agent. Return concise, useful output for the given monitoring task.",
    `Task: ${task.title}\nDescription: ${task.description || ""}\nAgent: ${task.agentType}`,
    profile,
  );

  if (task.agentType === "SUMMARY_AGENT") {
    return { type: "SUMMARY_AGENT", summaryContent: content, relatedTodos: 0, completedAt: new Date().toISOString() };
  }
  if (task.agentType === "ACTION_SCOUT") {
    return { type: "ACTION_SCOUT", result: { content }, completedAt: new Date().toISOString() };
  }
  if (task.agentType === "PLEX_AGENT") {
    return { type: "PLEX_AGENT", result: { content }, completedAt: new Date().toISOString() };
  }
  return { type: "SEARCH_AGENT", result: { content }, completedAt: new Date().toISOString() };
}

async function runTask(env: ProcessorEnv, task: CompleteTask): Promise<TaskResult> {
  switch (task.agentType) {
    case "RESEARCH_AGENT":
      return processResearchAgent(env, task);
    case "BROWSER_AUTOMATION":
      return processBrowserAutomation(env, task);
    case "SEARCH_AGENT":
    case "ACTION_SCOUT":
    case "SUMMARY_AGENT":
    case "PLEX_AGENT":
      return processGenericAgent(env, task);
  }
}

export async function processQueuedTask(env: ProcessorEnv, rawTask: unknown) {
  const task = normalizeQueueTask(rawTask);
  try {
    const result = await runTask(env, task);
    await callApp(env, "/api/update-task-status", {
      todoId: task.todoId,
      status: "COMPLETED",
      resultData: result,
    });
    return result;
  } catch (error) {
    await callApp(env, "/api/update-task-status", {
      todoId: task.todoId,
      status: "FAILED",
      resultData: { error: error instanceof Error ? error.message : "Unknown error" },
    }).catch(() => undefined);
    throw error;
  }
}

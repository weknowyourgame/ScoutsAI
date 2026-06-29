'use client';

export type BrowserTodo = {
  id: string;
  scoutId: string;
  userId: string;
  title: string;
  description: string | null;
  agentType: string;
  taskType: string;
  status: string;
  condition: unknown;
  resultData: unknown;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  scheduledFor: string | null;
  lastRunAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  goTo: string[];
  search: string[];
  actions: unknown;
  logs: Array<{
    id: string;
    message: string;
    data: unknown;
    createdAt: string;
  }>;
};

export type BrowserScout = {
  id: string;
  userId: string;
  userQuery: string;
  status: string;
  notificationFrequency: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
  todos: BrowserTodo[];
  summaries: Array<{
    id: string;
    title: string;
    content: string;
    data: unknown;
    todoId: string | null;
    createdAt: string;
  }>;
  logs: Array<{
    id: string;
    message: string;
    data: unknown;
    createdAt: string;
  }>;
};

type TaskInput = {
  id?: string;
  title: string;
  description?: string | null;
  agentType?: string;
  taskType?: string;
  condition?: unknown;
  goTo?: string[];
  search?: string[];
  actions?: unknown;
};

const STORAGE_KEY = "scouts.localScouts";
const EVENT_NAME = "scouts-local-store-change";

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function read(): BrowserScout[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as BrowserScout[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(scouts: BrowserScout[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scouts));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeToBrowserScouts(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function listBrowserScouts() {
  return read().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function createBrowserScout(input: {
  userId: string;
  userQuery: string;
  email?: string;
  notificationFrequency: string;
}) {
  const timestamp = now();
  const scout: BrowserScout = {
    id: id("browser_scout"),
    userId: input.userId,
    userQuery: input.userQuery,
    status: "IN_PROGRESS",
    notificationFrequency: input.notificationFrequency,
    createdAt: timestamp,
    updatedAt: timestamp,
    user: { email: input.email || "local@scouts.dev" },
    todos: [],
    summaries: [],
    logs: [],
  };

  write([scout, ...read()]);
  return scout;
}

export function addBrowserTodos(scoutId: string, userId: string, tasks: TaskInput[]) {
  const scouts = read();
  const scout = scouts.find((item) => item.id === scoutId);
  if (!scout) return [];

  const timestamp = now();
  const todos: BrowserTodo[] = tasks.map((task) => ({
    id: task.id || id("browser_todo"),
    scoutId,
    userId,
    title: task.title,
    description: task.description || null,
    agentType: task.agentType || "RESEARCH_AGENT",
    taskType: task.taskType || "SINGLE_RUN",
    status: "PENDING",
    condition: task.condition || null,
    resultData: {},
    errorMessage: null,
    retryCount: 0,
    maxRetries: 3,
    scheduledFor: null,
    lastRunAt: null,
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    goTo: task.goTo || [],
    search: task.search || [],
    actions: task.actions || null,
    logs: [],
  }));

  scout.todos.push(...todos);
  scout.updatedAt = timestamp;
  write(scouts);
  return todos;
}

export function getBrowserScoutStatus(scoutId: string) {
  const scout = read().find((item) => item.id === scoutId);
  if (!scout) return null;

  const totalTodos = scout.todos.length;
  const completedTodos = scout.todos.filter((todo) => todo.status === "COMPLETED").length;
  const failedTodos = scout.todos.filter((todo) => todo.status === "FAILED").length;
  const inProgressTodos = scout.todos.filter((todo) => todo.status === "IN_PROGRESS").length;
  const pendingTodos = scout.todos.filter((todo) => todo.status === "PENDING").length;

  return {
    scout,
    progress: {
      totalTodos,
      completedTodos,
      failedTodos,
      inProgressTodos,
      pendingTodos,
      progressPercentage: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
      status: scout.status,
    },
    todos: scout.todos,
    summaries: scout.summaries,
    logs: scout.logs,
    localOnly: true,
  };
}

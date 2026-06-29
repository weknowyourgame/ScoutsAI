type LocalTaskInput = {
  title: string;
  description?: string;
  agentType?: string;
  taskType?: string;
  condition?: unknown;
  goTo?: string[];
  search?: string[];
  actions?: unknown;
};

type LocalTodo = {
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

type LocalScout = {
  id: string;
  userId: string;
  userQuery: string;
  status: string;
  notificationFrequency: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
  todos: LocalTodo[];
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

type LocalStore = {
  scouts: LocalScout[];
};

const STORE_KEY = "__scoutsLocalDevStore";

function store(): LocalStore {
  const root = globalThis as unknown as Record<string, LocalStore | undefined>;
  if (!root[STORE_KEY]) {
    root[STORE_KEY] = { scouts: [] };
  }
  return root[STORE_KEY];
}

function id(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

export function listLocalScouts() {
  return [...store().scouts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function createLocalScout(input: {
  userId?: string;
  userQuery: string;
  email?: string;
  notificationFrequency?: string;
}) {
  const now = new Date().toISOString();
  const scout: LocalScout = {
    id: id("local_scout"),
    userId: input.userId || "test-user-local",
    userQuery: input.userQuery,
    status: "IN_PROGRESS",
    notificationFrequency: input.notificationFrequency || "ONCE_A_DAY",
    createdAt: now,
    updatedAt: now,
    user: { email: input.email || "local@scouts.dev" },
    todos: [],
    summaries: [],
    logs: [],
  };

  store().scouts.unshift(scout);
  return scout;
}

export function addLocalTodos(scoutId: string, userId: string, tasks: LocalTaskInput[]) {
  const scout = store().scouts.find((item) => item.id === scoutId);
  if (!scout) return [];

  const now = new Date().toISOString();
  const todos = tasks.map((task) => ({
    id: id("local_todo"),
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
    createdAt: now,
    updatedAt: now,
    goTo: task.goTo || [],
    search: task.search || [],
    actions: task.actions || null,
    logs: [],
  }));

  scout.todos.push(...todos);
  scout.updatedAt = now;
  return todos;
}

export function getPendingLocalTodos(scoutId: string) {
  return store().scouts.find((item) => item.id === scoutId)?.todos.filter((todo) => todo.status === "PENDING") ?? [];
}

export function markLocalTodosInProgress(todoIds: string[]) {
  const now = new Date().toISOString();
  const ids = new Set(todoIds);
  for (const scout of store().scouts) {
    for (const todo of scout.todos) {
      if (ids.has(todo.id)) {
        todo.status = "IN_PROGRESS";
        todo.lastRunAt = now;
        todo.updatedAt = now;
      }
    }
    scout.updatedAt = now;
  }
}

export function getLocalScoutStatus(scoutId: string) {
  const scout = store().scouts.find((item) => item.id === scoutId);
  if (!scout) return null;

  const totalTodos = scout.todos.length;
  const completedTodos = scout.todos.filter((todo) => todo.status === "COMPLETED").length;
  const failedTodos = scout.todos.filter((todo) => todo.status === "FAILED").length;
  const inProgressTodos = scout.todos.filter((todo) => todo.status === "IN_PROGRESS").length;
  const pendingTodos = scout.todos.filter((todo) => todo.status === "PENDING").length;

  return {
    scout: {
      id: scout.id,
      userQuery: scout.userQuery,
      status: scout.status,
      notificationFrequency: scout.notificationFrequency,
      createdAt: scout.createdAt,
      updatedAt: scout.updatedAt,
    },
    progress: {
      totalTodos,
      completedTodos,
      failedTodos,
      inProgressTodos,
      pendingTodos,
      progressPercentage: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
      status: scout.status,
    },
    performance: {
      averageExecutionTime: 0,
      successRate: 0,
      totalExecutions: 0,
      agentTypeBreakdown: {},
    },
    todos: scout.todos,
    summaries: scout.summaries,
    logs: scout.logs,
    localOnly: true,
  };
}

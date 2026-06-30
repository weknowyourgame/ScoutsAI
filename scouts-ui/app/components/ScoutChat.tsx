"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Clock3, FileText, Loader2, MessageSquareText, Search, XCircle } from "lucide-react";
import { getBrowserScoutStatus, subscribeToBrowserScouts } from "../lib/browser-scout-store";
import { isBrowserLocalOnlyMode } from "../lib/local-mode";

type ScoutStatus = {
  scout?: {
    id: string;
    userQuery: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  progress?: {
    totalTodos: number;
    completedTodos: number;
    failedTodos: number;
    inProgressTodos: number;
    pendingTodos: number;
    progressPercentage: number;
    status: string;
  };
  todos?: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    taskType?: string;
    agentType?: string;
    resultData?: unknown;
    errorMessage?: string | null;
    createdAt?: string;
    lastRunAt?: string | null;
    completedAt?: string | null;
    search?: string[];
    logs?: Array<{ id: string; message: string; createdAt?: string }>;
  }>;
  summaries?: Array<{
    id: string;
    title: string;
    content: string;
    createdAt?: string;
    isFinalSummary?: boolean;
  }>;
  logs?: Array<{ id: string; message: string; createdAt?: string }>;
};

type TimelineItem = {
  id: string;
  kind: "summary" | "task" | "result" | "log" | "error";
  title: string;
  body: string;
  at?: string | null;
  status?: string;
};

export default function ScoutChat({ scoutId }: { scoutId?: string }) {
  const [data, setData] = useState<ScoutStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scoutId) return;
    const activeScoutId = scoutId;

    async function load() {
      setLoading(true);
      try {
        if (isBrowserLocalOnlyMode()) {
          setData(getBrowserScoutStatus(activeScoutId) as ScoutStatus | null);
          return;
        }

        const res = await fetch(`/api/scout-status?scoutId=${activeScoutId}`, { cache: "no-store" });
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    }

    load();
    if (isBrowserLocalOnlyMode()) return subscribeToBrowserScouts(load);
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [scoutId]);

  const timeline = useMemo(() => buildTimeline(data), [data]);
  const progress = data?.progress;

  if (!scoutId) {
    return (
      <section className="chat-shell empty-chat">
        <Bot size={30} />
        <h2>Select a Scout</h2>
        <p>Agent activity opens in its own room now, separate from the landing surface.</p>
      </section>
    );
  }

  return (
    <section className="chat-shell">
      <div className="chat-header">
        <div>
          <div className="small-label">Scout transcript</div>
          <h2>{data?.scout?.userQuery || "Collecting workspace"}</h2>
        </div>
        {loading ? (
          <span className="refresh-pill">
            <Loader2 className="spin" size={14} />
            Syncing
          </span>
        ) : (
          <span className="refresh-pill">
            <Clock3 size={14} />
            Updated
          </span>
        )}
      </div>

      <div className="progress-grid">
        <Metric label="Tasks" value={progress?.totalTodos ?? 0} />
        <Metric label="Done" value={progress?.completedTodos ?? 0} />
        <Metric label="Pending" value={progress?.pendingTodos ?? 0} />
        <Metric label="Failed" value={progress?.failedTodos ?? 0} />
      </div>

      <div className="progress-bar" aria-label="Scout progress">
        <span style={{ width: `${Math.max(4, Math.min(100, progress?.progressPercentage ?? 0))}%` }} />
      </div>

      <div className="timeline">
        {!loading && timeline.length === 0 ? (
          <div className="empty-state rich-empty">
            <Search size={24} />
            <h3>Waiting for first tasks</h3>
            <p>The generator is preparing this scout&apos;s initial watch plan. New findings will land here.</p>
          </div>
        ) : null}

        {timeline.map((item) => (
          <article className="timeline-item" key={item.id}>
            <div className={`timeline-icon kind-${item.kind}`}>{iconFor(item.kind)}</div>
            <div className="timeline-card">
              <div className="timeline-meta">
                <span>{labelFor(item.kind)}</span>
                {item.status ? <span>{formatStatus(item.status)}</span> : null}
                {item.at ? <time>{formatDate(item.at)}</time> : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function buildTimeline(data: ScoutStatus | null): TimelineItem[] {
  if (!data) return [];

  const items: TimelineItem[] = [];

  for (const summary of data.summaries || []) {
    items.push({
      id: `summary-${summary.id}`,
      kind: "summary",
      title: summary.title || "Scout summary",
      body: summary.content || "No summary content yet.",
      at: summary.createdAt,
    });
  }

  for (const todo of data.todos || []) {
    items.push({
      id: `task-${todo.id}`,
      kind: todo.status === "FAILED" ? "error" : "task",
      title: todo.title || "Scout task",
      body: todo.description || describeTask(todo),
      at: todo.completedAt || todo.lastRunAt || todo.createdAt,
      status: todo.status,
    });

    if (todo.errorMessage) {
      items.push({
        id: `error-${todo.id}`,
        kind: "error",
        title: "Task error",
        body: todo.errorMessage,
        at: todo.completedAt || todo.lastRunAt || todo.createdAt,
        status: todo.status,
      });
    }

    if (todo.resultData && JSON.stringify(todo.resultData) !== "{}") {
      items.push({
        id: `result-${todo.id}`,
        kind: "result",
        title: `${todo.title} result`,
        body: stringifyResult(todo.resultData),
        at: todo.completedAt || todo.lastRunAt || todo.createdAt,
        status: todo.status,
      });
    }

    for (const log of todo.logs || []) {
      items.push({
        id: `todo-log-${todo.id}-${log.id}`,
        kind: "log",
        title: "Agent log",
        body: log.message,
        at: log.createdAt,
        status: todo.status,
      });
    }
  }

  for (const log of data.logs || []) {
    items.push({
      id: `log-${log.id}`,
      kind: "log",
      title: "Workspace log",
      body: log.message,
      at: log.createdAt,
    });
  }

  return items.sort((a, b) => Date.parse(b.at || "") - Date.parse(a.at || ""));
}

function describeTask(todo: { search?: string[]; taskType?: string; agentType?: string }) {
  const search = todo.search?.filter(Boolean).join(", ");
  if (search) return `Search targets: ${search}`;
  return `${formatStatus(todo.agentType || "research agent")} task, ${formatStatus(todo.taskType || "single run")}.`;
}

function stringifyResult(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Result data could not be rendered.";
  }
}

function iconFor(kind: TimelineItem["kind"]) {
  if (kind === "summary") return <FileText size={16} />;
  if (kind === "result") return <CheckCircle2 size={16} />;
  if (kind === "error") return <XCircle size={16} />;
  if (kind === "log") return <MessageSquareText size={16} />;
  return <Bot size={16} />;
}

function labelFor(kind: TimelineItem["kind"]) {
  if (kind === "summary") return "Summary";
  if (kind === "result") return "Result";
  if (kind === "error") return "Needs attention";
  if (kind === "log") return "Log";
  return "Task";
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

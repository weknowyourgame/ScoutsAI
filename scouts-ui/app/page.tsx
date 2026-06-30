"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Github,
  Loader2,
  Mail,
  Moon,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Sun,
  Target,
  TerminalSquare,
  Zap,
} from "lucide-react";
import ScoutChat from "./components/ScoutChat";
import {
  addBrowserTodos,
  createBrowserScout,
  listBrowserScouts,
  subscribeToBrowserScouts,
} from "./lib/browser-scout-store";
import { isBrowserLocalOnlyMode } from "./lib/local-mode";
import { getOrCreateLocalScoutUser } from "./lib/local-user";

type Scout = {
  id: string;
  userQuery: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  todos?: unknown[];
};

const EXAMPLE_PROMPTS = [
  "Track seed-stage AI infra funding and summarize new rounds",
  "Watch competitors hiring founding designers or platform engineers",
  "Monitor Hacker News, GitHub, and Product Hunt for browser automation tools",
];

const FEATURE_CARDS = [
  {
    title: "Precise watchers",
    body: "Give a Scout a target and it turns the intent into trackable tasks, searches, and summaries.",
    icon: Target,
  },
  {
    title: "Live agent rooms",
    body: "Each Scout gets a dedicated workspace for todos, findings, logs, and final briefs.",
    icon: Bot,
  },
  {
    title: "Signal first",
    body: "The interface is built around what changed, why it matters, and what to do next.",
    icon: Radar,
  },
];

const COMMANDS = [
  "watch: founders hiring AI agents",
  "scan: SEC filings and product launches",
  "brief: only material changes",
  "sync: workspace when signal shifts",
];

function Header({ onDeployClick }: { onDeployClick: () => void }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="site-header">
      <a className="brand" href="#" aria-label="ScoutsAI home">
        <span className="brand-mark">
          <Radar size={17} strokeWidth={2.3} />
        </span>
        <span className="brand-word">ScoutsAI</span>
      </a>

      <nav className="header-actions" aria-label="Primary navigation">
        <a className="icon-link" href="https://github.com/sarthakkapila/ScoutsAI" target="_blank" rel="noreferrer" aria-label="Open GitHub repository">
          <Github size={17} />
        </a>
        <button className="icon-link" type="button" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <button className="btn btn-primary hide-sm" type="button" onClick={onDeployClick}>
          <Plus size={16} />
          Deploy
        </button>
      </nav>
    </header>
  );
}

function Hero({ onDeployClick }: { onDeployClick: () => void }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <Sparkles size={14} />
          Always-on web intelligence
        </div>

        <h1 className="hero-title">
          <span>Know first.</span>
          <span>Act faster.</span>
        </h1>

        <p className="hero-text">
          Deploy focused AI scouts that watch markets, people, companies, and web signals, then keep a live agent room updated as the world changes.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-large" type="button" onClick={onDeployClick}>
            <Send size={17} />
            Deploy a Scout
          </button>
          <a className="btn btn-secondary btn-large" href="#workbench">
            Explore workspace
            <ArrowRight size={17} />
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="signal-panel">
          <div className="signal-panel-top">
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-dot" />
            <span className="panel-label">agent feed</span>
          </div>
          <div className="signal-map">
            <div className="scan-line" />
            <span className="signal-node node-a" />
            <span className="signal-node node-b" />
            <span className="signal-node node-c" />
            <span className="signal-node node-d" />
            <span className="signal-route route-a" />
            <span className="signal-route route-b" />
          </div>
          <div className="command-stack">
            {COMMANDS.map((command) => (
              <div className="command-row" key={command}>
                <TerminalSquare size={14} />
                <span>{command}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  return (
    <section className="feature-strip" aria-label="Product highlights">
      {FEATURE_CARDS.map((feature) => {
        const Icon = feature.icon;
        return (
          <article className="feature-item" key={feature.title}>
            <div className="feature-icon">
              <Icon size={18} />
            </div>
            <div>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function DeployWorkbench({
  selected,
  onCreated,
  onOpenAgent,
}: {
  selected?: string;
  onCreated: (id: string) => void;
  onOpenAgent: (id: string) => void;
}) {
  return (
    <section className="workbench" id="workbench">
      <div className="section-kicker">
        <span />
        Live product
        <span />
      </div>

      <div className="workbench-grid">
        <DeployForm onCreated={onCreated} />
        <ScoutsList selected={selected} onSelect={onCreated} onOpenAgent={onOpenAgent} />
      </div>
    </section>
  );
}

function DeployForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = query.trim().length > 0 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError("");

    try {
      const localUser = getOrCreateLocalScoutUser(email || undefined);
      const payload = {
        userQuery: query.trim(),
        userId: localUser.id,
        email: localUser.email,
        notificationFrequency: "ONCE_A_DAY",
      };

      const scout = isBrowserLocalOnlyMode() ? createBrowserScout(payload) : await createServerScout(payload);
      onCreated(scout.id);

      const res = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId: scout.id, userQuery: query.trim(), userId: localUser.id }),
      });

      if (res.ok) {
        const { tasks } = await res.json();
        if (isBrowserLocalOnlyMode() && tasks?.length) addBrowserTodos(scout.id, localUser.id, tasks);
      }

      setQuery("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Could not deploy this Scout. Check the API worker and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="deploy-card">
      <div className="card-heading">
        <div className="card-icon">
          <Zap size={19} />
        </div>
        <div>
          <h2>Deploy a Scout</h2>
          <p>Tell it what to watch. The agent breaks it into tasks and starts building a workspace.</p>
        </div>
      </div>

      <div className="prompt-shell">
        <Search className="field-icon" size={18} />
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
          }}
          placeholder="Track AI funding rounds, product launches, and competitors hiring browser automation engineers..."
          rows={5}
        />
      </div>

      <div className="field-row">
        <Mail className="field-icon" size={17} />
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com (optional)" />
      </div>

      <div className="example-stack" aria-label="Example prompts">
        {EXAMPLE_PROMPTS.map((example) => (
          <button key={example} type="button" onClick={() => setQuery(example)}>
            <Sparkles size={13} />
            {example}
          </button>
        ))}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="btn btn-primary btn-full btn-large" type="button" disabled={!canSubmit} onClick={submit}>
        {busy ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        {busy ? "Deploying Scout" : "Start watching"}
      </button>
    </article>
  );
}

function ScoutsList({
  selected,
  onSelect,
  onOpenAgent,
}: {
  selected?: string;
  onSelect: (id: string) => void;
  onOpenAgent: (id: string) => void;
}) {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      if (isBrowserLocalOnlyMode()) {
        setScouts(listBrowserScouts());
        return;
      }
      const res = await fetch("/api/scouts", { cache: "no-store" });
      const data = await res.json();
      setScouts(data.scouts || []);
    } catch {
      setScouts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (isBrowserLocalOnlyMode()) return subscribeToBrowserScouts(load);
  }, []);

  const activeScouts = useMemo(() => scouts.filter((scout) => scout.status !== "COMPLETED").length, [scouts]);

  return (
    <article className="scouts-card">
      <div className="list-header">
        <div>
          <div className="small-label">Your Scouts</div>
          <h2>{scouts.length ? `${scouts.length} agent rooms` : "No agents yet"}</h2>
        </div>
        <button className="icon-link" type="button" onClick={load} aria-label="Refresh scouts">
          <RefreshCw className={loading ? "spin" : ""} size={17} />
        </button>
      </div>

      <div className="mini-stats">
        <div>
          <strong>{activeScouts}</strong>
          <span>active</span>
        </div>
        <div>
          <strong>{scouts.length - activeScouts}</strong>
          <span>settled</span>
        </div>
      </div>

      <div className="scout-list">
        {loading && scouts.length === 0 ? <div className="empty-state">Loading scouts...</div> : null}

        {!loading && scouts.length === 0 ? (
          <div className="empty-state rich-empty">
            <Radar size={24} />
            <h3>Build your first watch room</h3>
            <p>Deploy a Scout and this panel becomes a launchpad into its dedicated agent workspace.</p>
          </div>
        ) : null}

        {scouts.map((scout) => (
          <div className={`scout-row-button ${selected === scout.id ? "is-selected" : ""}`} key={scout.id}>
            <button className="scout-select" type="button" onClick={() => onSelect(scout.id)}>
              <span className="status-dot" />
              <span className="scout-row-main">
                <strong>{scout.userQuery}</strong>
                <small>{formatStatus(scout.status)}{scout.todos ? ` - ${scout.todos.length} tasks` : ""}</small>
              </span>
            </button>
            <button className="open-agent" type="button" onClick={() => onOpenAgent(scout.id)} aria-label={`Open agent room for ${scout.userQuery}`}>
              <ExternalLink size={15} />
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}

function AgentRoom({
  scoutId,
  onBack,
  onSelect,
}: {
  scoutId: string;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      if (isBrowserLocalOnlyMode()) {
        setScouts(listBrowserScouts());
        return;
      }
      const res = await fetch("/api/scouts", { cache: "no-store" });
      const data = await res.json();
      setScouts(data.scouts || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (isBrowserLocalOnlyMode()) return subscribeToBrowserScouts(load);
  }, []);

  const current = scouts.find((scout) => scout.id === scoutId);

  return (
    <main className="agent-room">
      <aside className="agent-sidebar">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          Landing
        </button>

        <div className="agent-brand">
          <span className="brand-mark">
            <Bot size={17} />
          </span>
          <div>
            <strong>Agent rooms</strong>
            <span>{loading ? "Refreshing..." : `${scouts.length} scouts`}</span>
          </div>
        </div>

        <div className="agent-room-list">
          {scouts.map((scout) => (
            <button
              key={scout.id}
              type="button"
              className={scout.id === scoutId ? "is-active" : ""}
              onClick={() => onSelect(scout.id)}
            >
            <span className="status-dot" />
              <strong>{scout.userQuery}</strong>
              <small>{formatStatus(scout.status)}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="agent-main">
        <header className="agent-topbar">
          <div>
            <div className="small-label">Dedicated agent chat</div>
            <h1>{current?.userQuery || "Scout workspace"}</h1>
          </div>
          <div className="agent-pills">
            <span>
              <Activity size={14} />
              {formatStatus(current?.status || "IN_PROGRESS")}
            </span>
            <span>
              <Clock3 size={14} />
              Live refresh
            </span>
          </div>
        </header>

        <div className="agent-content-grid">
          <ScoutChat scoutId={scoutId} />
          <aside className="agent-notes">
            <div className="note-card">
              <CheckCircle2 size={18} />
              <div>
                <h2>Signal discipline</h2>
                <p>Findings, tasks, and summaries stay in this room so the landing page remains clean.</p>
              </div>
            </div>
            <div className="note-card">
              <FileText size={18} />
              <div>
                <h2>Workspace memory</h2>
                <p>The room polls the scout status endpoint and keeps browser-local scouts in sync instantly.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-wordmark">SCOUTS AI</div>
      <div className="footer-meta">
        <span>Private local mode supported</span>
        <span>Open source agent workspace</span>
      </div>
    </footer>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [agentRoom, setAgentRoom] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [agentRoom]);

  function scrollToWorkbench() {
    document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openAgent(id: string) {
    setSelected(id);
    setAgentRoom(true);
  }

  if (selected && agentRoom) {
    return <AgentRoom scoutId={selected} onBack={() => setAgentRoom(false)} onSelect={setSelected} />;
  }

  return (
    <main className="site-container">
      <Header onDeployClick={scrollToWorkbench} />
      <Hero onDeployClick={scrollToWorkbench} />
      <FeatureStrip />
      <DeployWorkbench selected={selected} onCreated={setSelected} onOpenAgent={openAgent} />
      <Footer />
    </main>
  );
}

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ");
}

async function createServerScout(payload: { userQuery: string; userId: string; email?: string; notificationFrequency: string }) {
  const res = await fetch("/api/scouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create scout");
  return (await res.json()).scout;
}

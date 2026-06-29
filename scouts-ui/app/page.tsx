'use client';

import { useState, useEffect, useRef } from "react";
import ScoutChat from "./components/ScoutChat";
import SidebarScouts from "./components/SidebarScouts";
import { addBrowserTodos, createBrowserScout } from "./lib/browser-scout-store";
import { isBrowserLocalOnlyMode } from "./lib/local-mode";
import { getOrCreateLocalScoutUser } from "./lib/local-user";

// ─── Icons ────────────────────────────────────────────────────────────────────

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)" }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 8 16 12 12 16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const LoaderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" /><path d="M21 12a9 9 0 00-9-9" />
  </svg>
);

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
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
    <header className="header">
      <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "inherit" }}>
        <div style={{
          width: 30, height: 30,
          background: "oklch(0.58 0.2346 278.29)",
          borderRadius: "0.4rem",
          display: "grid", placeItems: "center",
          fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 700, color: "#fff",
        }}>S</div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 600 }}>
          ScoutsAI
        </span>
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button className="theme-switch" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
        <a href="#deploy" className="btn btn-primary">
          <span>Deploy Scout</span>
          <ArrowIcon />
        </a>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [stars, setStars] = useState<string>("—");

  useEffect(() => {
    fetch("https://api.github.com/repos/sarthakkapila/ScoutsAI")
      .then(r => r.json())
      .then(d => { if (typeof d.stargazers_count === "number") setStars(d.stargazers_count.toLocaleString()); else setStars("★"); })
      .catch(() => setStars("★"));
  }, []);

  return (
    <section className="hero">
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 90% at 75% 50%, rgba(100,50,210,0.13) 0%, transparent 70%)",
      }} />

      <div className="hero-content">
        {/* Star pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 1.5rem" }}>
          <div className="star-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="1.5">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span className="star-count">{stars}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="star-dot" />
            <div className="star-gradient-line" />
          </div>
        </div>

        {/* Headline */}
        <div className="hero-headline">
          <div>
            <span className="muted">Know </span>
            <span className="bright">First.</span>
          </div>
          <div>
            <span className="muted">Act </span>
            <span className="bright">Faster.</span>
          </div>
        </div>

        {/* Sub-line */}
        <p style={{
          padding: "0 1.5rem",
          fontSize: "0.85rem",
          color: "rgba(250,250,250,0.42)",
          lineHeight: 1.6,
          maxWidth: "30rem",
        }}>
          Deploy focused AI agents that watch markets, people, and signals — and keep your workspace updated automatically.
        </p>

        {/* CTAs */}
        <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem", padding: "0 1.5rem" }}>
          <a href="#deploy" className="btn btn-primary">
            <span>Deploy a Scout</span>
            <ArrowIcon />
          </a>
          <a href="https://github.com/sarthakkapila/ScoutsAI" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <span>Open Source</span>
            <GitHubIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { title: "Always-On Monitoring", desc: "Scouts run 24/7, watching markets, people, companies, and signals so you never miss what matters." },
  { title: "Live Workspaces",       desc: "Findings aren't just notifications — scouts keep structured artifacts updated as conditions change." },
  { title: "Privacy First",         desc: "Your data stays in your browser by default. No tracking, no selling. Local storage or opt-in sync." },
];

function Features() {
  return (
    <section className="features">
      {FEATURES.map((f, i) => (
        <div key={f.title} className="feature-card" style={i === FEATURES.length - 1 ? { borderBottom: "none" } : undefined}>
          <div className="feature-title">{f.title}</div>
          <div className="feature-desc">{f.desc}</div>
        </div>
      ))}
    </section>
  );
}

// ─── Deploy Form ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.4rem",
  padding: "0.55rem 0.75rem 0.55rem 2.2rem",
  color: "inherit",
  fontSize: "0.85rem",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

function DeployForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!query.trim() || busy) return;
    setBusy(true);
    try {
      const localUser = getOrCreateLocalScoutUser(email || undefined);
      const payload = {
        userQuery: query,
        userId: localUser.id,
        email: localUser.email,
        notificationFrequency: "ONCE_A_DAY",
      };

      const scout = isBrowserLocalOnlyMode()
        ? createBrowserScout(payload)
        : await createServerScout(payload);

      onCreated(scout.id);

      const res = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoutId: scout.id, userQuery: query, userId: localUser.id }),
      });
      if (res.ok) {
        const { tasks } = await res.json();
        if (isBrowserLocalOnlyMode() && tasks?.length) addBrowserTodos(scout.id, localUser.id, tasks);
      }
      setQuery("");
      setEmail("");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }} id="deploy">
      <div>
        <div className="feature-title" style={{ marginBottom: "0.25rem" }}>Deploy a Scout</div>
        <div className="feature-desc">Describe what to watch — markets, people, companies, or any signal.</div>
      </div>

      {/* Query input */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", opacity: 0.4, display: "flex" }}>
          <SearchIcon />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Track AI funding rounds and new tool launches…"
          style={inputStyle}
        />
      </div>

      {/* Email input */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", opacity: 0.4, display: "flex" }}>
          <MailIcon />
        </span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com (optional)"
          style={inputStyle}
        />
      </div>

      <button
        onClick={submit}
        disabled={!query.trim() || busy}
        className="btn btn-primary"
        style={{ justifyContent: "center", opacity: !query.trim() || busy ? 0.5 : 1, cursor: !query.trim() || busy ? "not-allowed" : "pointer" }}
      >
        {busy ? <><LoaderIcon /><span>Creating…</span></> : <><span>Deploy Scout</span><ArrowIcon /></>}
      </button>

      <div style={{ fontSize: "0.7rem", color: "rgba(250,250,250,0.3)", textAlign: "center", marginTop: "0.25rem" }}>
        Private local mode · no account required
      </div>
    </div>
  );
}

// ─── App Section ──────────────────────────────────────────────────────────────

function AppSection({ selected, setSelected }: { selected: string | undefined; setSelected: (id: string) => void }) {
  return (
    <section>
      {/* Badge header */}
      <div className="scouts-header">
        <span className="fancy-badge">Live Workspace</span>
      </div>

      {/* Main two-column: form | scouts list */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderBottom: "1px dashed rgba(255,255,255,0.1)",
      }}>
        {/* Left: deploy form */}
        <div style={{ borderRight: "1px dashed rgba(255,255,255,0.1)" }}>
          <DeployForm onCreated={setSelected} />
        </div>

        {/* Right: scouts list */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <div className="feature-title" style={{ marginBottom: "0.25rem" }}>Your Scouts</div>
            <div className="feature-desc">Click a scout to view its live workspace.</div>
          </div>
          <ScoutsList selected={selected} onSelect={setSelected} />
        </div>
      </div>

      {/* Scout activity — full width */}
      <div style={{ padding: "1.5rem", borderBottom: "1px dashed rgba(255,255,255,0.1)" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div className="feature-title" style={{ marginBottom: "0.25rem" }}>Scout Activity</div>
          <div className="feature-desc">{selected ? "Live findings from the selected scout." : "Select a scout above to see its findings."}</div>
        </div>
        <ScoutChat scoutId={selected} />
      </div>
    </section>
  );
}

// ─── Scouts List (flat, matches landing style) ────────────────────────────────

import { useEffect as useEff } from "react";
import { listBrowserScouts, subscribeToBrowserScouts } from "./lib/browser-scout-store";

function ScoutsList({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  const [scouts, setScouts] = useState<{ id: string; userQuery: string; status: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (isBrowserLocalOnlyMode()) { setScouts(listBrowserScouts()); return; }
      const res = await fetch("/api/scouts", { cache: "no-store" });
      const data = await res.json();
      setScouts(data.scouts || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEff(() => {
    load();
    if (isBrowserLocalOnlyMode()) return subscribeToBrowserScouts(load);
  }, []);

  if (loading) return <div style={{ fontSize: "0.78rem", color: "rgba(250,250,250,0.3)" }}>Loading…</div>;

  if (scouts.length === 0) return (
    <div style={{
      border: "1px dashed rgba(255,255,255,0.1)",
      borderRadius: "0.4rem",
      padding: "1rem",
      fontSize: "0.78rem",
      color: "rgba(250,250,250,0.3)",
    }}>
      No scouts yet — deploy one to get started.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {scouts.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          style={{
            background: selected === s.id ? "oklch(0.58 0.2346 278.29)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${selected === s.id ? "oklch(0.58 0.2346 278.29)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "0.4rem",
            padding: "0.6rem 0.75rem",
            textAlign: "left",
            color: "inherit",
            cursor: "pointer",
            transition: "all 0.15s",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.userQuery}
          </div>
          <div style={{ fontSize: "0.68rem", marginTop: "0.15rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {s.status}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const SVG_W = 800;
const SVG_H = 180;

function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const circle = circleRef.current;
    if (!container || !circle) return;

    let targetX = SVG_W / 2, targetY = SVG_H * 0.6;
    let smoothX = SVG_W / 2, smoothY = SVG_H / 2;
    let hovered = false, dirX = 1, dirY = 1, raf: number;

    function tick() {
      if (!hovered) {
        targetX += dirX * 1.2; if (targetX >= SVG_W || targetX <= 0) dirX *= -1;
        targetY += dirY * 0.7; if (targetY >= SVG_H * 0.85 || targetY <= SVG_H * 0.15) dirY *= -1;
      }
      smoothX += (targetX - smoothX) * 0.12;
      smoothY += (targetY - smoothY) * 0.12;
      circle?.setAttribute("cx", String(smoothX));
      circle?.setAttribute("cy", String(smoothY));
      raf = requestAnimationFrame(tick);
    }
    tick();

    const onMove  = (e: MouseEvent) => { const r = (container as HTMLDivElement).getBoundingClientRect(); targetX = ((e.clientX - r.left) / r.width) * SVG_W; targetY = ((e.clientY - r.top) / r.height) * SVG_H; };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); container.removeEventListener("mousemove", onMove); container.removeEventListener("mouseenter", onEnter); container.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <footer>
      <div className="footer-container" ref={containerRef}>
        <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x={SVG_W / 2} y="68%" textAnchor="middle"
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: 108, fill: "url(#ftg)", stroke: "#2C2C2C", strokeWidth: 0.4, strokeLinejoin: "round" }}>
            SCOUTS AI
          </text>
          <g mask="url(#fm)">
            <circle ref={circleRef} cx={SVG_W / 2} cy={SVG_H / 2} r="100" fill="url(#fcg)" filter="url(#fb)" />
          </g>
          <defs>
            <filter id="fb" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
            </filter>
            <mask id="fm">
              <text x={SVG_W / 2} y="68%" textAnchor="middle"
                style={{ fontFamily: "'Instrument Serif', serif", fontSize: 108, fill: "white", opacity: 0.75 }}>
                SCOUTS AI
              </text>
            </mask>
            <linearGradient id="ftg" x1={SVG_W / 2} y1="0" x2={SVG_W / 2} y2={SVG_H} gradientUnits="userSpaceOnUse">
              <stop stopColor="#2C2C2C" stopOpacity="0" />
              <stop offset="1" stopColor="#2C2C2C" stopOpacity="0.28" />
            </linearGradient>
            <linearGradient id="fcg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0.0" stopColor="#7B3FE4" />
              <stop offset="0.3" stopColor="#4F46E5" />
              <stop offset="0.6" stopColor="#06B6D4" />
              <stop offset="1.0" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="site-container">
        <Header />
        <Hero />
        <Features />
        <AppSection selected={selected} setSelected={setSelected} />
        <Footer />
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createServerScout(payload: { userQuery: string; userId: string; email?: string; notificationFrequency: string }) {
  const res = await fetch("/api/scouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to create scout");
  return (await res.json()).scout;
}

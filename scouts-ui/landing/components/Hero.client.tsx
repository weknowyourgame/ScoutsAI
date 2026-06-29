"use client";

import { useEffect, useState } from "react";

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: "rotate(-45deg)" }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 8 16 12 12 16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

function Hero() {
  const [stars, setStars] = useState<string>("—");

  useEffect(() => {
    fetch("https://api.github.com/repos/legions-developer/invoicely")
      .then((r) => r.json())
      .then((d) => {
        if (d.stargazers_count !== undefined) {
          setStars(d.stargazers_count.toLocaleString());
        }
      })
      .catch(() => setStars("★"));
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg">
        <img src="/invoicely-masked-background.png" alt="Hero background" />
      </div>

      <div className="hero-content">
        {/* Star badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0 1.5rem",
          }}
        >
          <div className="star-pill">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#eab308"
              stroke="#eab308"
              strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span className="star-count">{stars}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div className="star-dot" />
            <div className="star-gradient-line" />
          </div>
        </div>

        {/* Headline */}
        <div className="hero-headline">
          <div>
            <span className="muted">Create </span>
            <span className="bright">Beautiful</span>
            <span className="muted"> Invoices</span>
          </div>
          <div>
            <span className="muted">Not </span>
            <span className="bright">Ugly</span>
            <span className="muted"> Ones</span>
          </div>
        </div>

        {/* CTAs */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            padding: "0 1.5rem",
          }}
        >
          <a href="#" className="btn btn-primary">
            <span>Get Started</span>
            <ArrowIcon />
          </a>
          <div style={{ position: "relative" }}>
            <a
              href="https://github.com/legions-developer/invoicely"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>Open Source</span>
              <GitHubIcon />
            </a>
            <span className="github-tooltip">
              Give Star <br /> please :3 <br /> for cookie
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero };

interface Feature {
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    title: "Beautiful",
    desc: "Professionally designed and visually appealing invoices can increase the chances of clients paying promptly.",
  },
  {
    title: "Free & Unlimited",
    desc: "Create and send as many invoices as you need — no limits, no hidden costs, just seamless billing freedom.",
  },
  {
    title: "Safe & Open Source",
    desc: "Your data stays yours — we never track, sell, or share it. Store everything locally or securely on our server — the choice is yours.",
  },
];

function Features() {
  return (
    <section className="features">
      {features.map((f, i) => (
        <div
          key={f.title}
          className="feature-card"
          style={i === features.length - 1 ? { borderBottom: "none" } : undefined}
        >
          <div className="feature-title">{f.title}</div>
          <div className="feature-desc">{f.desc}</div>
        </div>
      ))}
    </section>
  );
}

export { Features };

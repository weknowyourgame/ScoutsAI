function Sponsors() {
  return (
    <section>
      <div className="sponsors-header">
        <span className="fancy-badge">Our Sponsors</span>
      </div>

      {/* Vercel */}
      <div className="sponsor-row">
        <div className="sponsor-info" style={{ order: 1 }}>
          <div>
            <span className="sponsor-title">Vercel</span>
            <span className="sponsor-label">Open Source Program</span>
          </div>
          <p className="sponsor-desc">
            Vercel is a platform for building modern web applications. It
            provides a seamless development experience with a focus on
            performance and scalability. Vercel provides the developer tools and
            cloud infrastructure to build, scale, and secure a faster, more
            personalized web.
          </p>
        </div>
        <div className="sponsor-logo-cell border-right">
          <img
            className="sponsor-logo invert"
            src="https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png"
            alt="Vercel"
          />
        </div>
      </div>

      {/* NeonDB */}
      <div className="sponsor-row">
        <div className="sponsor-logo-cell">
          <img className="sponsor-logo" src="/neondb.svg" alt="NeonDB" />
        </div>
        <div className="sponsor-info">
          <div>
            <span className="sponsor-title">NeonDB</span>
            <span className="sponsor-label">Best Database Service</span>
          </div>
          <p className="sponsor-desc">
            NeonDB is a modern, open-source database that provides a seamless
            database. The database developers trust, on a serverless platform
            designed to help you build reliable and scalable applications faster.
          </p>
        </div>
      </div>

      {/* Cloudflare */}
      <div className="sponsor-row">
        <div className="sponsor-info" style={{ order: 1 }}>
          <div>
            <span className="sponsor-title">Cloudflare</span>
            <span className="sponsor-label">Open Source Program</span>
          </div>
          <p className="sponsor-desc">
            Cloudflare is a global CDN that provides a secure and fast way to
            deliver content to your users. Cloudflare make websites, apps, and
            networks faster and more secure. Our developer platform is the best
            place to build modern apps and deliver AI initiatives.
          </p>
        </div>
        <div className="sponsor-logo-cell border-right">
          <img
            className="sponsor-logo"
            src="https://www.cloudflare.com/img/logo-cloudflare-dark.svg"
            alt="Cloudflare"
          />
        </div>
      </div>

      {/* Your Company Here */}
      <div className="sponsor-row">
        <div className="sponsor-logo-cell">
          <div className="bg-dashed-pattern">
            <span className="placeholder-text" style={{ fontFamily: "var(--font-mono)" }}>
              Your Image Here
            </span>
          </div>
        </div>
        <div className="sponsor-info">
          <div>
            <span className="sponsor-title">Your Company Here</span>
            <span className="sponsor-label">Free Sponsor</span>
          </div>
          <p className="sponsor-desc">
            Invoicely is free for everyone—forever. If you&apos;d like to
            sponsor us with a service that benefits our platform and users,
            contact us below.
          </p>
          <div style={{ marginTop: "0.25rem" }}>
            <a href="mailto:admin@legions.dev" className="btn btn-white">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Sponsors };

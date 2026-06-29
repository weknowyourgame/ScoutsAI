import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoicely — Create Beautiful Invoices",
  description:
    "Create beautiful, professional invoices for free. No limits, no hidden costs. Open source and privacy-first.",
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&family=Geist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* No-flash theme script — reads localStorage before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export { RootLayout as default };

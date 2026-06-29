import { Header } from "../components/Header.client";
import { Hero } from "../components/Hero.client";
import { Features } from "../components/Features";
import { Sponsors } from "../components/Sponsors";
import { Footer } from "../components/Footer.client";

function Page() {
  return (
    <div className="site-container">
      <Header />
      <Hero />
      <Features />
      <Sponsors />
      <Footer />
    </div>
  );
}

export { Page as default };

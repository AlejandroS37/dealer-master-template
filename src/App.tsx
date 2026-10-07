import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import { dealerConfig } from "./config/dealerConfig";
import { structuredData } from "./lib/seo";
import { applyTheme } from "./config/themeConfig";
import { DealerProvider, useDealer } from "./lib/store";
import { Header, Footer } from "./components/Common";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import VehicleDetail from "./pages/VehicleDetail";
import Financing from "./pages/Financing";
import TradeIn from "./pages/TradeIn";
import About from "./pages/About";
import Contact from "./pages/Contact";
function RouteEffects() {
  const location = useLocation();
  const { vehicles } = useDealer();
  useEffect(() => {
    const vehicle = vehicles.find(
      (v) => location.pathname === `/inventory/${v.slug}`,
    );
    document.getElementById("dealer-structured-data")?.remove();
    const schema = structuredData(vehicle);
    if (schema) {
      const script = document.createElement("script");
      script.id = "dealer-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    document.querySelector('link[rel="canonical"]')?.remove();
    if (dealerConfig.siteURL) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = new URL(location.pathname, dealerConfig.siteURL).href;
      document.head.appendChild(link);
    }
    const page = location.pathname.split("/")[1] || "Home";
    document.title = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model} | ${dealerConfig.name}`
      : `${page.charAt(0).toUpperCase() + page.slice(1)} | ${dealerConfig.name}`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute(
      "content",
      vehicle
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}. ${vehicle.mileage.toLocaleString()} miles. Illustrative sample inventory.`
        : `${dealerConfig.name}: ${dealerConfig.heroSubtitle} Sample dealership platform demo.`,
    );
  }, [location.pathname, vehicles]);
  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
    } else {
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash]);
  return null;
}
export default function App() {
  useEffect(applyTheme, []);
  return (
    <DealerProvider>
      <BrowserRouter>
        <RouteEffects />
        <Header />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:slug" element={<VehicleDetail />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/trade-in" element={<TradeIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h1>This road doesn’t lead here.</h1>
                  <Link to="/inventory" className="button gold">
                    Explore inventory
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </DealerProvider>
  );
}

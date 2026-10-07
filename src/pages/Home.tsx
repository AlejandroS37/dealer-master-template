import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Gem,
  KeyRound,
} from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { reviews } from "../data/reviews";
import { useDealer } from "../lib/store";
import { Photo } from "../components/Common";
import { VehicleCard } from "../components/VehicleCard";
import { CinematicIntro as Intro } from "../components/CinematicIntro";
export function ReviewSection() {
  const [index, setIndex] = useState(0);
  const review = reviews[index];
  return (
    <section className="reviews section">
      <div className="section-top">
        <div>
          <span className="eyebrow">THE EXPERIENCE, IN THEIR WORDS</span>
          <h2>A higher standard.</h2>
        </div>
        {d.reviews.demo && <span className="demo-badge">DEMO REVIEWS</span>}
      </div>
      <div className="review-content" key={index}>
        <div className="stars" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: review.rating }, (_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>
        <blockquote>“{review.text}”</blockquote>
        <span>{review.name}</span>
        <small>{review.source}</small>
      </div>
      <div className="review-controls">
        <button
          className="icon-button"
          aria-label="Previous review"
          onClick={() =>
            setIndex((index + reviews.length - 1) % reviews.length)
          }
        >
          <ChevronLeft />
        </button>
        <span>
          {String(index + 1).padStart(2, "0")}{" "}
          <i>/ {String(reviews.length).padStart(2, "0")}</i>
        </span>
        <button
          className="icon-button"
          aria-label="Next review"
          onClick={() => setIndex((index + 1) % reviews.length)}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
export function AboutSection() {
  return (
    <section className="about-section section">
      <div className="about-image">
        <Photo
          src="/images/about.jpg"
          alt="Illustrative premium automotive showroom"
        />
        <span>A NEW PERSPECTIVE ON THE ROAD AHEAD.</span>
      </div>
      <div className="about-panel marble">
        <span className="eyebrow">THE {d.shortName} DIFFERENCE</span>
        <h2>{d.about.heading}</h2>
        <p>{d.about.copy}</p>
        <div className="trust-grid">
          {d.about.trust.map((text, i) => {
            const Icon = [ShieldCheck, Gem, KeyRound, Star][i % 4];
            return (
              <div key={text}>
                <Icon size={20} />
                <span>{text}</span>
              </div>
            );
          })}
        </div>
        <Link className="text-link" to="/about">
          Meet your next chapter <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export default function Home() {
  const { vehicles } = useDealer();
  return (
    <>
      <Intro />
      <section className="hero">
        <Photo
          src="/images/hero.jpg"
          alt="Silver sports coupe in a cinematic premium garage — concept photography"
          className="hero-image"
          eager
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="gold-line" /> CURATED CARS. ELEVATED EXPERIENCES.
          </span>
          <h1>
            {d.heroTitle.split(" ").slice(0, -1).join(" ")}
            <br />
            <em>{d.heroTitle.split(" ").slice(-1)}</em>
          </h1>
          <p>{d.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="button gold" to="/inventory">
              {d.cta.inventory} <ArrowUpRight size={17} />
            </Link>
            <Link className="button outlined" to="/financing">
              {d.cta.financing} <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#collection">
            Explore inventory <ArrowDown size={15} />
          </a>
          <span>EXCEPTIONAL VEHICLES. NO ORDINARY JOURNEY.</span>
          <span className="hero-index">
            01 <i>/ 03</i>
          </span>
        </div>
      </section>
      <div className="benefit-bar">
        <span>
          <ShieldCheck size={16} /> A carefully curated collection
        </span>
        <span>
          <KeyRound size={16} /> Your journey. Your terms.
        </span>
        <span>
          <Gem size={16} /> A higher standard, always
        </span>
      </div>
      <section id="collection" className="section collection">
        <div className="section-top">
          <div>
            <span className="eyebrow">EXCEPTIONAL BY SELECTION</span>
            <h2>
              The select collection<span className="gold-dot">.</span>
            </h2>
            <p>Standout vehicles. Ready for your next chapter.</p>
          </div>
          <Link className="text-link" to="/inventory">
            Explore all inventory <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="vehicle-grid featured-grid">
          {vehicles
            .filter((v) => v.featured)
            .slice(0, 3)
            .map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
        </div>
        <div className="collection-foot">
          {d.demoMode && (
            <span>
              Every vehicle shown is sample inventory. Photography is
              illustrative.
            </span>
          )}
          <span>
            {String(vehicles.length).padStart(2, "0")} POSSIBILITIES. ONE NEXT
            CHAPTER.
          </span>
        </div>
      </section>
      <section className="journey section">
        <span className="eyebrow">YOUR ROAD FORWARD</span>
        <h2>Make your next move.</h2>
        <div className="journey-grid">
          {[
            [
              "01",
              "Find your drive.",
              "Explore a collection that meets you where you are.",
              "/inventory",
              "Shop inventory",
            ],
            [
              "02",
              "Make it yours.",
              "Build a payment around the road you want to take.",
              "/financing",
              "Explore financing",
            ],
            [
              "03",
              "Move up.",
              "Bring your current vehicle into your next chapter.",
              "/trade-in",
              "Value your trade",
            ],
          ].map(([n, title, copy, path, cta]) => (
            <Link key={n} to={path}>
              <span className="step-num">{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="text-link">
                {cta} <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <AboutSection />
      <ReviewSection />
      <section className="closing section">
        <span className="eyebrow">THE ROAD AHEAD IS YOURS</span>
        <h2>
          READY TO <em>{d.shortName}?</em>
        </h2>
        <p>Find the vehicle that moves you forward.</p>
        <Link className="button gold" to="/contact">
          Let’s start a conversation <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}

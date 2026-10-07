import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, X, Menu, Heart } from "lucide-react";
import { dealerConfig as dealer } from "../config/dealerConfig";
import { manufacturerAssets } from "../config/themeConfig";
import { useDealer } from "../lib/store";
import type { Vehicle } from "../lib/types";
export function Brand({ large = false }: { large?: boolean }) {
  const crop = dealer.logo.crop;
  return (
    <span
      className={`brand ${dealer.logo.asset ? "brand-asset" : ""} ${large ? "brand-large" : ""}`}
      role="img"
      aria-label={dealer.name}
    >
      {dealer.logo.asset ? (
        <span
          className="brand-image-frame"
          style={
            {
              "--logo-frame-aspect":
                (crop.sourceAspect * crop.width) / crop.height,
              "--logo-image-width": `${10000 / crop.width}%`,
              "--logo-image-left": `${(-crop.left / crop.width) * 100}%`,
              "--logo-image-top": `${(-crop.top / crop.height) * 100}%`,
            } as React.CSSProperties
          }
        >
          <img src={dealer.logo.asset} alt="" decoding="async" />
        </span>
      ) : (
        <span>
          <strong>{dealer.logo.wordmark}</strong>
          <small>{dealer.logo.subtitle}</small>
        </span>
      )}
    </span>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.current?.getBoundingClientRect().height || 0}px`,
      );
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    update();
    return () => observer.disconnect();
  }, []);
  const { saved } = useDealer();
  useEffect(() => setOpen(false), [location.pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="header" ref={header}>
        <div className="header-top">
          <span className="header-note">A HIGHER STANDARD OF DRIVING</span>
          <Link to="/" aria-label={`${dealer.name} home`}>
            <Brand />
          </Link>
          <Link to="/inventory?saved=1" className="saved-link">
            <Heart size={15} /> <span>Saved</span>{" "}
            <b>{saved.length.toString().padStart(2, "0")}</b>
          </Link>
          <button
            className="mobile-menu icon-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav aria-label="Main navigation" className={open ? "nav open" : "nav"}>
          {[
            ["Inventory", "/inventory"],
            ["Financing", "/financing"],
            ["Trade-in", "/trade-in"],
            ["About", "/about"],
            ["Contact", "/contact"],
          ].map(([label, path]) => (
            <Link
              key={path}
              className={location.pathname.startsWith(path) ? "active" : ""}
              to={path}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <Link to="/">
          <Brand />
        </Link>
        <p>{dealer.tagline}</p>
        <Link to="/inventory">
          {dealer.cta.inventory} <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {dealer.name}{" "}
          {dealer.demoMode ? "· Template demo" : ""}
        </span>
        {dealer.demoMode && <span>{dealer.legal.demo}</span>}
        <Link to="/contact">Contact & privacy</Link>
        {dealer.socialLinks.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  eager = false,
  style,
}: {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed || !src ? (
    <div
      className={`photo-fallback ${className}`}
      role="img"
      aria-label={alt}
      style={style}
    >
      <ArrowUpRight size={32} />
      <small>Photography coming soon</small>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      srcSet={
        ["hero", "suv", "sedan", "coupe", "everyday", "interior", "about"].some(
          (name) => src === `/images/${name}.jpg`,
        )
          ? `${src.replace(".jpg", "-small.jpg")} 600w, ${src} 1600w`
          : undefined
      }
      sizes={
        eager
          ? "100vw"
          : "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 40vw"
      }
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export function MakeMark({ make }: { make: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [make]);
  return manufacturerAssets[make] && !failed ? (
    <img
      className="make-logo"
      src={manufacturerAssets[make]}
      alt={make}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="make-monogram" aria-hidden="true">
      {make
        .split(/[- ]/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const background = document.getElementById("root");
    const wasInert = background?.hasAttribute("inert");
    background?.setAttribute("inert", "");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          'button,a,input,select,textarea,[tabindex="0"]',
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = overflow;
      if (!wasInert) background?.removeAttribute("inert");
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal marble ${wide ? "modal-wide" : ""}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export function SaveButton({ vehicle }: { vehicle: Vehicle }) {
  const { saved, toggleSaved } = useDealer();
  return (
    <button
      className={`save-button ${saved.includes(vehicle.id) ? "is-saved" : ""}`}
      aria-label={`${saved.includes(vehicle.id) ? "Unsave" : "Save"} ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      aria-pressed={saved.includes(vehicle.id)}
      onClick={() => toggleSaved(vehicle.id)}
    >
      <Heart
        size={18}
        fill={saved.includes(vehicle.id) ? "currentColor" : "none"}
      />
    </button>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

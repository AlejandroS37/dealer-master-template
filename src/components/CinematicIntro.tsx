import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { Brand, Photo } from "./Common";
export function CinematicIntro() {
  const [visible, setVisible] = useState(() => {
    try {
      return (
        d.intro.enabled &&
        !sessionStorage.getItem("dealer-intro-seen") &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {
      return false;
    }
  });
  const [videoFailed, setVideoFailed] = useState(false);
  const logo = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const close = () => {
    setVisible(false);
    try {
      sessionStorage.setItem("dealer-intro-seen", "1");
    } catch {
      /* Optional browser storage. */
    }
  };
  useEffect(() => {
    if (!visible) return;
    const duration = Math.min(5000, Math.max(1000, d.intro.durationMs));
    skip.current?.focus({ preventScroll: true });
    const target = document.querySelector(".header .brand");
    const brand = logo.current?.querySelector(".brand");
    let animation: Animation | undefined;
    if (target && brand && logo.current) {
      const to = target.getBoundingClientRect(),
        from = brand.getBoundingClientRect();
      const dx = to.left + to.width / 2 - window.innerWidth / 2,
        dy = to.top + to.height / 2 - window.innerHeight / 2;
      animation = logo.current.animate(
        [
          {
            opacity: 0,
            transform: "translate(-50%, calc(-50% + 30px))",
            offset: 0,
          },
          {
            opacity: 0,
            transform: "translate(-50%, calc(-50% + 30px))",
            offset: 0.35,
          },
          { opacity: 1, transform: "translate(-50%, -50%)", offset: 0.5 },
          { opacity: 1, transform: "translate(-50%, -50%)", offset: 0.75 },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${to.width / from.width})`,
            offset: 1,
          },
        ],
        { duration, fill: "both", easing: "cubic-bezier(.22,1,.36,1)" },
      );
    }
    const timer = setTimeout(close, duration);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", close);
    return () => {
      clearTimeout(timer);
      animation?.cancel();
      motion.removeEventListener("change", close);
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <div
      className="intro-wrapper"
      style={
        {
          "--intro-duration": `${Math.min(5000, Math.max(1000, d.intro.durationMs))}ms`,
        } as React.CSSProperties
      }
      aria-label="Brand introduction"
    >
      <div className="cinematic">
        {d.intro.videoAvailable && !videoFailed ? (
          <video
            autoPlay
            muted
            playsInline
            preload="metadata"
            poster={d.intro.poster}
            onError={() => setVideoFailed(true)}
          >
            <source src={d.intro.videoURL} type="video/mp4" />
          </video>
        ) : (
          <Photo src={d.intro.poster} alt="Premium automotive concept" eager />
        )}
        <div className="smoke" />
        <span className="intro-caption">
          {!d.intro.videoAvailable || videoFailed
            ? "Static cinematic placeholder · "
            : ""}
          {d.name}
        </span>
      </div>
      <button ref={skip} className="intro-skip" onClick={close}>
        Skip intro <ArrowUpRight size={16} />
      </button>
      <div className="intro-brand" ref={logo}>
        <Brand large />
      </div>
    </div>
  );
}

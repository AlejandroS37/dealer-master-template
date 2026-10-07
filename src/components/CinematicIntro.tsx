import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { introStorageKey, shouldShowIntro } from "../lib/intro";
import { Brand } from "./Common";
export function CinematicIntro() {
  const storageKey = introStorageKey(d.id, d.intro.version);
  const [visible, setVisible] = useState(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {
      /* Session fallback below. */
    }
    try {
      seen =
        seen ||
        sessionStorage.getItem(storageKey) === "1" ||
        sessionStorage.getItem("dealer-intro-seen") === "1";
    } catch {
      /* Storage is optional. */
    }
    return shouldShowIntro({
      enabled: d.intro.enabled,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      replay: new URLSearchParams(location.search).get("replayIntro") === "1",
      seen,
    });
  });
  const [videoFailed, setVideoFailed] = useState(false),
    [videoPlaying, setVideoPlaying] = useState(false);
  const logo = useRef<HTMLDivElement>(null),
    skip = useRef<HTMLButtonElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const close = () => {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* Optional local persistence. */
    }
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* Optional session persistence. */
    }
    if (document.activeElement === skip.current)
      requestAnimationFrame(() =>
        document.getElementById("main")?.focus({ preventScroll: true }),
      );
  };
  const duration = Math.min(5000, Math.max(1000, d.intro.durationMs));
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skip.current?.focus({ preventScroll: true });
    const target = document.querySelector(".header .brand"),
      brand = logo.current?.querySelector(".brand");
    let animation: Animation | undefined;
    if (target && brand && logo.current) {
      const to = target.getBoundingClientRect(),
        from = brand.getBoundingClientRect();
      const dx = to.left + to.width / 2 - innerWidth / 2,
        dy = to.top + to.height / 2 - innerHeight / 2;
      animation = logo.current.animate(
        [
          {
            opacity: 0,
            transform: "translate(-50%, -48%) scale(.96)",
            offset: 0,
          },
          {
            opacity: 0,
            transform: "translate(-50%, -48%) scale(.96)",
            offset: 0.53,
            easing: "ease-out",
          },
          {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1)",
            offset: 0.59,
          },
          {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1)",
            offset: 0.82,
            easing: "cubic-bezier(.22,1,.36,1)",
          },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) translate(${dx}px,${dy}px) scale(${to.width / from.width})`,
            offset: 1,
          },
        ],
        { duration, fill: "both", easing: "linear" },
      );
    }
    // This deadline is independent of video events: failed playback can never block shopping.
    const timeout = setTimeout(close, duration);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", close);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", keydown);
    return () => {
      clearTimeout(timeout);
      animation?.cancel();
      document.body.style.overflow = previousOverflow;
      motion.removeEventListener("change", close);
      document.removeEventListener("keydown", keydown);
    };
  }, [visible, duration]);
  useEffect(() => {
    if (visible && d.intro.videoAvailable && !videoFailed && video.current) {
      const player = video.current;
      player.playbackRate = d.intro.playbackRate;
      player.play().catch(() => setVideoFailed(true));
    }
  }, [visible, videoFailed]);
  if (!visible) return null;
  return (
    <div
      className="intro-wrapper"
      aria-label="Brand introduction"
      data-video-state={
        videoFailed ? "fallback" : videoPlaying ? "playing" : "loading"
      }
      style={
        {
          "--intro-duration": `${duration}ms`,
          "--intro-smoke-image": `url(${JSON.stringify(d.intro.scenes.smoke)})`,
        } as React.CSSProperties
      }
    >
      <div className="cinematic" aria-hidden="true">
        <div className="intro-scene intro-open">
          <img src={d.intro.scenes.doorsOpen} alt="" fetchPriority="high" />
          {d.intro.videoAvailable && !videoFailed && (
            <video
              ref={video}
              className={`intro-video ${videoPlaying ? "is-playing" : ""}`}
              autoPlay
              muted
              playsInline
              preload="metadata"
              poster={d.intro.poster}
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = d.intro.playbackRate;
              }}
              onPlaying={() => setVideoPlaying(true)}
              onError={() => setVideoFailed(true)}
            >
              <source src={d.intro.videoURL} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="intro-scene intro-closed">
          <img src={d.intro.scenes.doorsClosed} alt="" />
        </div>
        <div className="intro-scene intro-burnout">
          <img src={d.intro.scenes.burnout} alt="" />
          <span className="taillight taillight-left" />
          <span className="taillight taillight-right" />
        </div>
        <div className="intro-scene intro-smoke">
          <img src={d.intro.scenes.smoke} alt="" />
          <div className="smoke-depth" />
        </div>
        <div className="intro-logo-veil" />
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

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Photo, Modal } from "./Common";
export function Gallery({
  images: rawImages,
  title,
  demo = false,
}: {
  images: string[];
  title: string;
  demo?: boolean;
}) {
  const images = rawImages.length ? rawImages : [""];
  const [index, setIndex] = useState(0),
    [full, setFull] = useState(false);
  const main = useRef<HTMLDivElement>(null),
    touch = useRef<number | undefined>(undefined);
  const activeAnimation = useRef<Animation | null>(null);
  const activeClone = useRef<HTMLImageElement | null>(null);
  useEffect(
    () => () => {
      activeAnimation.current?.cancel();
      activeClone.current?.remove();
    },
    [],
  );
  const choose = (next: number, source?: HTMLElement) => {
    activeAnimation.current?.cancel();
    activeClone.current?.remove();
    if (next === index) return;
    if (
      source &&
      main.current &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const from = source.getBoundingClientRect(),
        to = main.current.getBoundingClientRect();
      const clone = source.querySelector("img")?.cloneNode(true) as
        HTMLImageElement | undefined;
      if (clone) {
        Object.assign(clone.style, {
          position: "fixed",
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          objectFit: "contain",
          zIndex: "90",
          pointerEvents: "none",
          background: "#15191a",
        });
        document.body.appendChild(clone);
        activeClone.current = clone;
        const anim = clone.animate(
          [
            {
              transform: "translate(0,0)",
              width: `${from.width}px`,
              height: `${from.height}px`,
            },
            {
              transform: `translate(${to.left - from.left}px, ${to.top - from.top}px)`,
              width: `${to.width}px`,
              height: `${to.height}px`,
            },
          ],
          { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        activeAnimation.current = anim;
        anim.oncancel = () => clone.remove();
        anim.onfinish = () => {
          setIndex(next);
          clone.remove();
        };
        return;
      }
    }
    setIndex(next);
  };
  const move = (delta: number) =>
    choose((index + delta + images.length) % images.length);
  return (
    <div className="gallery">
      <div
        className="gallery-main"
        ref={main}
        style={{ viewTransitionName: "vehicle-photo" }}
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touch.current !== undefined) {
            const delta = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
            touch.current = undefined;
          }
        }}
      >
        <Photo
          src={images[index]}
          alt={`${title}, image ${index + 1}${demo ? ", illustrative demo photography" : ""}`}
          eager
        />
        <button
          className="gallery-prev icon-button"
          aria-label="Previous image"
          onClick={() => move(-1)}
        >
          <ChevronLeft />
        </button>
        <button
          className="gallery-next icon-button"
          aria-label="Next image"
          onClick={() => move(1)}
        >
          <ChevronRight />
        </button>
        <button
          className="gallery-expand icon-button"
          aria-label="Open fullscreen gallery"
          onClick={() => setFull(true)}
        >
          <Maximize2 size={19} />
        </button>
        <span className="gallery-counter">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
      </div>
      <div className="thumbnails">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className={i === index ? "selected" : ""}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={i === index}
            onClick={(e) => choose(i, e.currentTarget)}
          >
            <Photo src={src} alt="" />
          </button>
        ))}
      </div>
      {full && (
        <Modal title={title} wide onClose={() => setFull(false)}>
          <div className="fullscreen-photo">
            <Photo src={images[index]} alt={`${title}, image ${index + 1}`} />
          </div>
          <div className="fullscreen-controls">
            <button className="button dark" onClick={() => move(-1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span>
              {index + 1} / {images.length}
            </span>
            <button className="button dark" onClick={() => move(1)}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

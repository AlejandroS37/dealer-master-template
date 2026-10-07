/** Decorative shared element, removed when complete. The real accessible element remains in place. */
export function riseTo(source: HTMLElement, targetSelector: string) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const from = source.getBoundingClientRect();
  requestAnimationFrame(() => {
    const target = document.querySelector(targetSelector) as HTMLElement | null;
    if (!target) return;
    const to = target.getBoundingClientRect();
    const clone = source.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, {
      position: "fixed",
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      zIndex: "60",
      pointerEvents: "none",
      margin: "0",
    });
    document.body.appendChild(clone);
    const motion = clone.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        {
          transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width})`,
          opacity: 0.2,
        },
      ],
      { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    motion.onfinish = () => clone.remove();
    motion.oncancel = () => clone.remove();
  });
}

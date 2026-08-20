import { useEffect, useRef } from "react";
import { CONFIG } from "../config.ts";
import { hasPointer, mod, reduceMotion } from "../env.ts";

const N = CONFIG.nameLines.length;
const frontFaceAt = (a: number) => mod(-a / 90, 4);

function lineHTML(text: string) {
  const safe = document.createElement("div");
  safe.textContent = text;
  const html = safe.innerHTML;
  return text === CONFIG.nameLines[0] ? html + `<span class="tick">_</span>` : html;
}

export function NamePrism({
  paused,
  onOpenAbout,
}: {
  paused: boolean;
  onOpenAbout: () => void;
}) {
  const blockRef = useRef<HTMLButtonElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const st = useRef({
    angle: 0,
    line: 0,
    hover: false,
    dragging: false,
    suppressClick: false,
  });

  useEffect(() => {
    const prism = prismRef.current!;
    const block = blockRef.current!;
    const faces = Array.from(
      prism.querySelectorAll<HTMLSpanElement>(".prism-face .pf-text")
    );
    const s = st.current;

    const seedFaces = (a: number, line: number) => {
      const fk = frontFaceAt(Math.round(a / 90) * 90);
      for (let i = 0; i < 4; i++) {
        faces[mod(fk + i, 4)].innerHTML = lineHTML(CONFIG.nameLines[mod(line + i, N)]);
      }
    };
    seedFaces(0, 0);

    const cycle = () => {
      if (pausedRef.current || s.hover || s.dragging || document.hidden) return;
      const next = mod(s.line + 1, N);
      if (reduceMotion) {
        faces[frontFaceAt(s.angle)].innerHTML = lineHTML(CONFIG.nameLines[next]);
        s.line = next;
        return;
      }
      s.angle -= 90;
      const fk = frontFaceAt(s.angle);
      faces[fk].innerHTML = lineHTML(CONFIG.nameLines[next]);
      faces[mod(fk + 1, 4)].innerHTML = lineHTML(CONFIG.nameLines[mod(next + 1, N)]);
      prism.style.setProperty("--a", s.angle + "deg");
      s.line = next;
    };
    const timer = setInterval(cycle, CONFIG.cycleMs);

    const onEnter = () => (s.hover = true);
    const onLeave = () => (s.hover = false);
    block.addEventListener("mouseenter", onEnter);
    block.addEventListener("mouseleave", onLeave);

    let start: { y: number; angle: number; line: number; moved: boolean } | null = null;

    const onDown = (e: PointerEvent) => {
      if (!hasPointer || reduceMotion) return;
      start = { y: e.clientY, angle: s.angle, line: s.line, moved: false };
      s.dragging = true;
      block.setPointerCapture(e.pointerId);
      prism.classList.add("dragging");
      seedFaces(s.angle, s.line);
    };
    const onMove = (e: PointerEvent) => {
      if (!start) return;
      const dy = e.clientY - start.y;
      if (Math.abs(dy) > 5) start.moved = true;
      const preview = start.angle - dy * CONFIG.motion.prismDragFactor;
      prism.style.setProperty("--a", preview.toFixed(1) + "deg");
      const steps = Math.round((start.angle - preview) / 90);
      const fk = frontFaceAt(start.angle - steps * 90);
      faces[fk].innerHTML = lineHTML(CONFIG.nameLines[mod(start.line + steps, N)]);
      faces[mod(fk + 1, 4)].innerHTML = lineHTML(CONFIG.nameLines[mod(start.line + steps + 1, N)]);
      faces[mod(fk + 3, 4)].innerHTML = lineHTML(CONFIG.nameLines[mod(start.line + steps - 1, N)]);
    };
    const onUp = (e: PointerEvent) => {
      if (!start) return;
      const dy = e.clientY - start.y;
      const preview = start.angle - dy * CONFIG.motion.prismDragFactor;
      const snapped = Math.round(preview / 90) * 90;
      const steps = Math.round((start.angle - snapped) / 90);
      s.angle = snapped;
      s.line = mod(start.line + steps, N);
      prism.classList.remove("dragging");
      prism.style.setProperty("--a", s.angle + "deg");
      seedFaces(s.angle, s.line);
      s.suppressClick = start.moved;
      start = null;
      setTimeout(() => (s.dragging = false), 350);
    };
    block.addEventListener("pointerdown", onDown);
    block.addEventListener("pointermove", onMove);
    block.addEventListener("pointerup", onUp);
    block.addEventListener("pointercancel", onUp);

    return () => {
      clearInterval(timer);
      block.removeEventListener("mouseenter", onEnter);
      block.removeEventListener("mouseleave", onLeave);
      block.removeEventListener("pointerdown", onDown);
      block.removeEventListener("pointermove", onMove);
      block.removeEventListener("pointerup", onUp);
      block.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const handleClick = () => {
    if (st.current.suppressClick) {
      st.current.suppressClick = false;
      return;
    }
    onOpenAbout();
  };

  return (
    <button
      className="block name-block"
      ref={blockRef}
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-label={`About ${CONFIG.about.heading}`}
    >
      <div className="shadow" aria-hidden="true" />
      <div className="name-prism" ref={prismRef}>
        <div className="prism-cap left" aria-hidden="true" />
        <div className="prism-cap right" aria-hidden="true" />
        {[0, 1, 2, 3].map((k) => (
          <div className="prism-face" data-k={k} key={k}>
            <span className="pf-text" />
            <span className="pf-hint">{"// about"}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

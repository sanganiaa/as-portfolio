import { useEffect, useRef } from "react";
import { CONFIG, type LinkItem } from "../config.ts";
import { hasPointer, reduceMotion } from "../env.ts";

export function LinkCube({
  link,
  index,
  total,
}: {
  link: LinkItem;
  index: number;
  total: number;
}) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  /* shelf angle: outer cubes angle inward more */
  const ry0 = (((total - 1) / 2 - index) * 11).toFixed(1) + "deg";

  /* grab + spring-back drag (the whole block moves, satellites get
     nudged out of the way because colliders are read live) */
  useEffect(() => {
    if (!hasPointer || reduceMotion) return;
    const root = rootRef.current!;
    const M = CONFIG.motion;

    const off = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let grab: { x: number; y: number; ox: number; oy: number } | null = null;
    let raf = 0;

    const write = () => {
      root.style.setProperty("--ox", off.x.toFixed(1) + "px");
      root.style.setProperty("--oy", off.y.toFixed(1) + "px");
    };

    const spring = () => {
      vel.x += -M.blockSpring * off.x;
      vel.y += -M.blockSpring * off.y;
      vel.x *= M.blockSpringDamping;
      vel.y *= M.blockSpringDamping;
      off.x += vel.x;
      off.y += vel.y;
      write();
      if (Math.hypot(off.x, off.y) > 0.3 || Math.hypot(vel.x, vel.y) > 0.3) {
        raf = requestAnimationFrame(spring);
      } else {
        off.x = 0; off.y = 0; write();
      }
    };

    const onDown = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      grab = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
      movedRef.current = false;
      root.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!grab) return;
      let nx = grab.ox + (e.clientX - grab.x);
      let ny = grab.oy + (e.clientY - grab.y);
      const d = Math.hypot(nx, ny);
      if (d > M.blockDragRadius) {
        nx *= M.blockDragRadius / d;
        ny *= M.blockDragRadius / d;
      }
      if (Math.abs(e.clientX - grab.x) + Math.abs(e.clientY - grab.y) > 6) movedRef.current = true;
      vel.x = nx - off.x;
      vel.y = ny - off.y;
      off.x = nx;
      off.y = ny;
      write();
    };
    const onUp = () => {
      if (!grab) return;
      grab = null;
      raf = requestAnimationFrame(spring);
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const navigate = () => {
    if (link.newTab) window.open(link.url, "_blank", "noopener");
    else window.location.href = link.url;
  };

  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // native behavior
    e.preventDefault();
    if (movedRef.current) {
      movedRef.current = false; // it was a drag, not a click
      return;
    }
    const cube = cubeRef.current!;
    if (reduceMotion) { navigate(); return; }
    if (cube.classList.contains("flipped")) return;
    cube.classList.add("flipped");
    setTimeout(() => {
      navigate();
      setTimeout(() => cube.classList.remove("flipped"), 600);
    }, CONFIG.motion.flipNavDelayMs);
  };

  return (
    <a
      className="block cube-block"
      ref={rootRef}
      href={link.url}
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      aria-label={link.label}
      onClick={onClick}
    >
      <div className="shadow" aria-hidden="true" />
      <div className="cube" ref={cubeRef} style={{ ["--ry0" as string]: ry0 }}>
        <div className="edge top" aria-hidden="true" />
        <div className="edge left" aria-hidden="true" />
        <div className="edge right" aria-hidden="true" />
        <div className="face-front" dangerouslySetInnerHTML={{ __html: link.svg }} />
        <div className="face-label">{link.label}</div>
      </div>
    </a>
  );
}

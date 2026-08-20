import { useEffect, type RefObject } from "react";
import { CONFIG } from "../config.ts";
import { hasPointer, reduceMotion } from "../env.ts";

export function useSceneLoop(refs: {
  sceneWrapRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLDivElement | null>;
  lightRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const sceneWrap = refs.sceneWrapRef.current;
    const scene = refs.sceneRef.current;
    const light = refs.lightRef.current;
    if (!sceneWrap || !scene || !light) return;

    /* ---- main loop ---- */
    let raf = 0;
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const smooth = { x: mouse.x, y: mouse.y };
    const lastSmooth = { x: mouse.x, y: mouse.y };
    const mainBlocks = Array.from(document.querySelectorAll<HTMLElement>(".main-stack .block"));

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    if (hasPointer && !reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const frame = () => {
        smooth.x += (mouse.x - smooth.x) * 0.12;
        smooth.y += (mouse.y - smooth.y) * 0.12;

        const nx = smooth.x / innerWidth - 0.5;
        const ny = smooth.y / innerHeight - 0.5;
        const M = CONFIG.motion;

        scene.style.transform = `rotateX(${(M.baseTiltDeg - ny * M.parallaxDeg).toFixed(3)}deg) rotateY(${(nx * M.parallaxDeg).toFixed(3)}deg)`;
        light.style.transform = `translate(${smooth.x}px, ${smooth.y}px)`;

        /* main blocks: light, glow, shadow, depth push, tilt; collect colliders */
        const colliders: DOMRect[] = [];
        for (const el of mainBlocks) {
          const r = el.getBoundingClientRect();
          colliders.push(r);
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;

          el.style.setProperty("--lx", (((smooth.x - r.left) / r.width) * 100).toFixed(1) + "%");
          el.style.setProperty("--ly", (((smooth.y - r.top) / r.height) * 100).toFixed(1) + "%");

          const dist = Math.hypot(smooth.x - cx, smooth.y - cy);
          const near = Math.max(0, 1 - dist / 420);
          el.style.setProperty("--glow", (near * near).toFixed(3));
          el.style.setProperty("--sx", (((cx - smooth.x) / 420) * 26).toFixed(1) + "px");
          el.style.setProperty("--sy", ((((cy - smooth.y) / 420) * 26) + 12).toFixed(1) + "px");

          const push = near * near * M.depthPush;
          el.style.transform = `translate(var(--ox, 0px), var(--oy, 0px)) translateZ(${push.toFixed(1)}px)`;

          if (el.classList.contains("cube-block")) {
            const cube = el.querySelector<HTMLElement>(".cube")!;
            const reach = Math.max(0, 1 - dist / 380);
            const cl = (v: number) => Math.max(-1.6, Math.min(1.6, v));
            const ox = cl((smooth.x - cx) / (r.width / 2));
            const oy = cl((smooth.y - cy) / (r.height / 2));
            cube.style.setProperty("--ty", (ox * M.hoverTiltDeg * reach).toFixed(2) + "deg");
            cube.style.setProperty("--tx", (-oy * M.hoverTiltDeg * reach).toFixed(2) + "deg");
          }
        }

        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    } else {
      light.style.display = "none";
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);
}

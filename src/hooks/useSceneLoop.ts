import { useEffect, type RefObject } from "react";
import { CONFIG } from "../config.ts";
import { hasPointer, rand, reduceMotion, satEnabled } from "../env.ts";

const PERSPECTIVE = 1200; // must match .scene-wrap perspective

interface Sat {
  el: HTMLDivElement;
  inner: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  scale: number;
  size: number;
  r: number;
  mass: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  wx: number;
  wy: number;
  glow: number;
  dragging: boolean;
  moved: boolean;
}

export function useSceneLoop(refs: {
  sceneWrapRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLDivElement | null>;
  lightRef: RefObject<HTMLDivElement | null>;
  satFieldRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const sceneWrap = refs.sceneWrapRef.current;
    const scene = refs.sceneRef.current;
    const light = refs.lightRef.current;
    const satField = refs.satFieldRef.current;
    if (!sceneWrap || !scene || !light || !satField) return;

    const S = CONFIG.satellites;
    const sats: Sat[] = [];

    /* ---- build the satellite mini-cubes ---- */
    if (satEnabled) {
      const W = innerWidth,
        H = innerHeight;
      let attempts = 0;
      while (sats.length < S.count && attempts < S.count * 60) {
        attempts++;
        const z = -rand(S.depthMin, S.depthMax);
        const depthT = (-z - S.depthMin) / (S.depthMax - S.depthMin);
        const scale = PERSPECTIVE / (PERSPECTIVE - z);
        const size = rand(S.sizeMin, S.sizeMax) * (1 - depthT * 0.25);
        const r = size * 0.75;

        const halfW = W / 2 / scale + 40;
        const halfH = H / 2 / scale + 40;
        const x = W / 2 + rand(-halfW + r, halfW - r);
        const y = H / 2 + rand(-halfH + r, halfH - r);

        let overlaps = false;
        for (const o of sats) {
          if (Math.hypot(x - o.x, y - o.y, z - o.z) < r + o.r + 6) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) continue;

        const dim = 1 - depthT * 0.5;
        const el = document.createElement("div");
        el.className = "sat";
        el.style.setProperty("--s", size.toFixed(0) + "px");
        el.style.setProperty("--hs", (size / 2).toFixed(1) + "px");
        el.style.setProperty("--dim", dim.toFixed(2));

        const v1 = Math.round(26 * dim + 8);
        const v2 = Math.round(15 * dim + 6);
        const vt = Math.round(36 * dim + 10);
        el.style.setProperty("--c1", `rgb(${v1}, ${v1}, ${v1 + 12})`);
        el.style.setProperty("--c2", `rgb(${v2}, ${v2}, ${v2 + 9})`);
        el.style.setProperty("--ct", `rgb(${vt}, ${vt}, ${vt + 14})`);

        el.innerHTML = `
          <div class="sat-spin">
            <div class="sf f"></div><div class="sf bk"></div>
            <div class="sf l"></div><div class="sf r"></div>
            <div class="sf t"></div><div class="sf b"></div>
          </div>`;

        const sat: Sat = {
          el,
          inner: el.querySelector(".sat-spin")!,
          x,
          y,
          z,
          scale,
          size,
          r,
          mass: size * size,
          vx: rand(-S.drift, S.drift),
          vy: rand(-S.drift, S.drift),
          rx: rand(0, 360),
          ry: rand(0, 360),
          wx: rand(-1, 1) * S.spinIdle * 2 || S.spinIdle,
          wy: rand(-1, 1) * S.spinIdle * 2 || -S.spinIdle,
          glow: 0,
          dragging: false,
          moved: false,
        };

        el.addEventListener("click", (e) => {
          if (sat.moved || reduceMotion) return;
          if (S.clickSpin) {
            sat.wx += rand(-12, 12);
            sat.wy += rand(-12, 12);
          }
          applyRipple(e.clientX, e.clientY, S.rippleStrength, sat);
        });

        if (S.draggable && hasPointer && !reduceMotion) {
          let grab: { x: number; y: number; cx: number; cy: number } | null = null;
          el.addEventListener("pointerdown", (e) => {
            grab = { x: e.clientX, y: e.clientY, cx: sat.x, cy: sat.y };
            sat.dragging = true;
            sat.moved = false;
            sat.vx = 0;
            sat.vy = 0;
            el.setPointerCapture(e.pointerId);
          });
          el.addEventListener("pointermove", (e) => {
            if (!grab) return;
            const nx = grab.cx + (e.clientX - grab.x) / sat.scale;
            const ny = grab.cy + (e.clientY - grab.y) / sat.scale;
            if (Math.abs(e.clientX - grab.x) + Math.abs(e.clientY - grab.y) > 6) sat.moved = true;
            sat.vx = (nx - sat.x) * 0.8;
            sat.vy = (ny - sat.y) * 0.8;
            sat.wx += sat.vy * 0.3;
            sat.wy += sat.vx * 0.3;
            sat.x = nx;
            sat.y = ny;
          });
          const release = () => {
            grab = null;
            sat.dragging = false;
          };
          el.addEventListener("pointerup", release);
          el.addEventListener("pointercancel", release);
        }

        satField.appendChild(el);
        sats.push(sat);
      }

      for (const c of sats) {
        c.el.style.transform = `translate3d(${(c.x - c.size / 2).toFixed(1)}px, ${(c.y - c.size / 2).toFixed(1)}px, ${c.z}px)`;
        c.inner.style.transform = `rotateX(${c.rx.toFixed(1)}deg) rotateY(${c.ry.toFixed(1)}deg)`;
      }
    }

    /* shockwave: shove + spin every satellite away from a screen point */
    function applyRipple(sxPt: number, syPt: number, strength: number, except: Sat | null = null) {
      for (const c of sats) {
        if (c === except || c.dragging) continue;
        const wx = innerWidth / 2 + (sxPt - innerWidth / 2) / c.scale;
        const wy = innerHeight / 2 + (syPt - innerHeight / 2) / c.scale;
        const dx = c.x - wx,
          dy = c.y - wy;
        const dist = Math.hypot(dx, dy) || 1;
        const fall = Math.max(0, 1 - dist / (560 / c.scale));
        const imp = strength * fall * fall;
        c.vx += (dx / dist) * imp;
        c.vy += (dy / dist) * imp;
        c.wx += (Math.random() - 0.5) * imp;
        c.wy += (Math.random() - 0.5) * imp;
      }
    }

    const onEmptyClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".block") || t.closest(".sat")) return;
      applyRipple(e.clientX, e.clientY, S.rippleStrength);
    };
    if (satEnabled && !reduceMotion) sceneWrap.addEventListener("click", onEmptyClick);

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

        /* satellites: drift, stir, tumble, collide */
        const W = innerWidth,
          H = innerHeight;
        const cvx = smooth.x - lastSmooth.x;
        const cvy = smooth.y - lastSmooth.y;
        lastSmooth.x = smooth.x;
        lastSmooth.y = smooth.y;

        for (const c of sats) {
          const cwx = W / 2 + (smooth.x - W / 2) / c.scale;
          const cwy = H / 2 + (smooth.y - H / 2) / c.scale;
          const dx = c.x - cwx;
          const dy = c.y - cwy;
          const dist = Math.hypot(dx, dy) || 1;
          const near = Math.max(0, 1 - dist / (280 / c.scale));

          if (!c.dragging) {
            const f = near * near * S.pushForce;
            c.vx += (dx / dist) * f;
            c.vy += (dy / dist) * f;
            c.vx += (near * cvx * S.stirForce) / c.scale;
            c.vy += (near * cvy * S.stirForce) / c.scale;
            c.wx += near * cvy * 0.04;
            c.wy += near * cvx * 0.04;

            c.vx *= S.damping;
            c.vy *= S.damping;
            const sp = Math.hypot(c.vx, c.vy);
            if (sp > S.maxSpeed) {
              c.vx *= S.maxSpeed / sp;
              c.vy *= S.maxSpeed / sp;
            }
            c.x += c.vx;
            c.y += c.vy;

            const halfW = W / 2 / c.scale + 60;
            const halfH = H / 2 / c.scale + 60;
            if (c.x < W / 2 - halfW + c.r) { c.x = W / 2 - halfW + c.r; c.vx = Math.abs(c.vx) * S.restitution; }
            if (c.x > W / 2 + halfW - c.r) { c.x = W / 2 + halfW - c.r; c.vx = -Math.abs(c.vx) * S.restitution; }
            if (c.y < H / 2 - halfH + c.r) { c.y = H / 2 - halfH + c.r; c.vy = Math.abs(c.vy) * S.restitution; }
            if (c.y > H / 2 + halfH - c.r) { c.y = H / 2 + halfH - c.r; c.vy = -Math.abs(c.vy) * S.restitution; }

            if (S.blockCollide) {
              for (const b of colliders) {
                const pl = W / 2 + (b.left - W / 2) / c.scale;
                const pr = W / 2 + (b.right - W / 2) / c.scale;
                const pt = H / 2 + (b.top - H / 2) / c.scale;
                const pb = H / 2 + (b.bottom - H / 2) / c.scale;
                const qx = Math.max(pl, Math.min(c.x, pr));
                const qy = Math.max(pt, Math.min(c.y, pb));
                let ddx = c.x - qx,
                  ddy = c.y - qy;
                let d = Math.hypot(ddx, ddy);
                if (d === 0) {
                  const exits = [c.x - pl, pr - c.x, c.y - pt, pb - c.y];
                  const m = Math.min(...exits);
                  if (m === exits[0]) { ddx = -1; ddy = 0; }
                  else if (m === exits[1]) { ddx = 1; ddy = 0; }
                  else if (m === exits[2]) { ddx = 0; ddy = -1; }
                  else { ddx = 0; ddy = 1; }
                  d = 1;
                  c.x = qx + ddx * (m + c.r);
                  c.y = qy + ddy * (m + c.r);
                }
                if (d < c.r) {
                  const nx2 = ddx / d,
                    ny2 = ddy / d;
                  c.x = qx + nx2 * c.r;
                  c.y = qy + ny2 * c.r;
                  const vn = c.vx * nx2 + c.vy * ny2;
                  if (vn < 0) {
                    c.vx -= (1 + S.restitution) * vn * nx2;
                    c.vy -= (1 + S.restitution) * vn * ny2;
                    c.wx += (Math.random() - 0.5) * Math.min(Math.abs(vn) * 2, 8);
                    c.wy += (Math.random() - 0.5) * Math.min(Math.abs(vn) * 2, 8);
                  }
                }
              }
            }
          }

          /* tumble with a floor so they never fully stop */
          c.wx *= 0.985;
          c.wy *= 0.985;
          if (Math.abs(c.wx) + Math.abs(c.wy) < S.spinIdle) {
            c.wx += (c.wx >= 0 ? 1 : -1) * 0.01;
            c.wy += (c.wy >= 0 ? 1 : -1) * 0.01;
          }
          c.rx += c.wx;
          c.ry += c.wy;

          const glow = near * near;
          if (Math.abs(glow - c.glow) > 0.03) {
            c.glow = glow;
            c.el.style.setProperty("--glow", glow.toFixed(2));
          }
        }

        /* sat ↔ sat collisions (depth-aware) */
        for (let i = 0; i < sats.length; i++) {
          const a = sats[i];
          for (let j = i + 1; j < sats.length; j++) {
            const b = sats[j];
            const dz = a.z - b.z;
            const rr = a.r + b.r;
            if (dz > rr || dz < -rr) continue;
            const dx = b.x - a.x;
            if (dx > rr || dx < -rr) continue;
            const dy = b.y - a.y;
            if (dy > rr || dy < -rr) continue;
            const d = Math.hypot(dx, dy, dz);
            if (d === 0 || d >= rr) continue;

            const nx2 = dx / d,
              ny2 = dy / d;
            const overlap = (rr - d) * 0.5;
            if (!a.dragging) { a.x -= nx2 * overlap; a.y -= ny2 * overlap; }
            if (!b.dragging) { b.x += nx2 * overlap; b.y += ny2 * overlap; }

            const rvx = b.vx - a.vx,
              rvy = b.vy - a.vy;
            const vn = rvx * nx2 + rvy * ny2;
            if (vn < 0) {
              const m = a.mass + b.mass;
              const imp = -(1 + S.restitution) * vn;
              if (!a.dragging) { a.vx -= nx2 * imp * (b.mass / m); a.vy -= ny2 * imp * (b.mass / m); }
              if (!b.dragging) { b.vx += nx2 * imp * (a.mass / m); b.vy += ny2 * imp * (a.mass / m); }
              const spin = Math.min(Math.abs(vn) * 1.4, 8);
              a.wx += (Math.random() - 0.5) * spin;
              a.wy += (Math.random() - 0.5) * spin;
              b.wx += (Math.random() - 0.5) * spin;
              b.wy += (Math.random() - 0.5) * spin;
            }
          }
        }

        for (const c of sats) {
          c.el.style.transform = `translate3d(${(c.x - c.size / 2).toFixed(1)}px, ${(c.y - c.size / 2).toFixed(1)}px, ${c.z}px)`;
          c.inner.style.transform = `rotateX(${c.rx.toFixed(1)}deg) rotateY(${c.ry.toFixed(1)}deg)`;
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
      sceneWrap.removeEventListener("click", onEmptyClick);
      satField.innerHTML = "";
    };
  }, []);
}

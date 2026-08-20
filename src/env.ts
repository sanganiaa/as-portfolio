export const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasPointer =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;

export const satEnabled =
  typeof window !== "undefined" &&
  !window.matchMedia("(max-width: 560px)").matches;

export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
export const mod = (n: number, m: number) => ((n % m) + m) % m;

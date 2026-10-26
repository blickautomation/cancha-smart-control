export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Easing/duration shared between GSAP timelines and CSS transitions so both feel like one system. */
export const EASE = {
  out: "power2.out",
  bounce: "back.out(1.4)",
  snap: "expo.out",
} as const;

export const DURATION = {
  fast: 0.25,
  base: 0.4,
  slow: 0.7,
} as const;

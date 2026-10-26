"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

export function LoginReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // gsap.context + revert() (not just kill()) so React 19 dev's double-invoked
    // effect doesn't leave the element stuck at its "from" styles.
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 18,
        scale: 0.98,
        duration: 0.7,
        ease: "expo.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

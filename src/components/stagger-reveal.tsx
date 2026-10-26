"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

export function StaggerReveal({
  children,
  className,
  as = "grid",
}: {
  children: ReactNode;
  className?: string;
  /** Tag to render — "tbody" lets this wrap table rows. */
  as?: "grid" | "tbody";
}) {
  const ref = useRef<HTMLDivElement & HTMLTableSectionElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(Array.from(el.children), {
        opacity: 0,
        y: 16,
        scale: 0.97,
        duration: 0.5,
        stagger: { each: 0.06, from: "start" },
        ease: "back.out(1.4)",
      });
    });

    return () => ctx.revert();
  }, []);

  if (as === "tbody") {
    return (
      <tbody ref={ref} className={cn(className)}>
        {children}
      </tbody>
    );
  }

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

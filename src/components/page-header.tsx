"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export function PageHeader({
  eyebrow,
  title,
  description,
  titleClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  titleClassName?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el || prefersReducedMotion()) return;

    const split = new SplitText(el, { type: "chars" });
    const ctx = gsap.context(() => {
      gsap.from(split.chars, {
        opacity: 0,
        y: 14,
        rotateX: -40,
        duration: 0.5,
        stagger: 0.015,
        ease: "expo.out",
      });
    });

    return () => {
      ctx.revert();
      split.revert();
    };
  }, [title]);

  return (
    <div>
      {eyebrow ? <p className="text-eyebrow mb-1.5">{eyebrow}</p> : null}
      <h1
        ref={titleRef}
        className={cn("text-2xl font-semibold tracking-tight text-foreground", titleClassName)}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

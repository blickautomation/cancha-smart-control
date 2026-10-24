"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  tone?: "neutral" | "positive" | "negative";
  badge?: string;
}

export function KpiCard({ label, value, format, tone = "neutral", badge }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.textContent = format(value);
      return;
    }

    const counter = { current: 0 };
    const tween = gsap.to(counter, {
      current: value,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        if (el) el.textContent = format(counter.current);
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, format]);

  const toneClass =
    tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{label}</CardTitle>
        {badge ? <Badge variant={tone === "negative" ? "negative" : "neutral"}>{badge}</Badge> : null}
      </CardHeader>
      <CardContent>
        <div ref={ref} className={cn("font-mono text-2xl font-semibold tabular-nums", toneClass)}>
          {format(0)}
        </div>
      </CardContent>
    </Card>
  );
}

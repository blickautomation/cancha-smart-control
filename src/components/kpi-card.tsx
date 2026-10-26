"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatArs, formatPct } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const formatters = { ars: formatArs, pct: formatPct } as const;

interface KpiCardProps {
  label: string;
  value: number;
  format: keyof typeof formatters;
  tone?: "neutral" | "positive" | "negative";
  badge?: string;
}

const toneAccent = {
  neutral: "bg-accent",
  positive: "bg-positive",
  negative: "bg-negative",
};

export function KpiCard({ label, value, format: formatKey, tone = "neutral", badge }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const format = formatters[formatKey];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = format(value);
      return;
    }

    const counter = { current: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        current: value,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (el) el.textContent = format(counter.current);
        },
      });
    });

    return () => ctx.revert();
  }, [value, format]);

  const toneClass =
    tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";

  return (
    <Card interactive className="relative overflow-hidden">
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 opacity-70",
          toneAccent[tone]
        )}
        aria-hidden
      />
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

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

const links = [
  { href: "/", label: "Resumen" },
  { href: "/clientes", label: "Clientes" },
  { href: "/costos-fijos", label: "Costos fijos" },
  { href: "/usdc", label: "USDC" },
  { href: "/conciliacion", label: "Conciliación" },
  { href: "/alertas", label: "Alertas" },
  { href: "/configuracion", label: "Configuración" },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeHref =
    links.find((l) => (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)))?.href ?? "/";

  useEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    const active = linkRefs.current[activeHref];
    if (!container || !pill || !active) return;

    const target = {
      x: active.offsetLeft,
      width: active.offsetWidth,
    };

    if (prefersReducedMotion()) {
      gsap.set(pill, target);
      return;
    }

    gsap.to(pill, { ...target, duration: 0.45, ease: "power3.out" });
  }, [activeHref]);

  return (
    <nav ref={containerRef} className={cn("relative flex gap-1", className)}>
      <div
        ref={pillRef}
        className="absolute top-0 h-full rounded-lg bg-primary/15 shadow-[0_0_0_1px_rgba(183,245,0,0.18)_inset]"
        aria-hidden
      />
      {links.map((link) => {
        const active = link.href === activeHref;
        return (
          <Link
            key={link.href}
            ref={(node) => {
              linkRefs.current[link.href] = node;
            }}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

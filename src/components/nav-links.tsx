"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <nav className={cn("flex gap-1", className)}>
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

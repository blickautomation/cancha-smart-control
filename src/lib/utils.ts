import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArs(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatMes(mes: string) {
  const d = new Date(`${mes}T00:00:00`);
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(d);
}

"use client";

import dynamic from "next/dynamic";
import type { PuntoMargen } from "@/components/margen-chart";

const MargenChart = dynamic(() => import("@/components/margen-chart").then((m) => m.MargenChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-surface/60" />,
});

export function MargenChartLazy({ data }: { data: PuntoMargen[] }) {
  return <MargenChart data={data} />;
}

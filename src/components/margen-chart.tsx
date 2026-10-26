"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatPct, formatMes } from "@/lib/utils";

export interface PuntoMargen {
  mes: string;
  margen_pct: number;
}

export function MargenChart({ data }: { data: PuntoMargen[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="margenFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="mes"
            tickFormatter={(mes: string) => formatMes(mes).split(" ")[0]}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "var(--shadow-card-hover)",
            }}
            labelFormatter={(label) => formatMes(String(label))}
            formatter={(value) => [formatPct(Number(value)), "Margen"] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="margen_pct"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#margenFill)"
            dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: "var(--color-background)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

import Link from "next/link";
import { contarCobrosVencidos, getAlertasRecientes, getTendenciaMensual } from "@/lib/queries";
import { KpiCard } from "@/components/kpi-card";
import { StaggerReveal } from "@/components/stagger-reveal";
import { MargenChartLazy } from "@/components/margen-chart-lazy";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatArs, formatMes, formatPct, formatUsd } from "@/lib/utils";

export default async function DashboardHomePage() {
  // Una sola etapa en paralelo; el último mes y sus filas salen de la tendencia (antes: 2 etapas en serie).
  const [tendencia, alertas, cobrosVencidos] = await Promise.all([
    getTendenciaMensual(6),
    getAlertasRecientes(true, 6),
    contarCobrosVencidos(),
  ]);
  const ultimoMes = tendencia.reduce<string | null>(
    (max, f) => (max === null || f.mes > max ? f.mes : max),
    null
  );

  if (!ultimoMes) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
        <h1 className="text-lg font-semibold">Todavía no hay datos calculados</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Esto se llena solo cuando corra el sync diario (n8n) y calcule{" "}
          <code className="font-mono text-xs">costos_mensuales_cliente</code>. Mientras tanto
          podés cargar{" "}
          <Link href="/clientes" className="text-accent underline underline-offset-2">
            clientes
          </Link>
          ,{" "}
          <Link href="/costos-fijos" className="text-accent underline underline-offset-2">
            costos fijos
          </Link>{" "}
          y{" "}
          <Link href="/usdc" className="text-accent underline underline-offset-2">
            conversiones USDC
          </Link>
          .
        </p>
      </div>
    );
  }

  const filas = tendencia
    .filter((f) => f.mes === ultimoMes)
    .sort((a, b) => b.ganancia_ars - a.ganancia_ars);

  const mensualidadTotal = filas.reduce((acc, f) => acc + f.mensualidad_ars, 0);
  const costoTotal = filas.reduce((acc, f) => acc + f.costo_total_ars, 0);
  const gananciaTotal = mensualidadTotal - costoTotal;
  const margenPromedio = mensualidadTotal > 0 ? (gananciaTotal / mensualidadTotal) * 100 : 0;

  const tendenciaPorMes = Object.values(
    tendencia.reduce<Record<string, { mes: string; sumaMensualidad: number; sumaGanancia: number }>>(
      (acc, fila) => {
        acc[fila.mes] ??= { mes: fila.mes, sumaMensualidad: 0, sumaGanancia: 0 };
        acc[fila.mes].sumaMensualidad += fila.mensualidad_ars;
        acc[fila.mes].sumaGanancia += fila.ganancia_ars;
        return acc;
      },
      {}
    )
  )
    .map((p) => ({
      mes: p.mes,
      margen_pct: p.sumaMensualidad > 0 ? Math.round((p.sumaGanancia / p.sumaMensualidad) * 1000) / 10 : 0,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Último mes calculado"
        title={formatMes(ultimoMes)}
        titleClassName="capitalize"
      />

      {cobrosVencidos > 0 ? (
        <Link
          href="/cobros"
          className="flex items-center justify-between rounded-xl border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative transition-colors hover:bg-negative/15"
        >
          <span>
            {cobrosVencidos === 1 ? "1 cobro vencido" : `${cobrosVencidos} cobros vencidos`}
          </span>
          <span aria-hidden>Ver cobros →</span>
        </Link>
      ) : null}

      <StaggerReveal className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Mensualidades" value={mensualidadTotal} format="ars" />
        <KpiCard label="Costo total" value={costoTotal} format="ars" tone="negative" />
        <KpiCard
          label="Ganancia"
          value={gananciaTotal}
          format="ars"
          tone={gananciaTotal >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Margen promedio"
          value={margenPromedio}
          format="pct"
          tone={margenPromedio >= 0 ? "positive" : "negative"}
        />
      </StaggerReveal>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Margen promedio — últimos meses</CardTitle>
          </CardHeader>
          <CardContent>
            {tendenciaPorMes.length > 1 ? (
              <MargenChartLazy data={tendenciaPorMes} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Con un mes más de datos aparece la tendencia acá.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Alertas sin ver</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {alertas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin alertas pendientes.</p>
            ) : (
              alertas.map((a) => (
                <div key={a.id} className="rounded-lg border border-border p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        a.severidad === "critical"
                          ? "negative"
                          : a.severidad === "warning"
                            ? "warning"
                            : "accent"
                      }
                    >
                      {a.cliente?.nombre ?? "General"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{a.mensaje}</p>
                </div>
              ))
            )}
            <Link href="/alertas" className="mt-1 text-xs text-accent underline underline-offset-2">
              Ver todas
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Por cliente — {formatMes(ultimoMes)}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2 text-right">Mensualidad</th>
                <th className="px-4 py-2 text-right">APIs (USD)</th>
                <th className="px-4 py-2 text-right">Costo</th>
                <th className="px-4 py-2 text-right">Ganancia</th>
                <th className="px-4 py-2 text-right">Margen</th>
              </tr>
            </thead>
            <StaggerReveal as="tbody">
              {filas.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5">
                    <Link href={`/clientes/${f.cliente.id}`} className="hover:text-accent">
                      {f.cliente.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatArs(f.mensualidad_ars)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatUsd(f.costo_apis_usd)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatArs(f.costo_total_ars)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                      f.ganancia_ars >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatArs(f.ganancia_ars)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatPct(f.margen_pct)}
                  </td>
                </tr>
              ))}
            </StaggerReveal>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

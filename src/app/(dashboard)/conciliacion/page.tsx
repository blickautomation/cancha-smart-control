import { getConciliaciones } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";
import { formatMes, formatPct, formatUsd } from "@/lib/utils";

export default async function ConciliacionPage() {
  const conciliaciones = await getConciliaciones();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conciliación Anthropic"
        description="Compara lo calculado desde la Usage API contra el total que reporta la Cost API, por cliente y mes."
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Mes</th>
                <th className="px-4 py-2 text-right">Calculado</th>
                <th className="px-4 py-2 text-right">Cost API</th>
                <th className="px-4 py-2 text-right">Diferencia</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <StaggerReveal as="tbody">
              {conciliaciones.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5">{c.cliente.nombre}</td>
                  <td className="px-4 py-2.5 capitalize">{formatMes(c.mes)}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatUsd(c.costo_calculado_usd)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatUsd(c.costo_cost_api_usd)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatPct(c.diferencia_pct)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={c.estado === "ok" ? "positive" : "negative"}>{c.estado}</Badge>
                  </td>
                </tr>
              ))}
              {conciliaciones.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={6}>
                    Sin conciliaciones todavía — las genera el sync mensual.
                  </td>
                </tr>
              ) : null}
            </StaggerReveal>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

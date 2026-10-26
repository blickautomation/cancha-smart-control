import { getConversionesUsdc, getCostoPromedioUsdcActual } from "@/lib/queries";
import { crearConversionUsdc } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";
import { formatArs } from "@/lib/utils";

export default async function UsdcPage() {
  const [conversiones, promedio] = await Promise.all([
    getConversionesUsdc(),
    getCostoPromedioUsdcActual(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversiones a USDC"
        description="Pesos entregados y USDC recibidos vía la app ARQ. El costo promedio ponderado se usa para convertir a pesos los costos en USD de Anthropic y OpenAI."
      />

      <Card className="max-w-xs">
        <CardHeader>
          <CardTitle>Costo promedio ponderado</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-2xl font-semibold text-primary">
          {promedio !== null ? `${formatArs(promedio)} / USDC` : "—"}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2 text-right">Pesos entregados</th>
                <th className="px-4 py-2 text-right">USDC recibidos</th>
                <th className="px-4 py-2 text-right">$/USDC</th>
              </tr>
            </thead>
            <StaggerReveal as="tbody">
              {conversiones.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5">{c.fecha}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatArs(c.pesos_entregados)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {c.usdc_recibidos.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {formatArs(c.pesos_entregados / c.usdc_recibidos)}
                  </td>
                </tr>
              ))}
              {conversiones.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={4}>
                    Sin conversiones cargadas.
                  </td>
                </tr>
              ) : null}
            </StaggerReveal>
          </table>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-foreground">Nueva conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={crearConversionUsdc} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" required />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pesos_entregados">Pesos entregados</Label>
                <Input id="pesos_entregados" name="pesos_entregados" type="number" min="0" step="0.01" required />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="usdc_recibidos">USDC recibidos</Label>
                <Input id="usdc_recibidos" name="usdc_recibidos" type="number" min="0" step="0.000001" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notas">Notas</Label>
              <Input id="notas" name="notas" />
            </div>
            <Button type="submit" className="mt-1 self-start">
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

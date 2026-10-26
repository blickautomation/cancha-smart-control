import { getCostosFijos } from "@/lib/queries";
import { alternarActivoCostoFijo, crearCostoFijo } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";
import { formatArs, formatUsd } from "@/lib/utils";

export default async function CostosFijosPage() {
  const costos = await getCostosFijos();

  const mensualEstimado = costos
    .filter((c) => c.activo && c.prorratear && c.moneda === "ARS")
    .reduce((acc, c) => acc + (c.periodicidad === "anual" ? c.monto / 12 : c.monto), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Costos fijos"
        description="VPS, Supabase Pro y demás costos que se prorratean entre clientes activos."
      />

      {mensualEstimado > 0 ? (
        <Card className="max-w-xs">
          <CardHeader>
            <CardTitle>Prorrateo mensual estimado (ARS)</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold text-primary">
            {formatArs(mensualEstimado)}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Periodicidad</th>
                <th className="px-4 py-2">Prorratea</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <StaggerReveal as="tbody">
              {costos.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5">{c.nombre}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums">
                    {c.moneda === "ARS" ? formatArs(c.monto) : formatUsd(c.monto)}
                  </td>
                  <td className="px-4 py-2.5">{c.periodicidad}</td>
                  <td className="px-4 py-2.5">{c.prorratear ? "Sí" : "No"}</td>
                  <td className="px-4 py-2.5">
                    <form action={alternarActivoCostoFijo.bind(null, c.id, !c.activo)}>
                      <button type="submit">
                        <Badge variant={c.activo ? "positive" : "neutral"}>
                          {c.activo ? "activo" : "inactivo"}
                        </Badge>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {costos.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                    Sin costos fijos cargados.
                  </td>
                </tr>
              ) : null}
            </StaggerReveal>
          </table>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-foreground">Nuevo costo fijo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={crearCostoFijo} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" placeholder="VPS anual" required />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="monto">Monto</Label>
                <Input id="monto" name="monto" type="number" min="0" step="0.01" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="moneda">Moneda</Label>
                <select
                  id="moneda"
                  name="moneda"
                  className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="periodicidad">Periodicidad</Label>
              <select
                id="periodicidad"
                name="periodicidad"
                className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
              >
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="unica">Única</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="prorratear" defaultChecked className="h-4 w-4" />
              Prorratear entre clientes activos
            </label>
            <Button type="submit" className="mt-1 self-start">
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

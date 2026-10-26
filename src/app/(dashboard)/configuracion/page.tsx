import { getConfiguracionAlertas, getModelosPrecios } from "@/lib/queries";
import { actualizarUmbral, crearModeloPrecio } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";

export default async function ConfiguracionPage() {
  const [modelos, umbrales] = await Promise.all([getModelosPrecios(), getConfiguracionAlertas()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Configuración" description="Precios por modelo y umbrales de alertas." />

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Umbrales de alertas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {umbrales.map((u) => (
            <form
              key={u.id}
              action={actualizarUmbral.bind(null, u.clave)}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 py-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{u.clave}</p>
                <p className="text-xs text-muted-foreground">{u.descripcion}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  name="valor"
                  type="number"
                  step="0.01"
                  defaultValue={u.valor}
                  className="w-24"
                />
                <Button type="submit" size="sm" variant="outline">
                  Guardar
                </Button>
              </div>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Precios por modelo (USD / millón de tokens)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Modelo</th>
                <th className="px-4 py-2 text-right">Input</th>
                <th className="px-4 py-2 text-right">Output</th>
                <th className="px-4 py-2 text-right">Cache 5m</th>
                <th className="px-4 py-2 text-right">Cache 1h</th>
                <th className="px-4 py-2 text-right">Cache lectura</th>
                <th className="px-4 py-2">Vigente desde</th>
              </tr>
            </thead>
            <StaggerReveal as="tbody">
              {modelos.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5">
                    <Badge variant="accent" className="mr-2">
                      {m.proveedor}
                    </Badge>
                    {m.modelo}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.precio_input_usd_mtok ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.precio_output_usd_mtok ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.precio_cache_escritura_5m_usd_mtok ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.precio_cache_escritura_1h_usd_mtok ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.precio_cache_lectura_usd_mtok ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">{m.vigente_desde}</td>
                </tr>
              ))}
              {modelos.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted-foreground" colSpan={7}>
                    Sin precios cargados.
                  </td>
                </tr>
              ) : null}
            </StaggerReveal>
          </table>
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Nuevo precio de modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={crearModeloPrecio} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="proveedor">Proveedor</Label>
                <select
                  id="proveedor"
                  name="proveedor"
                  className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
                >
                  <option value="anthropic">anthropic</option>
                  <option value="openai">openai</option>
                </select>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="modelo">Modelo</Label>
                <Input id="modelo" name="modelo" placeholder="claude-sonnet-5-5" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio_input_usd_mtok">Input</Label>
                <Input id="precio_input_usd_mtok" name="precio_input_usd_mtok" type="number" step="0.0001" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio_output_usd_mtok">Output</Label>
                <Input id="precio_output_usd_mtok" name="precio_output_usd_mtok" type="number" step="0.0001" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio_cache_escritura_5m_usd_mtok">Cache escritura 5m</Label>
                <Input
                  id="precio_cache_escritura_5m_usd_mtok"
                  name="precio_cache_escritura_5m_usd_mtok"
                  type="number"
                  step="0.0001"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio_cache_escritura_1h_usd_mtok">Cache escritura 1h</Label>
                <Input
                  id="precio_cache_escritura_1h_usd_mtok"
                  name="precio_cache_escritura_1h_usd_mtok"
                  type="number"
                  step="0.0001"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio_cache_lectura_usd_mtok">Cache lectura</Label>
                <Input
                  id="precio_cache_lectura_usd_mtok"
                  name="precio_cache_lectura_usd_mtok"
                  type="number"
                  step="0.0001"
                />
              </div>
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

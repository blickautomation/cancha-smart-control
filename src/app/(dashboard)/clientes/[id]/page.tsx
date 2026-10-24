import { notFound } from "next/navigation";
import {
  getApiKeysDeCliente,
  getCliente,
  getHistorialMensualDeCliente,
  getHorasSoporteDeCliente,
  getMensualidadesDeCliente,
} from "@/lib/queries";
import {
  agregarApiKey,
  agregarHorasSoporte,
  agregarMensualidad,
  cambiarEstadoCliente,
} from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatArs, formatMes, formatPct } from "@/lib/utils";

const estadoVariant = { activo: "positive", pausado: "warning", baja: "negative" } as const;

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getCliente(id);
  if (!cliente) notFound();

  const [mensualidades, apiKeys, horas, historial] = await Promise.all([
    getMensualidadesDeCliente(id),
    getApiKeysDeCliente(id),
    getHorasSoporteDeCliente(id),
    getHistorialMensualDeCliente(id),
  ]);

  const mensualidadVigente = mensualidades[0]?.monto_ars ?? null;

  const addMensualidad = agregarMensualidad.bind(null, id);
  const addApiKey = agregarApiKey.bind(null, id);
  const addHoras = agregarHorasSoporte.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
            <Badge variant={estadoVariant[cliente.estado]}>{cliente.estado}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{cliente.pack ?? "Sin pack asignado"}</p>
        </div>
        <div className="flex gap-2">
          {(["activo", "pausado", "baja"] as const).map((estado) => (
            <form key={estado} action={cambiarEstadoCliente.bind(null, id, estado)}>
              <Button
                type="submit"
                variant={cliente.estado === estado ? "primary" : "outline"}
                size="sm"
              >
                {estado}
              </Button>
            </form>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Mensualidad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="font-mono text-2xl font-semibold text-primary">
              {mensualidadVigente !== null ? formatArs(mensualidadVigente) : "—"}
            </p>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {mensualidades.slice(0, 5).map((m) => (
                <div key={m.id} className="flex justify-between border-b border-border/50 py-1">
                  <span>{m.vigente_desde}</span>
                  <span className="font-mono tabular-nums">{formatArs(m.monto_ars)}</span>
                </div>
              ))}
            </div>
            <form action={addMensualidad} className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="monto_ars">Nuevo monto</Label>
                <Input id="monto_ars" name="monto_ars" type="number" min="0" className="w-32" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="vigente_desde">Vigente desde</Label>
                <Input id="vigente_desde" name="vigente_desde" type="date" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="motivo">Motivo</Label>
                <Input id="motivo" name="motivo" placeholder="Ajuste" className="w-36" />
              </div>
              <Button type="submit" size="sm">
                Agregar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">API keys (Anthropic / OpenAI)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-sm">
              {apiKeys.length === 0 ? (
                <p className="text-muted-foreground">Sin keys cargadas.</p>
              ) : (
                apiKeys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between border-b border-border/50 py-1">
                    <span>
                      <Badge variant="accent" className="mr-2">
                        {k.proveedor}
                      </Badge>
                      {k.alias ?? k.api_key_id}
                    </span>
                    {!k.vigente_hasta ? (
                      <Badge variant="positive">vigente</Badge>
                    ) : (
                      <Badge variant="neutral">rotada</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
            <form action={addApiKey} className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="proveedor">Proveedor</Label>
                <select
                  id="proveedor"
                  name="proveedor"
                  className="h-10 rounded-lg border border-border bg-surface px-2 text-sm"
                  required
                >
                  <option value="anthropic">anthropic</option>
                  <option value="openai">openai</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="api_key_id">api_key_id</Label>
                <Input id="api_key_id" name="api_key_id" className="w-44" required />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="alias">Alias</Label>
                <Input id="alias" name="alias" className="w-32" />
              </div>
              <Button type="submit" size="sm">
                Agregar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Historial mensual</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {historial.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Sin meses calculados todavía.</p>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2">Mes</th>
                  <th className="px-4 py-2 text-right">Mensualidad</th>
                  <th className="px-4 py-2 text-right">Costo</th>
                  <th className="px-4 py-2 text-right">Ganancia</th>
                  <th className="px-4 py-2 text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5 capitalize">{formatMes(h.mes)}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatArs(h.mensualidad_ars)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatArs(h.costo_total_ars)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                        h.ganancia_ars >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {formatArs(h.ganancia_ars)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatPct(h.margen_pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Horas de soporte</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {horas.length === 0 ? (
              <p>Sin horas cargadas.</p>
            ) : (
              horas.slice(0, 8).map((h) => (
                <div key={h.id} className="flex justify-between border-b border-border/50 py-1">
                  <span>
                    {h.fecha} {h.descripcion ? `— ${h.descripcion}` : ""}
                  </span>
                  <span className="font-mono tabular-nums">{h.horas} h</span>
                </div>
              ))
            )}
          </div>
          <form action={addHoras} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="horas">Horas</Label>
              <Input id="horas" name="horas" type="number" min="0" step="0.5" className="w-24" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" name="descripcion" className="w-48" />
            </div>
            <Button type="submit" size="sm">
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

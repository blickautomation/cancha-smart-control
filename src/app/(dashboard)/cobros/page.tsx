import { asegurarCobrosDelMes, getCobros } from "@/lib/queries";
import { deshacerPago, marcarPagado } from "./actions";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatArs, formatMes } from "@/lib/utils";

function diasHasta(fecha: string, hoy: string) {
  const ms = new Date(`${fecha}T00:00:00`).getTime() - new Date(`${hoy}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

export default async function CobrosPage() {
  let cobros: Awaited<ReturnType<typeof getCobros>>;
  try {
    await asegurarCobrosDelMes();
    cobros = await getCobros(3);
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Cobros" />
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-foreground">Falta un paso de configuración</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Hay que correr la migración <code className="font-mono">0005_cobros.sql</code> en el
            SQL Editor de Supabase para crear la tabla de cobros. Después recargá esta página.
          </CardContent>
        </Card>
      </div>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const mesActual = hoy.slice(0, 7) + "-01";
  const delMes = cobros.filter((c) => c.mes === mesActual);

  const porCobrar = delMes
    .filter((c) => c.estado === "pendiente")
    .reduce((acc, c) => acc + c.monto_esperado_ars, 0);
  const cobrado = delMes
    .filter((c) => c.estado === "pagado")
    .reduce((acc, c) => acc + (c.monto_pagado_ars ?? c.monto_esperado_ars), 0);
  const vencidos = cobros.filter((c) => c.estado === "pendiente" && c.fecha_vencimiento < hoy).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Cobros"
        title={formatMes(mesActual)}
        titleClassName="capitalize"
        description="Cuándo tiene que pagar cada cliente y si ya pagó. Cargá el día de cobro en la ficha de cada cliente."
      />

      <StaggerReveal className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Por cobrar</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {formatArs(porCobrar)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cobrado</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xl font-semibold tabular-nums text-positive">
            {formatArs(cobrado)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vencidos</CardTitle>
          </CardHeader>
          <CardContent
            className={`font-mono text-xl font-semibold tabular-nums ${
              vencidos > 0 ? "text-negative" : "text-foreground"
            }`}
          >
            {vencidos}
          </CardContent>
        </Card>
      </StaggerReveal>

      {cobros.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay cobros. Entrá a un cliente y cargá su día de cobro; el cobro del mes se
          crea solo.
        </p>
      ) : (
        <StaggerReveal className="flex flex-col gap-2">
          {cobros.map((c) => {
            const vencido = c.estado === "pendiente" && c.fecha_vencimiento < hoy;
            const dias = diasHasta(c.fecha_vencimiento, hoy);
            return (
              <Card key={c.id} className={vencido ? "border-negative/40" : undefined}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.cliente.nombre}</p>
                      {c.estado === "pagado" ? (
                        <Badge variant="positive">Pagó</Badge>
                      ) : vencido ? (
                        <Badge variant="negative">Vencido</Badge>
                      ) : (
                        <Badge variant="warning">Pendiente</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {formatMes(c.mes)} · vence {c.fecha_vencimiento}
                      {c.estado === "pendiente"
                        ? vencido
                          ? ` · hace ${-dias} d`
                          : dias === 0
                            ? " · hoy"
                            : ` · en ${dias} d`
                        : c.fecha_pago
                          ? ` · pagó el ${c.fecha_pago}`
                          : ""}
                    </p>
                  </div>

                  {c.estado === "pendiente" ? (
                    <form
                      action={marcarPagado.bind(null, c.id)}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <Input
                        name="fecha_pago"
                        type="date"
                        defaultValue={hoy}
                        aria-label="Fecha de pago"
                        className="w-40"
                      />
                      <Input
                        name="monto_pagado_ars"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={c.monto_esperado_ars}
                        aria-label="Monto pagado"
                        className="w-32"
                      />
                      <Button type="submit" size="sm">
                        Pagó
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-positive">
                        {formatArs(c.monto_pagado_ars ?? c.monto_esperado_ars)}
                      </span>
                      <form action={deshacerPago.bind(null, c.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Deshacer
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </StaggerReveal>
      )}
    </div>
  );
}

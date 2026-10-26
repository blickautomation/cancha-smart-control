import { getAlertasRecientes } from "@/lib/queries";
import { marcarAlertaVista } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StaggerReveal } from "@/components/stagger-reveal";

const severidadVariant = { critical: "negative", warning: "warning", info: "accent" } as const;

export default async function AlertasPage() {
  const alertas = await getAlertasRecientes(false, 50);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alertas"
        description="Margen bajo, consumo diario fuera de lo normal y diferencias de conciliación."
      />

      <StaggerReveal className="flex flex-col gap-2">
        {alertas.map((a) => (
          <Card key={a.id} className={a.vista ? "opacity-60" : undefined}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={severidadVariant[a.severidad]}>{a.severidad}</Badge>
                  {a.cliente ? <Badge variant="neutral">{a.cliente.nombre}</Badge> : null}
                </div>
                <p className="text-sm">{a.mensaje}</p>
              </div>
              {!a.vista ? (
                <form action={marcarAlertaVista.bind(null, a.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Marcar vista
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {alertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin alertas registradas todavía.</p>
        ) : null}
      </StaggerReveal>
    </div>
  );
}

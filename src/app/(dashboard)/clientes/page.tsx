import Link from "next/link";
import { getClientes } from "@/lib/queries";
import { crearCliente } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StaggerReveal } from "@/components/stagger-reveal";

const estadoVariant = {
  activo: "positive",
  pausado: "warning",
  baja: "negative",
} as const;

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Complejos deportivos activos y de baja.</p>
      </div>

      <StaggerReveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clientes.map((c) => (
          <Link key={c.id} href={`/clientes/${c.id}`}>
            <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold text-foreground">
                  {c.nombre}
                </CardTitle>
                <Badge variant={estadoVariant[c.estado]}>{c.estado}</Badge>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {c.pack ?? "Sin pack asignado"}
              </CardContent>
            </Card>
          </Link>
        ))}
        {clientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no cargaste clientes.</p>
        ) : null}
      </StaggerReveal>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-foreground">Nuevo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={crearCliente} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pack">Pack</Label>
              <Input id="pack" name="pack" placeholder="Ej: Pack Pro" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mensualidad_ars">Mensualidad (ARS)</Label>
              <Input id="mensualidad_ars" name="mensualidad_ars" type="number" min="0" step="1" required />
            </div>
            <Button type="submit" className="mt-1 self-start">
              Crear cliente
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

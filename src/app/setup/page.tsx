import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerReveal } from "@/components/stagger-reveal";

const steps = [
  {
    title: "1. Crear el proyecto Supabase",
    body: "supabase.com/dashboard → New Project (dedicado a Cancha Smart, no reutilizar otros proyectos). Guardá la contraseña de la base.",
  },
  {
    title: "2. Aplicar el esquema",
    body: "npx supabase link --project-ref <ref> && npx supabase db push — corre supabase/migrations/0001_schema.sql.",
  },
  {
    title: "3. Crear el usuario único",
    body: "Supabase Dashboard → Authentication → Users → Add user (tu email). Ese es el único login que va a existir.",
  },
  {
    title: "4. Completar .env.local",
    body: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY (Project Settings → API). Ver .env.example.",
  },
];

export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-4 py-12">
      <div>
        <span className="text-eyebrow">Cancha Smart</span>
        <h1 className="mt-2 text-xl font-semibold">Todavía falta conectar Supabase</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La app corre, pero no encuentra las variables de entorno de Supabase. Seguí estos
          pasos y recargá.
        </p>
      </div>
      <StaggerReveal className="flex flex-col gap-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="text-foreground">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{step.body}</CardContent>
          </Card>
        ))}
      </StaggerReveal>
    </main>
  );
}

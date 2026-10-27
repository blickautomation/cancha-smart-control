import { NavLinks } from "@/components/nav-links";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

// Datos financieros en vivo: nunca prerenderizar con los datos del momento del build.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(183,245,0,0.8)]" />
              <span className="text-eyebrow">Cancha Smart</span>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Salir
              </Button>
            </form>
          </div>
          <div className="-mx-4 overflow-x-auto px-4">
            <NavLinks className="w-max" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

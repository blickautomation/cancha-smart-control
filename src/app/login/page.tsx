import Image from "next/image";
import { LoginForm } from "./login-form";
import { LoginReveal } from "./login-reveal";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="animate-ambient-pulse pointer-events-none absolute left-1/2 top-[18%] h-72 w-72 rounded-full bg-primary/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="animate-ambient-pulse pointer-events-none absolute left-1/2 top-[30%] h-56 w-56 rounded-full bg-accent/15 blur-[90px] [animation-delay:-3.5s]"
        aria-hidden
      />
      <LoginReveal className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image
            src="/logo-completo.png"
            alt="Cancha Smart"
            width={220}
            height={220}
            className="h-auto w-44"
            unoptimized
            priority
          />
          <h1 className="text-xl font-semibold text-foreground">Panel de control</h1>
          <p className="text-sm text-muted-foreground">
            Acceso de un solo usuario. Iniciá sesión para continuar.
          </p>
        </div>
        <LoginForm />
      </LoginReveal>
    </main>
  );
}

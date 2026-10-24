import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image src="/logo-completo.png" alt="Cancha Smart" width={220} height={56} priority />
          <h1 className="text-xl font-semibold text-foreground">Panel de control</h1>
          <p className="text-sm text-muted-foreground">
            Acceso de un solo usuario. Iniciá sesión para continuar.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

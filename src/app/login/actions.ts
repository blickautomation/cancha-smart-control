"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function signIn(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const credencialesMalas = error.code === "invalid_credentials";
    return {
      error: credencialesMalas
        ? "Email o contraseña incorrectos."
        : `No se pudo iniciar sesión: ${error.message}`,
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}

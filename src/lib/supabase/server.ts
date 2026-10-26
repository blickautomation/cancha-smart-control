import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para datos (Server Components / Server Actions).
 * Usa la service_role key y NO lee cookies de sesión: con @supabase/ssr, una sesión
 * de usuario en las cookies pisaba la service_role y las consultas corrían como
 * "authenticated" (sin grants) -> error 42501 después de loguearse.
 * Nunca se expone al browser (este archivo no lleva "use client").
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Cliente Supabase liviano (anon key) solo para el flujo de login/logout,
 * donde no hace falta service_role.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ver nota arriba
          }
        },
      },
    }
  );
}

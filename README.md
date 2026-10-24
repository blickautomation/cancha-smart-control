# Cancha Smart — Panel de control

App interna de un solo usuario para ver, por cliente y por mes: cuánto paga, cuánto cuesta
(Anthropic + OpenAI convertido a pesos vía costo promedio ponderado de USDC, más costos fijos
prorrateados) y cuánto deja de ganancia.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) como PWA instalable.
- **Supabase** (Postgres + Auth) — proyecto dedicado, separado del resto de Blick Automation.
- **n8n** (ya corriendo en el VPS) para el sync diario contra Anthropic Usage/Cost API, OpenAI
  Costs API y CriptoYa.
- **Vercel** para el hosting del frontend.

Ver `SETUP.md` para los pasos de puesta en marcha (Supabase, variables de entorno, usuario único).

## Desarrollo local

```bash
npm install
npm run dev
```

Si faltan las variables de Supabase, la app redirige a `/setup` con instrucciones.

## Estructura

- `src/app/(dashboard)/` — pantallas autenticadas: resumen, clientes, costos fijos, USDC,
  conciliación, alertas, configuración.
- `src/app/login/` — login de un solo usuario (Supabase Auth).
- `src/lib/queries.ts` — lecturas a Supabase (Server Components).
- `src/lib/supabase/` — clientes Supabase (server, con cookies async de Next 16) y el proxy de auth.
- `supabase/migrations/0001_schema.sql` — esquema completo.
- `n8n/sync-diario.md` — especificación del workflow de sync diario (a construir cuando existan
  las claves admin de Anthropic/OpenAI y el proyecto Supabase).

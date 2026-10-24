# Puesta en marcha

Todo el código y el esquema ya están listos. Esto es lo que solo vos podés hacer (credenciales
de tus propias cuentas, nada que yo pueda generar por vos).

## 1. Supabase — proyecto nuevo

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**. Nombre sugerido:
   `cancha-smart-control`. Guardá la contraseña de la base en tu gestor de contraseñas.
2. Instalá el CLI y aplicá el esquema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-del-proyecto>
   npx supabase db push
   ```
   Esto corre `supabase/migrations/0001_schema.sql` (14 tablas + la vista de costo promedio
   USDC + los umbrales de alerta por defecto).
3. **Authentication → Users → Add user** con tu email. Ese es el único login que va a existir
   — no hace falta nada más de configuración de auth.
4. **Project Settings → API** — copiá `Project URL`, `anon public key` y `service_role key`.

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

Completá `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` con lo del paso anterior.

```bash
npm run dev
```

Entrá a `http://localhost:3000`, iniciá sesión con el usuario que creaste, y ya debería andar
(vacío, hasta que cargues clientes/costos fijos/USDC o corra el sync).

## 3. Deploy (Vercel)

1. Pusheá este repo a GitHub (`cancha-smart-control`, privado).
2. [vercel.com/new](https://vercel.com/new) → importar el repo.
3. Cargar las mismas 3 variables de entorno del paso 2 en Vercel (Production + Preview).
4. Deploy. PWA instalable desde el celular apenas abrís la URL (ícono "Agregar a inicio").

## 4. Sync diario (n8n)

El workflow todavía no existe en tu n8n — la especificación completa, nodo por nodo, está en
[`n8n/sync-diario.md`](./n8n/sync-diario.md). Para construirlo hacen falta:

1. **Anthropic Admin API key** — console.anthropic.com → Organization → Admin API Keys.
2. **OpenAI Admin key de solo lectura** (scope de Usage/Costs) — platform.openai.com →
   Organization → Admin Keys.
3. El `service_role` de Supabase del paso 1.

Con esas tres credenciales cargadas como credenciales de n8n, decime y armo el workflow
(puedo hacerlo directo en tu n8n vía MCP).

## 5. Carga inicial de datos

Una vez con la app corriendo:

- **Clientes**: La Campiña ($50.000), Estadio Pádel Center ($38.000), NOA ($35.000), Gol de Oro
  ($60.000) — con la `api_key_id` de Anthropic y de OpenAI de cada uno en su página de detalle.
- **Costos fijos**: VPS ($246.011,76 anual, prorratear) + lo que corresponda (ej. Supabase Pro).
- **Precios por modelo**: completar en Configuración con los precios vigentes de Anthropic/OpenAI.
- **USDC**: cargar las conversiones históricas que tengas, para que el costo promedio ponderado
  arranque con una base real en vez de en blanco.

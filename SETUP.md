# Puesta en marcha

## 1. Supabase — proyecto nuevo ✅ hecho

Proyecto `cancha-smart-control` creado en São Paulo (sa-east-1), esquema aplicado (14 tablas +
vista), y te mandé una invitación por email a blickautomation@gmail.com — abrila para fijar tu
contraseña, ese es el único login que va a existir.

`.env.local` ya está completo en tu máquina (gitignored, nunca se commitea) con la URL del
proyecto y las keys. Para correr local:

```bash
npm run dev
```

Entrá a `http://localhost:3000`, iniciá sesión con el usuario que invité, y ya debería andar
(vacío, hasta que cargues clientes/costos fijos/USDC o corra el sync).

## 2. Deploy (Vercel)

1. Pusheá este repo a GitHub (`cancha-smart-control`, privado).
2. [vercel.com/new](https://vercel.com/new) → importar el repo.
3. Cargar las 3 variables de `.env.local` en Vercel (Production + Preview).
4. Deploy. PWA instalable desde el celular apenas abrís la URL (ícono "Agregar a inicio").

## 3. Sync diario (n8n)

El workflow todavía no existe en tu n8n — la especificación completa, nodo por nodo, está en
[`n8n/sync-diario.md`](./n8n/sync-diario.md). Para construirlo hacen falta:

1. **Anthropic Admin API key** — console.anthropic.com → Organization → Admin API Keys.
2. **OpenAI Admin key de solo lectura** (scope de Usage/Costs) — platform.openai.com →
   Organization → Admin Keys.
3. El `service_role` de Supabase (ya está en `.env.local`).

Con esas tres credenciales cargadas como credenciales de n8n, decime y armo el workflow
(puedo hacerlo directo en tu n8n vía MCP).

## 4. Carga inicial de datos

Una vez con la app corriendo:

- **Clientes**: La Campiña ($50.000), Estadio Pádel Center ($38.000), NOA ($35.000), Gol de Oro
  ($60.000) — con la `api_key_id` de Anthropic y de OpenAI de cada uno en su página de detalle.
- **Costos fijos**: VPS ($246.011,76 anual, prorratear) + lo que corresponda (ej. Supabase Pro).
- **Precios por modelo**: completar en Configuración con los precios vigentes de Anthropic/OpenAI.
- **USDC**: cargar las conversiones históricas que tengas, para que el costo promedio ponderado
  arranque con una base real en vez de en blanco.

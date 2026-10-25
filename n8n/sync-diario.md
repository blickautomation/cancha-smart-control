# Workflow n8n: sync diario Cancha Smart

**El workflow ya existe en n8n:** [Cancha Smart - Sync diario (uso y costos)](https://proyectos-personales-n8n-personal.gmkkwl.easypanel.host/workflow/zmk4N7F7eBmhVRJz)
(id `zmk4N7F7eBmhVRJz`, proyecto Blick Automation). Cubre la ingesta diaria (Anthropic Usage
API + OpenAI Costs API → `uso_diario_anthropic` / `uso_diario_openai`, con reparto N-way para
la key compartida de NOA). **Fase 2, todavía no construida:** calcular
`costos_mensuales_cliente`, chequeo de alertas y la conciliación mensual contra la Anthropic
Cost API — ver la sección "Nodos" más abajo para esa parte.

Las claves admin ya están verificadas contra las APIs reales (Anthropic y OpenAI, ambas
devuelven 200). Clientes, mensualidades conocidas y el mapeo `api_key_id` → cliente ya están
sembrados en Supabase (`clientes`, `cliente_mensualidades`, `cliente_api_keys`).

**Único paso pendiente para que el workflow corra:** las 3 credenciales quedaron creadas como
placeholders (`newCredential(...)`) — el workflow no tiene a qué nodo n8n apuntar todavía.
Abrí el workflow en n8n, cada HTTP Request node con el ícono de alerta de credencial te deja
crearla ahí mismo con un click. Detalle exacto de cada una:

1. **`Supabase Cancha Smart (service_role)`** — tipo **Supabase API** (credencial nativa de
   n8n, no HTTP Header Auth). Pide `Host` (`https://fmmuiveffdcaznwzqbft.supabase.co`) y
   `Service Role Secret` (el que está en `.env.local` del repo, `SUPABASE_SERVICE_ROLE_KEY`).
   Se usa en 4 nodos — crearla una vez y n8n te deja reusarla en los otros 3.
2. **`Anthropic Admin API`** — tipo **HTTP Header Auth con plantilla** (`Header Auth
   (Template)` en el picker). Header `x-api-key`, valor la Admin key `sk-ant-admin01-...`.
3. **`OpenAI Admin API (read-only)`** — mismo tipo de credencial con plantilla. Header
   `Authorization`, valor `Bearer sk-admin-...` (con el prefijo `Bearer ` incluido).

**Caso especial NOA:** el cliente real "NOA" son dos bots distintos en el sistema —
**Club NOA** y **Padel NOA** — cada uno con su propia Anthropic key, pero compartiendo una
sola OpenAI key de transcripción (`key_1YU2ed4FKZ9PyyOo`). `cliente_api_keys` ya no tiene
constraint de unicidad por key (migración `0002_api_keys_compartidas.sql`), así que la misma
`api_key_id` puede estar vigente para más de un cliente a la vez. Regla de reparto: cuando el
sync calcule `uso_diario_openai` para una key y encuentre más de un cliente vigente con esa
`api_key_id` ese día, divide el costo del día **en partes iguales entre esos clientes** (N-way
split — hoy son 2, pero el código no debería asumir que siempre son 2).

Corre 1 vez por día (ej. `0 7 * * *`, cron trigger). Procesa el día anterior completo (UTC-3:
Argentina) para que los contadores de uso ya estén cerrados del lado de Anthropic/OpenAI.

## Credenciales (ver detalle exacto más arriba)

De dónde sale cada clave admin: Anthropic en console.anthropic.com → Organization → Admin
keys (`sk-ant-admin01-...`, requiere que la org esté convertida a "equipo", no individual).
OpenAI en platform.openai.com/settings/organization/admin-keys (`sk-admin-...`, scope solo
lectura de Usage/Costs). Ambas ya verificadas contra las APIs reales.

## Nodos

Construidos en el workflow real: 1, 2, 3 (todos los proveedores, no solo Anthropic), 4, 6, 7,
8, 9. **Pendientes de fase 2:** 5, 10, 11 y lo que sigue (conciliación, `costos_mensuales_cliente`,
alertas) — no están en el workflow todavía.

1. **Cron Trigger** — diario, horario de Argentina.
2. **Set — rango de fechas** — calcula `fecha_desde`/`fecha_hasta` = ayer (00:00–23:59 UTC-3,
   convertido a UTC para las APIs).
3. **Supabase: GET `cliente_api_keys`** (vigentes, `vigente_hasta is null`) — trae el mapeo
   `api_key_id → cliente_id` por proveedor. Se usa para resolver a qué cliente pertenece cada
   fila que devuelven las APIs externas.
4. **HTTP Request — Anthropic Usage API**
   `GET https://api.anthropic.com/v1/organizations/usage_report/messages`
   Query: `starting_at`, `ending_at`, `bucket_width=1d`, `group_by[]=api_key_id`,
   `group_by[]=model`. Header: `x-api-key`, `anthropic-version`.
   Devuelve, por bucket/día/modelo/key: `uncached_input_tokens`, `output_tokens`,
   `cache_creation.ephemeral_5m_input_tokens`, `cache_creation.ephemeral_1h_input_tokens`,
   `cache_read_input_tokens`.
5. **HTTP Request — Anthropic Cost API**
   `GET https://api.anthropic.com/v1/organizations/cost_report` — solo se usa 1 vez al mes
   (ver nodo 10), pero conviene pedirlo todos los días para el día de ayer y acumular: así el
   total mensual está listo apenas termina el mes, sin tener que re-pedir rangos largos.
6. **HTTP Request — OpenAI Costs API**
   `GET https://api.openai.com/v1/organization/costs`
   Query: `start_time`, `end_time`, `bucket_width=1d`, `group_by[]=api_key_id`.
   Devuelve costo en USD ya calculado, no hace falta tabla de precios para esto.
7. **Code — resolver cliente + calcular costo Anthropic**
   Por cada fila de Anthropic: busca `cliente_id` por `api_key_id` (nodo 3). Busca en
   `modelos_precios` (traído antes con otro nodo Supabase, filtrando `vigente_desde <= fecha`
   y (`vigente_hasta is null` o `>= fecha`)) el precio del modelo. Calcula:
   `costo_usd = (tokens_entrada * precio_input + tokens_salida * precio_output +
   tokens_cache_5m * precio_cache_5m + tokens_cache_1h * precio_cache_1h +
   tokens_cache_lectura * precio_cache_lectura) / 1_000_000`.
8. **Code — resolver cliente OpenAI** — join por `api_key_id` contra `cliente_api_keys`
   (vigentes ese día), sin cálculo de costo (ya viene en USD desde la Costs API). Si el join
   devuelve **más de un cliente** para la misma `api_key_id` (caso NOA), dividir
   `costo_usd` del día **en partes iguales** entre todos esos clientes antes del upsert — no
   asumir que son siempre 2.
9. **Supabase: UPSERT `uso_diario_anthropic`** y **UPSERT `uso_diario_openai`**
   (`on_conflict` = las unique constraints de la migración). Usar
   `Prefer: resolution=merge-duplicates` en el header si se hace vía REST `POST`.
10. **IF — ¿es el primer día del mes?** → dispara la rama de conciliación mensual:
    - Suma `uso_diario_anthropic.costo_usd` del mes anterior por cliente.
    - Compara contra el total que dio la Anthropic Cost API ese mes (acumulado del nodo 5, o un
      pedido puntual `GET cost_report` con `starting_at`/`ending_at` = mes anterior completo).
    - UPSERT en `conciliacion_mensual_anthropic`. Si `diferencia_pct` supera
      `configuracion_alertas.conciliacion_tolerancia_pct`, INSERT en `alertas`
      (`tipo='diferencia_conciliacion'`).
11. **Code — calcular `costos_mensuales_cliente` del mes en curso**
    Por cada cliente activo: mensualidad vigente (última `cliente_mensualidades` con
    `vigente_desde <= hoy`), suma de `uso_diario_anthropic` + `uso_diario_openai` del mes,
    costo promedio ponderado USDC (`SELECT ... FROM v_costo_promedio_usdc ORDER BY fecha DESC
    LIMIT 1 WHERE fecha <= hoy`), prorrateo de costos fijos activos entre clientes activos.
    UPSERT en `costos_mensuales_cliente` (no tocar si `cerrado = true`).
12. **Code — chequeo de alertas**
    - `margen_pct < configuracion_alertas.margen_minimo_pct` → INSERT `alertas`
      (`tipo='margen_bajo'`).
    - Consumo de hoy vs. promedio móvil de los últimos 30 días en `uso_diario_anthropic` +
      `uso_diario_openai` por cliente → si supera `consumo_diario_desvio_pct` → INSERT `alertas`
      (`tipo='consumo_anomalo'`).
13. **HTTP Request — CriptoYa** (opcional, solo si se decide guardar histórico)
    `GET https://criptoya.com/api/ARQ/USDC/ARS/1` → INSERT en `cotizacion_criptoya_historial`.
    No se usa para ningún cálculo contable.

## Notas

- Todo el workflow es idempotente: correrlo dos veces el mismo día no duplica nada (upserts por
  las unique constraints de la migración).
- Las claves de Anthropic/OpenAI admin quedan únicamente como credenciales de n8n — nunca en el
  código del workflow ni en Supabase.
- Si se prefiere no depender de n8n, el mismo diseño se traduce 1 a 1 a una Supabase Edge
  Function + `pg_cron` (los nodos "Code" pasan a ser el cuerpo de la función en Deno).

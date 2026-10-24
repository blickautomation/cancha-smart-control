# Workflow n8n: sync diario Cancha Smart

Todavía no está creado en n8n — falta: (1) el proyecto Supabase (URL + service_role),
(2) una Anthropic Admin API key, (3) una OpenAI Admin key de solo lectura. En cuanto existan
los tres, este documento es la especificación exacta para construirlo (o pedírselo a Claude).

Corre 1 vez por día (ej. `0 7 * * *`, cron trigger). Procesa el día anterior completo (UTC-3:
Argentina) para que los contadores de uso ya estén cerrados del lado de Anthropic/OpenAI.

## Credenciales a crear en n8n

| Nombre sugerido | Tipo | De dónde sale |
|---|---|---|
| `Anthropic Admin API` | HTTP Header Auth (`x-api-key`) | console.anthropic.com → Organization → Admin API Keys (empieza con `sk-ant-admin...`) |
| `OpenAI Admin API (read-only)` | HTTP Header Auth (`Authorization: Bearer ...`) | platform.openai.com → Organization → Admin Keys, scope solo lectura de Usage/Costs |
| `Supabase Cancha Smart (service_role)` | HTTP Header Auth (`apikey` + `Authorization: Bearer ...`) | Supabase → Project Settings → API, una vez creado el proyecto nuevo |

## Nodos

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
8. **Code — resolver cliente OpenAI** — mismo join por `api_key_id`, sin cálculo (el costo ya
   viene en USD desde la Costs API).
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

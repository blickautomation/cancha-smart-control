-- Cancha Smart — Panel de Control
-- Migración inicial: esquema completo (clientes, keys, precios, uso diario,
-- conciliación, USDC, costos fijos, soporte, resultado mensual, alertas, cotización)

create extension if not exists "pgcrypto";

-- ============================================================
-- CLIENTES
-- ============================================================

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  pack text,
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'baja')),
  fecha_alta date not null default current_date,
  fecha_baja date,
  notas text,
  creado_en timestamptz not null default now()
);

comment on table public.clientes is 'Los complejos deportivos clientes de Cancha Smart.';

create table public.cliente_mensualidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  monto_ars numeric(12, 2) not null check (monto_ars >= 0),
  vigente_desde date not null,
  motivo text,
  creado_en timestamptz not null default now(),
  unique (cliente_id, vigente_desde)
);

comment on table public.cliente_mensualidades is 'Historial de mensualidad por cliente. El cálculo mensual usa el monto vigente ese mes, no el actual.';

create index idx_cliente_mensualidades_cliente_fecha
  on public.cliente_mensualidades (cliente_id, vigente_desde desc);

create table public.cliente_api_keys (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  proveedor text not null check (proveedor in ('anthropic', 'openai')),
  api_key_id text not null,
  alias text,
  vigente_desde date not null default current_date,
  vigente_hasta date,
  creado_en timestamptz not null default now(),
  constraint cliente_api_keys_rango_valido check (vigente_hasta is null or vigente_hasta >= vigente_desde)
);

comment on table public.cliente_api_keys is 'Mapeo api_key_id (Anthropic/OpenAI Admin API) -> cliente. Soporta rotación de key sin perder atribución histórica.';

create unique index idx_cliente_api_keys_unico_vigente
  on public.cliente_api_keys (proveedor, api_key_id)
  where vigente_hasta is null;

create index idx_cliente_api_keys_cliente on public.cliente_api_keys (cliente_id);

-- ============================================================
-- PRECIOS POR MODELO (editable desde la app)
-- ============================================================

create table public.modelos_precios (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null check (proveedor in ('anthropic', 'openai')),
  modelo text not null,
  vigente_desde date not null,
  vigente_hasta date,
  precio_input_usd_mtok numeric(12, 4),
  precio_output_usd_mtok numeric(12, 4),
  precio_cache_escritura_5m_usd_mtok numeric(12, 4),
  precio_cache_escritura_1h_usd_mtok numeric(12, 4),
  precio_cache_lectura_usd_mtok numeric(12, 4),
  notas text,
  creado_en timestamptz not null default now(),
  constraint modelos_precios_rango_valido check (vigente_hasta is null or vigente_hasta >= vigente_desde)
);

comment on table public.modelos_precios is 'Precios USD por millón de tokens por modelo y período de vigencia. Usada para calcular costo_usd en uso_diario_anthropic.';

create index idx_modelos_precios_modelo_fecha
  on public.modelos_precios (proveedor, modelo, vigente_desde desc);

-- ============================================================
-- USO DIARIO
-- ============================================================

create table public.uso_diario_anthropic (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  cliente_api_key_id uuid not null references public.cliente_api_keys(id) on delete restrict,
  fecha date not null,
  modelo text not null,
  tokens_entrada bigint not null default 0,
  tokens_salida bigint not null default 0,
  tokens_cache_escritura_5m bigint not null default 0,
  tokens_cache_escritura_1h bigint not null default 0,
  tokens_cache_lectura bigint not null default 0,
  costo_usd numeric(12, 6) not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (cliente_id, cliente_api_key_id, fecha, modelo)
);

comment on table public.uso_diario_anthropic is 'Uso diario desde la Anthropic Usage API, agrupado por api_key_id + modelo. costo_usd se calcula con modelos_precios.';

create index idx_uso_diario_anthropic_cliente_fecha
  on public.uso_diario_anthropic (cliente_id, fecha desc);

create table public.uso_diario_openai (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  cliente_api_key_id uuid not null references public.cliente_api_keys(id) on delete restrict,
  fecha date not null,
  costo_usd numeric(12, 6) not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (cliente_id, cliente_api_key_id, fecha)
);

comment on table public.uso_diario_openai is 'Costo diario reportado directamente por la OpenAI Costs API (transcripción de audios), agrupado por api_key_id.';

create index idx_uso_diario_openai_cliente_fecha
  on public.uso_diario_openai (cliente_id, fecha desc);

-- ============================================================
-- CONCILIACIÓN MENSUAL ANTHROPIC
-- ============================================================

create table public.conciliacion_mensual_anthropic (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  mes date not null,
  costo_calculado_usd numeric(12, 4) not null,
  costo_cost_api_usd numeric(12, 4) not null,
  diferencia_usd numeric(12, 4) generated always as (costo_cost_api_usd - costo_calculado_usd) stored,
  diferencia_pct numeric(8, 4) generated always as (
    case when costo_cost_api_usd = 0 then 0
    else round(((costo_cost_api_usd - costo_calculado_usd) / costo_cost_api_usd) * 100, 4) end
  ) stored,
  estado text not null default 'ok' check (estado in ('ok', 'alerta')),
  revisado boolean not null default false,
  creado_en timestamptz not null default now(),
  unique (cliente_id, mes)
);

comment on table public.conciliacion_mensual_anthropic is 'Compara lo calculado desde uso_diario_anthropic contra el total reportado por la Anthropic Cost API, por cliente y mes.';

-- ============================================================
-- USDC
-- ============================================================

create table public.conversiones_usdc (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  pesos_entregados numeric(14, 2) not null check (pesos_entregados > 0),
  usdc_recibidos numeric(14, 6) not null check (usdc_recibidos > 0),
  notas text,
  creado_en timestamptz not null default now()
);

comment on table public.conversiones_usdc is 'Compras de USDC con pesos (app ARQ). Base para el costo promedio ponderado.';

create index idx_conversiones_usdc_fecha on public.conversiones_usdc (fecha);

-- Vista: costo promedio ponderado acumulado a la fecha de cada conversión
-- (uso: SELECT costo_promedio_ars_por_usdc FROM v_costo_promedio_usdc WHERE fecha <= :corte ORDER BY fecha DESC LIMIT 1)
create view public.v_costo_promedio_usdc as
select
  fecha,
  sum(pesos_entregados) over (order by fecha, id) as pesos_acumulados,
  sum(usdc_recibidos) over (order by fecha, id) as usdc_acumulados,
  round(
    sum(pesos_entregados) over (order by fecha, id)
    / nullif(sum(usdc_recibidos) over (order by fecha, id), 0),
    4
  ) as costo_promedio_ars_por_usdc
from public.conversiones_usdc;

comment on view public.v_costo_promedio_usdc is 'Costo promedio ponderado ARS/USDC acumulado hasta cada fecha de conversión. Usar el último valor con fecha <= fecha de corte del mes.';

-- ============================================================
-- COSTOS FIJOS
-- ============================================================

create table public.costos_fijos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  moneda text not null check (moneda in ('ARS', 'USD')),
  monto numeric(14, 2) not null check (monto >= 0),
  periodicidad text not null check (periodicidad in ('mensual', 'anual', 'unica')),
  fecha_pago date,
  prorratear boolean not null default true,
  activo boolean not null default true,
  notas text,
  creado_en timestamptz not null default now()
);

comment on table public.costos_fijos is 'Costos fijos de la agencia (VPS, Supabase Pro, etc). periodicidad=anual se prorratea /12.';

create table public.costos_fijos_prorrateo (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  mes date not null,
  monto_ars numeric(12, 2) not null,
  detalle jsonb,
  creado_en timestamptz not null default now(),
  unique (cliente_id, mes)
);

comment on table public.costos_fijos_prorrateo is 'Snapshot mensual de cuánto le tocó a cada cliente de los costos fijos prorrateados. No se recalcula retroactivo si cambia la cantidad de clientes activos.';

-- ============================================================
-- SOPORTE
-- ============================================================

create table public.horas_soporte (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  fecha date not null default current_date,
  horas numeric(6, 2) not null check (horas > 0),
  descripcion text,
  creado_en timestamptz not null default now()
);

create index idx_horas_soporte_cliente_fecha on public.horas_soporte (cliente_id, fecha desc);

-- ============================================================
-- RESULTADO MENSUAL (lo que lee el dashboard)
-- ============================================================

create table public.costos_mensuales_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  mes date not null,
  mensualidad_ars numeric(12, 2) not null,
  costo_apis_usd numeric(12, 4) not null default 0,
  costo_promedio_usdc_usado numeric(12, 4) not null,
  costo_apis_ars numeric(12, 2) generated always as (round(costo_apis_usd * costo_promedio_usdc_usado, 2)) stored,
  costo_fijo_prorrateado_ars numeric(12, 2) not null default 0,
  costo_total_ars numeric(12, 2) generated always as (
    round(costo_apis_usd * costo_promedio_usdc_usado, 2) + costo_fijo_prorrateado_ars
  ) stored,
  ganancia_ars numeric(12, 2) generated always as (
    mensualidad_ars - (round(costo_apis_usd * costo_promedio_usdc_usado, 2) + costo_fijo_prorrateado_ars)
  ) stored,
  margen_pct numeric(7, 2) generated always as (
    case when mensualidad_ars = 0 then 0
    else round(
      ((mensualidad_ars - (round(costo_apis_usd * costo_promedio_usdc_usado, 2) + costo_fijo_prorrateado_ars)) / mensualidad_ars) * 100,
      2
    ) end
  ) stored,
  cerrado boolean not null default false,
  calculado_en timestamptz not null default now(),
  unique (cliente_id, mes)
);

comment on table public.costos_mensuales_cliente is 'Resultado mensual materializado por cliente: costo, ganancia y margen. Tabla principal que lee el dashboard.';

create index idx_costos_mensuales_cliente_mes on public.costos_mensuales_cliente (mes desc);

-- ============================================================
-- ALERTAS
-- ============================================================

create table public.configuracion_alertas (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  valor numeric not null,
  descripcion text,
  actualizado_en timestamptz not null default now()
);

comment on table public.configuracion_alertas is 'Umbrales configurables: margen_minimo_pct, consumo_diario_desvio_pct, conciliacion_tolerancia_pct.';

insert into public.configuracion_alertas (clave, valor, descripcion) values
  ('margen_minimo_pct', 30, 'Margen % mínimo aceptable por cliente/mes antes de alertar'),
  ('consumo_diario_desvio_pct', 150, 'Consumo diario que supera este % del promedio móvil dispara alerta'),
  ('conciliacion_tolerancia_pct', 2, 'Diferencia % tolerada entre lo calculado y la Anthropic Cost API');

create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('margen_bajo', 'consumo_anomalo', 'diferencia_conciliacion')),
  cliente_id uuid references public.clientes(id) on delete cascade,
  mes date,
  fecha date not null default current_date,
  severidad text not null default 'warning' check (severidad in ('info', 'warning', 'critical')),
  mensaje text not null,
  datos jsonb,
  vista boolean not null default false,
  creado_en timestamptz not null default now()
);

create index idx_alertas_vista on public.alertas (vista, creado_en desc);

-- ============================================================
-- COTIZACIÓN EN VIVO (solo referencia, histórico opcional para sparkline)
-- ============================================================

create table public.cotizacion_criptoya_historial (
  id uuid primary key default gen_random_uuid(),
  fecha_hora timestamptz not null default now(),
  par text not null default 'USDC/ARS',
  compra numeric(12, 2),
  venta numeric(12, 2),
  fuente text not null default 'criptoya',
  creado_en timestamptz not null default now()
);

-- ============================================================
-- RLS — single-user: sin policies públicas, acceso solo vía service_role
-- (mismo patrón que publicaciones-ig)
-- ============================================================

alter table public.clientes enable row level security;
alter table public.cliente_mensualidades enable row level security;
alter table public.cliente_api_keys enable row level security;
alter table public.modelos_precios enable row level security;
alter table public.uso_diario_anthropic enable row level security;
alter table public.uso_diario_openai enable row level security;
alter table public.conciliacion_mensual_anthropic enable row level security;
alter table public.conversiones_usdc enable row level security;
alter table public.costos_fijos enable row level security;
alter table public.costos_fijos_prorrateo enable row level security;
alter table public.horas_soporte enable row level security;
alter table public.costos_mensuales_cliente enable row level security;
alter table public.configuracion_alertas enable row level security;
alter table public.alertas enable row level security;
alter table public.cotizacion_criptoya_historial enable row level security;

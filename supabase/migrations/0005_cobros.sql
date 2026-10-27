-- Cancha Smart - Panel de Control
-- Migracion 0005: fechas de cobro. Dia de cobro por cliente + un cobro por cliente y mes.

alter table public.clientes
  add column if not exists dia_cobro smallint check (dia_cobro between 1 and 28);

comment on column public.clientes.dia_cobro is 'Dia del mes (1-28) en que el cliente debe pagar la mensualidad.';

create table if not exists public.cobros (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  mes date not null,
  fecha_vencimiento date not null,
  monto_esperado_ars numeric(12, 2) not null check (monto_esperado_ars >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado')),
  monto_pagado_ars numeric(12, 2),
  fecha_pago date,
  creado_en timestamptz not null default now(),
  unique (cliente_id, mes)
);

comment on table public.cobros is 'Un cobro por cliente y mes. "Vencido" no se guarda: se calcula (pendiente y fecha_vencimiento < hoy).';

create index if not exists idx_cobros_mes on public.cobros (mes desc);

alter table public.cobros enable row level security;

grant select, insert, update, delete on public.cobros to service_role;

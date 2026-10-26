-- Cancha Smart - Panel de Control
-- Migracion 0004: vista de costo diario combinado (Anthropic + OpenAI) por cliente.
-- La usan el calculo de costos_mensuales_cliente y la deteccion de consumo anomalo.

create view public.v_costo_diario_cliente as
select cliente_id, fecha, sum(costo_usd) as costo_usd
from (
  select cliente_id, fecha, costo_usd from public.uso_diario_anthropic
  union all
  select cliente_id, fecha, costo_usd from public.uso_diario_openai
) u
group by cliente_id, fecha;

comment on view public.v_costo_diario_cliente is 'Costo diario combinado (Anthropic + OpenAI) por cliente. Usado para costos_mensuales_cliente y para detectar consumo anomalo.';

grant select on public.v_costo_diario_cliente to service_role;

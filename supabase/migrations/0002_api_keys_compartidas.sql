-- Cancha Smart — Panel de Control
-- Migración 0002: permitir que una misma api_key_id (proveedor) esté vigente
-- para más de un cliente a la vez.
--
-- Caso real: NOA tiene dos bots (Padel NOA y Club NOA), cada uno con su propia
-- Anthropic key, pero comparten una sola OpenAI key de transcripción. El
-- constraint original asumía 1 key activa = 1 cliente; eso ya no vale.
--
-- Convención de sync: cuando una api_key_id tenga más de un cliente_api_keys
-- vigente ese día, el costo diario de esa key se reparte en partes iguales
-- entre esos clientes (N-way split). Ver n8n/sync-diario.md.

drop index if exists public.idx_cliente_api_keys_unico_vigente;

create index if not exists idx_cliente_api_keys_proveedor_key
  on public.cliente_api_keys (proveedor, api_key_id);

comment on table public.cliente_api_keys is 'Mapeo api_key_id (Anthropic/OpenAI Admin API) -> cliente. Soporta rotación de key y, para OpenAI, keys compartidas entre varios clientes (N-way split en el sync).';

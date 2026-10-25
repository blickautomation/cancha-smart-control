-- Cancha Smart - Panel de Control
-- Migracion 0003: otorgar privilegios a service_role sobre el esquema public.
--
-- Al crear el proyecto se desactivo "Automatically expose new tables" (por seguridad,
-- para controlar el acceso manualmente). Ese toggle tambien controla los GRANTs que
-- Supabase aplica automaticamente a anon/authenticated/service_role sobre tablas nuevas -
-- al desactivarlo, service_role se quedo SIN privilegios sobre las tablas, no solo anon.
-- service_role bypassea RLS pero NO bypassea GRANTs faltantes a nivel de Postgres.
--
-- anon/authenticated siguen sin nada: RLS esta activo sin policies en todas las tablas,
-- asi que aunque tuvieran grants seguirian sin poder leer/escribir filas.

grant usage on schema public to service_role;

grant select, insert, update, delete on all tables in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

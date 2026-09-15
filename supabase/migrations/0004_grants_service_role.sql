-- O role "service_role" (usado pela chave de serviço, em ./lib/supabase/admin.ts)
-- ignora as políticas RLS, mas continua a precisar de GRANT nas tabelas —
-- tal como aconteceu com anon/authenticated em 0003_grants.sql. Sem isto dá
-- sempre "permission denied for table X", mesmo com a chave de serviço certa.
grant usage on schema public to service_role;

grant all on public.categorias to service_role;
grant all on public.etiquetas to service_role;
grant all on public.artigos to service_role;
grant all on public.artigos_etiquetas to service_role;
grant all on public.subscritores to service_role;
grant all on public.comentarios to service_role;
grant all on public.comentarios_publicos to service_role;
grant all on public.leads to service_role;
grant all on public.leads_envios to service_role;
grant all on public.definicoes_site to service_role;
grant all on public.categorias_material to service_role;
grant all on public.pessoas_apagadas to service_role;
grant all on public.admins to service_role;

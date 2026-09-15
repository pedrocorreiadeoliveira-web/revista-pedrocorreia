-- Concede às funções "anon" e "authenticated" o acesso de base às tabelas.
-- As políticas RLS de cada tabela continuam a decidir quem vê ou altera o quê
-- — isto só garante que o Supabase as deixa tentar, para as políticas
-- entrarem em jogo. Sem isto, dá sempre "permission denied", mesmo com RLS
-- correto.
grant usage on schema public to anon, authenticated;

grant select on public.categorias to anon, authenticated;
grant select, insert, update, delete on public.categorias to authenticated;

grant select on public.etiquetas to anon, authenticated;
grant select, insert, update, delete on public.etiquetas to authenticated;

grant select on public.artigos to anon, authenticated;
grant select, insert, update, delete on public.artigos to authenticated;

grant select on public.artigos_etiquetas to anon, authenticated;
grant select, insert, update, delete on public.artigos_etiquetas to authenticated;

grant insert on public.subscritores to anon;
grant select, insert, update, delete on public.subscritores to authenticated;

grant insert on public.comentarios to anon;
grant select, insert, update, delete on public.comentarios to authenticated;

grant select on public.comentarios_publicos to anon, authenticated;

grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.leads_envios to authenticated;

grant select on public.definicoes_site to anon, authenticated;
grant update on public.definicoes_site to authenticated;

grant select on public.categorias_material to anon, authenticated;
grant select, insert, update, delete on public.categorias_material to authenticated;

grant select, insert, update, delete on public.pessoas_apagadas to authenticated;

-- A tabela admins não é exposta — sem grants para anon/authenticated de propósito.

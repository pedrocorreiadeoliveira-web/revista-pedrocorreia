-- Revista do Pedro Correia de Oliveira — schema inicial
-- Corre este ficheiro (e o seguinte, 0002) no SQL Editor do Supabase, por ordem.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Lista de administradores
-- ---------------------------------------------------------------------------
-- As políticas RLS abaixo autorizam escrita apenas a quem tiver sessão e cujo
-- email conste nesta tabela. O mesmo email tem também de estar na variável de
-- ambiente ADMIN_EMAILS (Vercel), que é o que a aplicação usa para decidir
-- quem pode pedir o link de entrada. As duas listas têm de coincidir — ver
-- README.md, secção "Administradores".
--
-- (Uma versão anterior desta migração tentava guardar isto com
-- `alter database ... set app.admin_emails = ...`, mas o Supabase gerido não
-- dá esse privilégio nem ao role "postgres" — daí a tabela.)
create table if not exists public.admins (
  email text primary key
);

alter table public.admins enable row level security;

-- Ninguém lê nem escreve esta tabela por API — só a própria função is_admin(),
-- que corre com os privilégios de quem a definiu (security definer).
drop policy if exists "sem acesso direto a admins" on public.admins;
create policy "sem acesso direto a admins" on public.admins
  for all using (false) with check (false);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where email = (auth.jwt() ->> 'email')
  );
$$;

-- ---------------------------------------------------------------------------
-- categorias
-- ---------------------------------------------------------------------------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  descricao text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

alter table public.categorias enable row level security;

drop policy if exists "leitura publica categorias" on public.categorias;
create policy "leitura publica categorias" on public.categorias
  for select using (true);

drop policy if exists "gestao categorias por admin" on public.categorias;
create policy "gestao categorias por admin" on public.categorias
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- etiquetas
-- ---------------------------------------------------------------------------
create table if not exists public.etiquetas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null
);

alter table public.etiquetas enable row level security;

drop policy if exists "leitura publica etiquetas" on public.etiquetas;
create policy "leitura publica etiquetas" on public.etiquetas
  for select using (true);

drop policy if exists "gestao etiquetas por admin" on public.etiquetas;
create policy "gestao etiquetas por admin" on public.etiquetas
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- artigos
-- ---------------------------------------------------------------------------
create table if not exists public.artigos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  subtitulo text,
  resumo text,
  conteudo jsonb not null default '{}'::jsonb,
  conteudo_html text not null default '',
  imagem_capa text,
  imagem_capa_alt text,
  categoria_id uuid references public.categorias(id) on delete set null,
  estado text not null default 'rascunho' check (estado in ('rascunho', 'publicado')),
  publicado_em timestamptz,
  tempo_leitura int,
  seo_titulo text,
  seo_descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists artigos_slug_idx on public.artigos (slug);
create index if not exists artigos_estado_idx on public.artigos (estado);
create index if not exists artigos_publicado_em_idx on public.artigos (publicado_em);
create index if not exists artigos_categoria_idx on public.artigos (categoria_id);

alter table public.artigos enable row level security;

drop policy if exists "leitura publica artigos publicados" on public.artigos;
create policy "leitura publica artigos publicados" on public.artigos
  for select using (estado = 'publicado' and publicado_em <= now());

drop policy if exists "leitura de todos os artigos por admin" on public.artigos;
create policy "leitura de todos os artigos por admin" on public.artigos
  for select using (public.is_admin());

drop policy if exists "gestao artigos por admin" on public.artigos;
create policy "gestao artigos por admin" on public.artigos
  for insert with check (public.is_admin());

drop policy if exists "atualizacao artigos por admin" on public.artigos;
create policy "atualizacao artigos por admin" on public.artigos
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "apagar artigos por admin" on public.artigos;
create policy "apagar artigos por admin" on public.artigos
  for delete using (public.is_admin());

create or replace function public.artigos_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_artigos_atualizado_em on public.artigos;
create trigger trg_artigos_atualizado_em
  before update on public.artigos
  for each row execute function public.artigos_atualizado_em();

-- ---------------------------------------------------------------------------
-- artigos_etiquetas (ligação)
-- ---------------------------------------------------------------------------
create table if not exists public.artigos_etiquetas (
  artigo_id uuid not null references public.artigos(id) on delete cascade,
  etiqueta_id uuid not null references public.etiquetas(id) on delete cascade,
  primary key (artigo_id, etiqueta_id)
);

alter table public.artigos_etiquetas enable row level security;

drop policy if exists "leitura publica artigos_etiquetas" on public.artigos_etiquetas;
create policy "leitura publica artigos_etiquetas" on public.artigos_etiquetas
  for select using (true);

drop policy if exists "gestao artigos_etiquetas por admin" on public.artigos_etiquetas;
create policy "gestao artigos_etiquetas por admin" on public.artigos_etiquetas
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- subscritores
-- ---------------------------------------------------------------------------
create table if not exists public.subscritores (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  criado_em timestamptz not null default now(),
  origem text
);

alter table public.subscritores enable row level security;

drop policy if exists "subscricao publica" on public.subscritores;
create policy "subscricao publica" on public.subscritores
  for insert with check (true);

drop policy if exists "leitura subscritores por admin" on public.subscritores;
create policy "leitura subscritores por admin" on public.subscritores
  for select using (public.is_admin());

drop policy if exists "gestao subscritores por admin" on public.subscritores;
create policy "gestao subscritores por admin" on public.subscritores
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "apagar subscritores por admin" on public.subscritores;
create policy "apagar subscritores por admin" on public.subscritores
  for delete using (public.is_admin());

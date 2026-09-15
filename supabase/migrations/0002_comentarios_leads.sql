-- Revista do Pedro Correia de Oliveira — comentários, leads e definições
-- Corre depois de 0001_init.sql.

-- ---------------------------------------------------------------------------
-- comentarios
-- ---------------------------------------------------------------------------
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  artigo_id uuid not null references public.artigos(id) on delete cascade,
  nome text not null,
  email text not null,
  corpo text not null,
  estado text not null default 'pendente' check (estado in ('pendente', 'aprovado', 'recusado', 'spam')),
  consentimento_marketing boolean not null default false,
  ip_hash text,
  user_agent text,
  criado_em timestamptz not null default now(),
  aprovado_em timestamptz,
  resposta_admin text,
  comentario_pai_id uuid references public.comentarios(id) on delete cascade
);

create index if not exists comentarios_artigo_idx on public.comentarios (artigo_id);
create index if not exists comentarios_estado_idx on public.comentarios (estado);

alter table public.comentarios enable row level security;

drop policy if exists "qualquer pessoa pode comentar" on public.comentarios;
create policy "qualquer pessoa pode comentar" on public.comentarios
  for insert with check (true);

drop policy if exists "leitura publica de comentarios aprovados" on public.comentarios;
create policy "leitura publica de comentarios aprovados" on public.comentarios
  for select using (estado = 'aprovado');

drop policy if exists "leitura de todos os comentarios por admin" on public.comentarios;
create policy "leitura de todos os comentarios por admin" on public.comentarios
  for select using (public.is_admin());

drop policy if exists "gestao comentarios por admin" on public.comentarios;
create policy "gestao comentarios por admin" on public.comentarios
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "apagar comentarios por admin" on public.comentarios;
create policy "apagar comentarios por admin" on public.comentarios
  for delete using (public.is_admin());

-- Uma vista pública que nunca expõe o email, para a API de leitura de
-- comentários aprovados usar em vez da tabela diretamente.
create or replace view public.comentarios_publicos as
  select id, artigo_id, nome, corpo, criado_em, resposta_admin, comentario_pai_id
  from public.comentarios
  where estado = 'aprovado';

grant select on public.comentarios_publicos to anon, authenticated;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nome text,
  origem text not null check (origem in ('comentario', 'subscricao', 'ebook')),
  artigo_id uuid references public.artigos(id) on delete set null,
  categoria_de_interesse uuid references public.categorias(id) on delete set null,
  estado_envio text not null default 'pendente',
  consentimento boolean not null default false,
  consentimento_em timestamptz,
  criado_em timestamptz not null default now()
);

create index if not exists leads_estado_envio_idx on public.leads (estado_envio);
create index if not exists leads_origem_idx on public.leads (origem);

alter table public.leads enable row level security;

drop policy if exists "gestao leads por admin" on public.leads;
create policy "gestao leads por admin" on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- leads_envios (histórico de tentativas de envio ao CRM)
-- ---------------------------------------------------------------------------
create table if not exists public.leads_envios (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tentativa int not null default 1,
  sucesso boolean not null default false,
  resposta text,
  criado_em timestamptz not null default now()
);

create index if not exists leads_envios_lead_idx on public.leads_envios (lead_id);

alter table public.leads_envios enable row level security;

drop policy if exists "gestao leads_envios por admin" on public.leads_envios;
create policy "gestao leads_envios por admin" on public.leads_envios
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- definicoes_site — textos editáveis do bloco de conversão (singleton)
-- ---------------------------------------------------------------------------
create table if not exists public.definicoes_site (
  id boolean primary key default true,
  cta_frase text not null default 'Se algo aqui te tocou, provavelmente não é por acaso.',
  cta_apoio text not null default 'Trabalho com quem quer encurtar essa distância.',
  constraint definicoes_site_singleton check (id = true)
);

insert into public.definicoes_site (id) values (true)
on conflict (id) do nothing;

alter table public.definicoes_site enable row level security;

drop policy if exists "leitura publica definicoes_site" on public.definicoes_site;
create policy "leitura publica definicoes_site" on public.definicoes_site
  for select using (true);

drop policy if exists "gestao definicoes_site por admin" on public.definicoes_site;
create policy "gestao definicoes_site por admin" on public.definicoes_site
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- categorias_material — material de oferta (lead magnet) por categoria
-- ---------------------------------------------------------------------------
create table if not exists public.categorias_material (
  categoria_id uuid primary key references public.categorias(id) on delete cascade,
  titulo text not null,
  ficheiro_url text not null,
  atualizado_em timestamptz not null default now()
);

alter table public.categorias_material enable row level security;

drop policy if exists "leitura publica categorias_material" on public.categorias_material;
create policy "leitura publica categorias_material" on public.categorias_material
  for select using (true);

drop policy if exists "gestao categorias_material por admin" on public.categorias_material;
create policy "gestao categorias_material por admin" on public.categorias_material
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- pessoas_apagadas — registo de pedidos de eliminação (RGPD), sem dados pessoais
-- ---------------------------------------------------------------------------
create table if not exists public.pessoas_apagadas (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  apagado_em timestamptz not null default now()
);

alter table public.pessoas_apagadas enable row level security;

drop policy if exists "gestao pessoas_apagadas por admin" on public.pessoas_apagadas;
create policy "gestao pessoas_apagadas por admin" on public.pessoas_apagadas
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket público "media"
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "leitura publica bucket media" on storage.objects;
create policy "leitura publica bucket media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "upload bucket media por admin" on storage.objects;
create policy "upload bucket media por admin" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "gestao bucket media por admin" on storage.objects;
create policy "gestao bucket media por admin" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "apagar bucket media por admin" on storage.objects;
create policy "apagar bucket media por admin" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

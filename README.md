# Revista — Pedro Correia de Oliveira

Este ficheiro explica, passo a passo e em português simples, como pôr esta
revista a funcionar do zero: criar o Supabase, ligar as chaves, publicar na
Vercel e ligar o subdomínio. Não precisas de saber programar para seguir
isto — só de ir copiando e colando o que se pede.

Para o dia a dia de escrever e publicar artigos, o documento que precisas é
o [`COMO-PUBLICAR.md`](./COMO-PUBLICAR.md), não este.

## 1. Criar o projeto Supabase

O Supabase é a base de dados e o sistema de login desta revista.

1. Entra em [supabase.com](https://supabase.com) e cria uma conta (ou usa a
   que já tens).
2. **New project** → escolhe um nome (ex: "revista") e uma palavra-passe
   para a base de dados (guarda-a nalgum lado seguro — não é a mesma coisa
   que as chaves API que vêm a seguir).
3. Espera um minuto ou dois até o projeto ficar pronto.

## 2. Copiar as chaves para o `.env.local`

1. Copia o ficheiro `.env.example` para um novo ficheiro chamado `.env.local`
   (na mesma pasta).
2. No painel do Supabase, vai a **Project Settings → API Keys**.
3. Copia:
   - o **Project URL** → cola em `NEXT_PUBLIC_SUPABASE_URL`
   - a chave **publishable** (ou "anon public", consoante a versão do
     painel) → cola em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - a chave **secret** (ou "service_role") → cola em
     `SUPABASE_SERVICE_ROLE_KEY`. **Esta chave é secreta — nunca a partilhes,
     nunca a publiques num repositório público.**

As outras variáveis do `.env.local` (Resend, CRM, etc.) explico-as mais
abaixo, nas secções correspondentes — não são precisas já para começar.

## 3. Correr as migrações (criar as tabelas)

As migrações são ficheiros SQL que criam as tabelas da revista. Ficam em
`supabase/migrations/`, numerados por ordem — têm de correr **por essa
ordem**, um de cada vez:

1. `0001_init.sql`
2. `0002_comentarios_leads.sql`
3. `0003_grants.sql`
4. `0004_grants_service_role.sql`

Para cada um:

1. No painel do Supabase, vai a **SQL Editor** → **New query**.
2. Abre o ficheiro no teu computador, copia todo o conteúdo.
3. Cola no editor do Supabase e clica **Run**.
4. Confirma que diz "Success" antes de passares ao ficheiro seguinte.

> **Importante sobre acentos**: se algum dia precisares de colar SQL com
> texto em português (títulos, textos) diretamente no editor do Supabase,
> tem cuidado — nalgumas configurações de Mac, copiar texto acentuado para
> a área de transferência e colar num site pode trocar as letras
> acentuadas por símbolos estranhos (ex: "não" vira "n√£o"). Os ficheiros
> de migração em si não têm este problema porque não têm texto em
> português dentro (só nomes técnicos). Se precisares de inserir textos
> longos com acentos por SQL, confirma sempre o resultado depois, olhando
> para a página a sério.

Depois de correres as 4 migrações, podes (opcional, mas recomendado para
veres a revista com conteúdo) correr também o `supabase/seed.sql` da mesma
forma — cria 3 categorias e 2 artigos de exemplo que podes editar ou apagar
mais tarde.

## 4. Criar o bucket de imagens/vídeos

A migração `0002` já cria o bucket chamado `media` automaticamente — não
precisas de fazer nada aqui. Só para confirmares: no painel do Supabase,
vai a **Storage** e verifica que existe um bucket chamado `media`, marcado
como público.

## 5. Criar a tua conta de administrador

Só quem estiver nestas duas listas consegue entrar no painel — **as duas
têm de ter o mesmo email**:

1. **Na aplicação**: no `.env.local` (e mais tarde, na Vercel), define
   `ADMIN_EMAILS=teu-email@exemplo.com` (se forem vários emails, separa por
   vírgula, sem espaços).
2. **Na base de dados**: no SQL Editor do Supabase, corre (troca o email
   pelo teu):

   ```sql
   insert into public.admins (email) values ('teu-email@exemplo.com');
   ```

3. Ainda no Supabase, vai a **Authentication → Sign In / Providers** e
   confirma que o "Email" (magic link / OTP) está ativado — costuma vir
   ativado por omissão.
4. Vai a **Authentication → URL Configuration → Redirect URLs** e adiciona
   o endereço `http://localhost:3000/auth/callback` (para testares no teu
   computador) e, mais tarde, o endereço definitivo em produção (ex:
   `https://revista.pedrocorreiaoficial.pt/auth/callback`).

## 6. Correr localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000/entrar`, escreve o teu email (o mesmo das duas
listas acima) e vais receber um email com uma ligação — abre-a **no mesmo
computador** onde o `npm run dev` está a correr. Cais em `/painel`.

## 7. Publicar na Vercel

1. Cria uma conta em [vercel.com](https://vercel.com) se ainda não tiveres.
2. Liga o repositório deste projeto ao GitHub (se ainda não estiver lá) e
   depois **Import Project** na Vercel, apontando para esse repositório.
3. Em **Environment Variables**, copia para lá todas as variáveis do teu
   `.env.local` — uma a uma, com os mesmos nomes e valores. Não esqueças de
   ajustar `NEXT_PUBLIC_SITE_URL` para o endereço definitivo (a seguir).
4. Clica **Deploy**.

## 8. Ligar o subdomínio (Amen → Vercel)

O domínio principal (`pedrocorreiaoficial.pt`) está na Amen e **não se
mexe**. Esta revista fica num subdomínio à parte — por exemplo
`revista.pedrocorreiaoficial.pt`.

1. **Na Vercel**: abre o projeto → **Settings → Domains** → escreve o
   subdomínio completo (ex: `revista.pedrocorreiaoficial.pt`) → **Add**. A
   Vercel mostra-te um registo para adicionares na Amen (normalmente um
   `CNAME` a apontar para `cname.vercel-dns.com`).
2. **Na Amen**: entra na gestão de DNS do domínio, e adiciona um registo:
   - **Tipo**: CNAME
   - **Nome/Anfitrião**: `revista` (ou o nome que escolheres para o
     subdomínio)
   - **Valor/Aponta para**: o endereço que a Vercel te deu (ex:
     `cname.vercel-dns.com`)
   - Guarda.
3. **Tempo de propagação**: normalmente entre alguns minutos e algumas
   horas (raramente até 24h). Não é preciso fazer nada durante esse tempo,
   só esperar.
4. **Confirmar que o certificado ficou ativo**: volta a **Vercel → Settings
   → Domains** — quando o subdomínio aparecer com um visto verde ("Valid
   Configuration") e sem avisos, está pronto, com HTTPS automático. Se
   passarem mais de 45 minutos e continuar por confirmar, tenta remover e
   voltar a adicionar o domínio na Vercel — às vezes o certificado fica
   preso e isso desbloqueia.
5. Por fim, atualiza `NEXT_PUBLIC_SITE_URL` nas variáveis de ambiente da
   Vercel para `https://revista.pedrocorreiaoficial.pt` (ou o subdomínio
   que escolheste), e adiciona esse mesmo endereço + `/auth/callback` nos
   **Redirect URLs** do Supabase (passo 5.4 acima).

## 9. Ligar as notificações por email (opcional, mas recomendado)

Para receberes um email sempre que alguém comenta um artigo:

1. Cria uma conta grátis em [resend.com](https://resend.com).
2. Cria uma **API Key** e cola-a em `RESEND_API_KEY`.
3. Define `ADMIN_EMAIL` com o teu email (é para onde vão as notificações).
4. Sem uma conta Resend verificada com domínio próprio, os emails saem de
   `onboarding@resend.dev` — funciona para começar, mas mete rótulo de
   remetente estranho. Quando quiseres, verifica o teu domínio no Resend
   para os emails saírem de um endereço teu.

## 10. Ligar a um CRM (opcional)

Por omissão, `CRM_PROVIDER=nenhum` — as leads só ficam guardadas na base de
dados, em `/painel/leads`.

Se tiveres um CRM que aceite receber dados por um endereço de webhook
(Zapier, Make, ou outro):

1. Define `CRM_PROVIDER=webhook`.
2. Cola o endereço do teu webhook em `CRM_WEBHOOK_URL`.
3. Se esse webhook pedir uma chave/segredo para autenticar o pedido, cola-a
   em `CRM_WEBHOOK_SECRET` (opcional).

## Administradores — lembrete importante

A lista de quem pode entrar no painel vive em **dois sítios em simultâneo**,
e têm de estar sempre sincronizados:

- `ADMIN_EMAILS` nas variáveis de ambiente (local e Vercel).
- A tabela `public.admins` na base de dados (ver passo 5).

Se um dia adicionares ou removeres um administrador, faz as duas alterações.

## Estrutura do projeto (para referência)

- `supabase/migrations/` — o esquema da base de dados, por ordem.
- `supabase/seed.sql` — conteúdo de exemplo, opcional.
- `src/app/(publico)/` — o site que toda a gente vê.
- `src/app/painel/` — o painel de administração (protegido por login).
- `src/lib/crm/` — a ligação a um CRM externo, pensada para se poder trocar
  de fornecedor sem mexer no resto do código.

<!-- deploy trigger -->

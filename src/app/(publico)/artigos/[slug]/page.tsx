import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { obterArtigoPorSlug, obterRelacionados } from "@/lib/dados-publicos";
import { ArtigoLeitura } from "@/components/artigo-leitura";
import { BlocoConversao } from "@/components/bloco-conversao";
import { FormularioSubscricao } from "@/components/formulario-subscricao";
import { BotoesPartilha } from "@/components/botoes-partilha";
import { FormularioComentario } from "@/components/formulario-comentario";
import { ListaComentarios } from "@/components/lista-comentarios";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await obterArtigoPorSlug(slug);
  if (!artigo || artigo.estado !== "publicado") return {};

  const titulo = artigo.seo_titulo || artigo.titulo;
  const descricao = artigo.seo_descricao || artigo.resumo || undefined;

  return {
    title: `${titulo} — Revista`,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      type: "article",
    },
  };
}

function formatarDataIso(iso: string | null) {
  return iso ? new Date(iso).toISOString() : undefined;
}

export default async function PaginaArtigo({ params }: Props) {
  const { slug } = await params;
  const artigo = await obterArtigoPorSlug(slug);

  if (!artigo || artigo.estado !== "publicado") notFound();

  const relacionados = await obterRelacionados(artigo.categoria_id, artigo.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const urlArtigo = `${siteUrl}/artigos/${artigo.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artigo.titulo,
    description: artigo.resumo ?? undefined,
    image: artigo.imagem_capa ?? undefined,
    datePublished: formatarDataIso(artigo.publicado_em),
    dateModified: formatarDataIso(artigo.atualizado_em),
    author: { "@type": "Person", name: "Pedro Correia de Oliveira" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArtigoLeitura
        titulo={artigo.titulo}
        subtitulo={artigo.subtitulo}
        dataPublicacao={artigo.publicado_em}
        tempoLeitura={artigo.tempo_leitura}
        imagemCapa={artigo.imagem_capa}
        imagemCapaAlt={artigo.imagem_capa_alt}
        corpoHtml={artigo.conteudo_html}
      />

      <div className="max-w-[42rem] mx-auto px-6 pb-16">
        <BotoesPartilha titulo={artigo.titulo} url={urlArtigo} />
      </div>

      {relacionados.length > 0 && (
        <section className="max-w-[42rem] mx-auto px-6 pb-16">
          <h2 className="font-tecnico text-xs tracking-wide text-gray pb-2 border-b border-ink/15 mb-6">
            Continuar a ler
          </h2>
          <ul>
            {relacionados.map((r) => (
              <li key={r.id} className="border-b border-ink/10 py-4">
                <Link href={`/artigos/${r.slug}`} className="font-literario text-lg hover:text-gold-2">
                  {r.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="comentarios" className="max-w-[42rem] mx-auto px-6 pb-16">
        <h2 className="font-tecnico text-xs tracking-wide text-gray pb-2 border-b border-ink/15 mb-6">
          Comentários
        </h2>
        <ListaComentarios artigoId={artigo.id} />
        <FormularioComentario artigoId={artigo.id} />
      </section>

      <section className="max-w-[42rem] mx-auto px-6 pb-16">
        <h2 className="font-literario text-xl mb-3">Recebe os próximos textos por email</h2>
        <FormularioSubscricao artigoId={artigo.id} />
      </section>

      <BlocoConversao />
    </>
  );
}

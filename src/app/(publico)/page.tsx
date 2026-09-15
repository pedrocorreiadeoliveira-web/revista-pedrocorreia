import Link from "next/link";
import type { Metadata } from "next";
import { obterArtigosPublicados, obterCategorias } from "@/lib/dados-publicos";
import type { ArtigoResumo } from "@/lib/dados-publicos";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Revista — Pedro Correia de Oliveira",
  description:
    "Artigos sobre limites, relações, autoestima e a distância entre quem somos e quem dizemos ser.",
};

function formatarData(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PaginaInicial() {
  const [artigos, categorias] = await Promise.all([obterArtigosPublicados(), obterCategorias()]);

  const destaque = artigos[0];
  const restantes = artigos.slice(1);

  const grupos = categorias
    .map((categoria) => ({
      categoria,
      artigos: restantes.filter((a) => a.categorias?.id === categoria.id),
    }))
    .filter((g) => g.artigos.length > 0);

  const semCategoria = restantes.filter((a) => !a.categorias);

  return (
    <>
      {destaque && (
        <section className="bg-ink text-paper px-6 py-20">
          <div className="max-w-3xl mx-auto">
            {destaque.categorias && (
              <p className="font-tecnico text-xs tracking-wide text-gold-2 mb-4">
                {destaque.categorias.nome}
              </p>
            )}
            <Link href={`/artigos/${destaque.slug}`} className="block group">
              <h1 className="font-literario font-semibold text-4xl sm:text-5xl leading-tight mb-4 group-hover:text-gold-2 transition-colors">
                {destaque.titulo}
              </h1>
            </Link>
            {destaque.subtitulo && (
              <p className="font-literario text-xl text-paper/70 mb-6">{destaque.subtitulo}</p>
            )}
            <p className="font-tecnico text-xs text-paper/50">
              {formatarData(destaque.publicado_em)}
              {destaque.tempo_leitura ? ` · ${destaque.tempo_leitura} min de leitura` : ""}
            </p>
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 py-16">
        {artigos.length === 0 && (
          <p className="font-tecnico text-sm text-gray">Ainda não há artigos publicados.</p>
        )}

        {grupos.map(({ categoria, artigos: artigosDaCategoria }) => (
          <div key={categoria.id} className="mb-14">
            <h2 className="font-tecnico text-xs tracking-wide text-gold pb-2 border-b border-ink/15 mb-6">
              {categoria.nome}
            </h2>
            <ListaArtigos artigos={artigosDaCategoria} />
          </div>
        ))}

        {semCategoria.length > 0 && (
          <div className="mb-14">
            <h2 className="font-tecnico text-xs tracking-wide text-gold pb-2 border-b border-ink/15 mb-6">
              Outros textos
            </h2>
            <ListaArtigos artigos={semCategoria} />
          </div>
        )}
      </section>
    </>
  );
}

function ListaArtigos({ artigos }: { artigos: ArtigoResumo[] }) {
  return (
    <ul>
      {artigos.map((artigo) => (
        <li key={artigo.id} className="border-b border-ink/10 py-5">
          <Link href={`/artigos/${artigo.slug}`} className="group">
            <span className="font-literario text-xl block mb-1.5 group-hover:text-gold-2 transition-colors">
              {artigo.titulo}
            </span>
            {artigo.resumo && (
              <span className="font-literario text-sm text-gray block mb-2">{artigo.resumo}</span>
            )}
            <span className="font-tecnico text-xs text-gray">{formatarData(artigo.publicado_em)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

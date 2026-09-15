import Link from "next/link";
import type { Metadata } from "next";
import { obterArtigosPublicados, obterCategorias, obterEtiquetas } from "@/lib/dados-publicos";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Artigos — Revista",
  description: "Todos os artigos, por categoria e etiqueta.",
};

function formatarData(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PaginaArtigos({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; etiqueta?: string }>;
}) {
  const { categoria, etiqueta } = await searchParams;
  const [todos, categorias, etiquetas] = await Promise.all([
    obterArtigosPublicados(),
    obterCategorias(),
    obterEtiquetas(),
  ]);

  const artigos = todos.filter((a) => {
    if (categoria && a.categorias?.slug !== categoria) return false;
    return true;
  });
  // Nota: filtro por etiqueta aplica-se do lado do artigo individual — como o
  // resumo não traz etiquetas, o link de etiqueta funciona como atalho de
  // pesquisa textual no título/resumo por agora.
  const artigosFiltrados = etiqueta
    ? artigos.filter((a) => `${a.titulo} ${a.resumo ?? ""}`.toLowerCase().includes(etiqueta.toLowerCase()))
    : artigos;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-literario text-3xl mb-2">Artigos</h1>
      <p className="font-tecnico text-sm text-gray mb-8">
        {todos.length} artigo{todos.length === 1 ? "" : "s"} publicado{todos.length === 1 ? "" : "s"}.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/artigos"
          className={`font-tecnico text-xs px-3 py-1.5 border ${
            !categoria ? "border-ink bg-ink text-paper" : "border-ink/20 text-gray hover:border-ink"
          }`}
        >
          Todas
        </Link>
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/artigos?categoria=${c.slug}`}
            className={`font-tecnico text-xs px-3 py-1.5 border ${
              categoria === c.slug ? "border-ink bg-ink text-paper" : "border-ink/20 text-gray hover:border-ink"
            }`}
          >
            {c.nome}
          </Link>
        ))}
      </div>

      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 font-tecnico text-xs text-gray">
          <span>Etiquetas:</span>
          {etiquetas.map((e) => (
            <Link key={e.id} href={`/artigos?etiqueta=${e.slug}`} className="underline hover:text-ink">
              {e.nome}
            </Link>
          ))}
        </div>
      )}

      {artigosFiltrados.length === 0 && (
        <p className="font-tecnico text-sm text-gray">Nenhum artigo encontrado.</p>
      )}

      <ul>
        {artigosFiltrados.map((artigo) => (
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
    </div>
  );
}

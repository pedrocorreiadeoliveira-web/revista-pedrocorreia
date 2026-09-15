import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { obterArtigosPublicados, obterCategoriaPorSlug } from "@/lib/dados-publicos";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await obterCategoriaPorSlug(slug);
  if (!categoria) return {};
  return { title: `${categoria.nome} — Revista`, description: categoria.descricao ?? undefined };
}

function formatarData(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PaginaCategoria({ params }: Props) {
  const { slug } = await params;
  const categoria = await obterCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const todos = await obterArtigosPublicados();
  const artigos = todos.filter((a) => a.categorias?.id === categoria.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="font-tecnico text-xs tracking-wide text-gold mb-2">Categoria</p>
      <h1 className="font-literario text-3xl mb-2">{categoria.nome}</h1>
      {categoria.descricao && (
        <p className="font-literario text-lg text-gray mb-10 max-w-xl">{categoria.descricao}</p>
      )}

      {artigos.length === 0 && (
        <p className="font-tecnico text-sm text-gray">Ainda não há artigos nesta categoria.</p>
      )}

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
    </div>
  );
}

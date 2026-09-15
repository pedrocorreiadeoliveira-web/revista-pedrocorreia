import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { criarArtigo } from "./actions";
import type { Artigo } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Artigos — Painel",
  robots: { index: false, follow: false },
};

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function PainelArtigos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const termo = typeof params.q === "string" ? params.q : "";

  const supabase = await createClient();
  let consulta = supabase
    .from("artigos")
    .select("id,slug,titulo,estado,publicado_em,atualizado_em,criado_em")
    .order("atualizado_em", { ascending: false });

  if (termo) {
    consulta = consulta.ilike("titulo", `%${termo}%`);
  }

  const { data: artigos, error } = await consulta;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="font-literario text-2xl mb-1">Artigos</h1>
          <p className="font-tecnico text-sm text-gray">
            Tudo o que escreveste, rascunhos e publicados.
          </p>
        </div>
        <form action={criarArtigo}>
          <button
            type="submit"
            className="font-tecnico text-sm bg-ink text-paper px-6 py-3 hover:bg-gold hover:text-ink transition-colors whitespace-nowrap"
          >
            Escrever artigo
          </button>
        </form>
      </div>

      <form className="mb-8" method="get">
        <input
          type="search"
          name="q"
          defaultValue={termo}
          placeholder="Pesquisar por título…"
          className="w-full max-w-sm border border-ink/15 bg-paper px-4 py-2 font-literario text-base focus-visible:border-gold"
        />
      </form>

      {error && (
        <p className="font-tecnico text-sm text-red-700">
          Não foi possível carregar os artigos: {error.message}
        </p>
      )}

      {!error && (!artigos || artigos.length === 0) && (
        <p className="font-tecnico text-sm text-gray">
          {termo
            ? "Nenhum artigo encontrado."
            : "Ainda não escreveste nenhum artigo."}
        </p>
      )}

      {!error && artigos && artigos.length > 0 && (
        <ul className="border-t border-ink/10">
          {(artigos as Pick<
            Artigo,
            "id" | "slug" | "titulo" | "estado" | "publicado_em" | "atualizado_em" | "criado_em"
          >[]).map((artigo) => (
            <li key={artigo.id} className="border-b border-ink/10">
              <Link
                href={`/painel/artigo/${artigo.id}`}
                className="flex items-center justify-between gap-4 py-4 group"
              >
                <span className="font-literario text-lg group-hover:text-gold-2 truncate">
                  {artigo.titulo || "Sem título"}
                </span>
                <span className="flex items-center gap-4 font-tecnico text-xs text-gray shrink-0">
                  <span
                    className={
                      artigo.estado === "publicado"
                        ? "border border-emerald-700 text-emerald-800 px-2 py-0.5"
                        : "border border-ink/20 px-2 py-0.5"
                    }
                  >
                    {artigo.estado === "publicado" ? "publicado" : "rascunho"}
                  </span>
                  <span>
                    {artigo.estado === "publicado"
                      ? formatarData(artigo.publicado_em)
                      : formatarData(artigo.atualizado_em)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

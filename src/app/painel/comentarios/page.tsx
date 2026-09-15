import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LinhaComentario, type ComentarioPendente } from "./linha-comentario";

export const metadata: Metadata = {
  title: "Comentários — Painel",
  robots: { index: false, follow: false },
};

export default async function PainelComentarios() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios")
    .select("id,artigo_id,nome,email,corpo,criado_em,artigos(titulo)")
    .eq("estado", "pendente")
    .order("criado_em", { ascending: false });

  const pendentes: ComentarioPendente[] = (data ?? []).map((c) => {
    const artigo = c.artigos as unknown as { titulo: string } | null;
    return {
      id: c.id,
      artigo_id: c.artigo_id,
      nome: c.nome,
      email: c.email,
      corpo: c.corpo,
      criado_em: c.criado_em,
      artigoTitulo: artigo?.titulo ?? "",
    };
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-literario text-2xl mb-1">Comentários</h1>
      <p className="font-tecnico text-sm text-gray mb-10">
        {pendentes.length} por rever.
      </p>

      {error && (
        <p className="font-tecnico text-sm text-red-700">
          Não foi possível carregar: {error.message}
        </p>
      )}

      {!error && pendentes.length === 0 && (
        <p className="font-tecnico text-sm text-gray">Sem comentários pendentes.</p>
      )}

      {!error && pendentes.length > 0 && (
        <ul>
          {pendentes.map((c) => (
            <LinhaComentario key={c.id} comentario={c} />
          ))}
        </ul>
      )}
    </main>
  );
}

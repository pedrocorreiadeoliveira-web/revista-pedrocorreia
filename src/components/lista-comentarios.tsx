import { createClient } from "@/lib/supabase/server";

type ComentarioPublico = {
  id: string;
  nome: string;
  corpo: string;
  criado_em: string;
  comentario_pai_id: string | null;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export async function ListaComentarios({ artigoId }: { artigoId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comentarios_publicos")
    .select("id,nome,corpo,criado_em,comentario_pai_id")
    .eq("artigo_id", artigoId)
    .order("criado_em", { ascending: true });

  const comentarios = (data ?? []) as ComentarioPublico[];
  const principais = comentarios.filter((c) => !c.comentario_pai_id);
  const respostasPorPai = new Map<string, ComentarioPublico[]>();
  comentarios
    .filter((c) => c.comentario_pai_id)
    .forEach((c) => {
      const lista = respostasPorPai.get(c.comentario_pai_id!) ?? [];
      lista.push(c);
      respostasPorPai.set(c.comentario_pai_id!, lista);
    });

  if (principais.length === 0) {
    return (
      <p className="font-tecnico text-sm text-gray mb-8">
        Ainda não há comentários — sê o primeiro.
      </p>
    );
  }

  return (
    <ul className="mb-10">
      {principais.map((c) => (
        <li key={c.id} className="border-b border-ink/10 py-5">
          <p className="font-tecnico text-xs text-gray mb-1">
            <span className="font-semibold text-ink">{c.nome}</span> · {formatarData(c.criado_em)}
          </p>
          <p className="font-literario text-base">{c.corpo}</p>

          {respostasPorPai.get(c.id)?.map((resposta) => (
            <div key={resposta.id} className="mt-4 ml-6 border-l-2 border-gold pl-4">
              <p className="font-tecnico text-xs text-gold mb-1">
                <span className="font-semibold">{resposta.nome}</span> · {formatarData(resposta.criado_em)}
              </p>
              <p className="font-literario text-base">{resposta.corpo}</p>
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}

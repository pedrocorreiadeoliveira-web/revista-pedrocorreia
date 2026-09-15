import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { reenviarLeadsFalhadas } from "./reenviar";

export const metadata: Metadata = {
  title: "Leads — Painel",
  robots: { index: false, follow: false },
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

const ROTULO_ORIGEM: Record<string, string> = {
  comentario: "Comentário",
  subscricao: "Subscrição",
  ebook: "Material",
};

export default async function PainelLeads({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string; estado?: string }>;
}) {
  const { origem, estado } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("leads")
    .select("id,email,nome,origem,estado_envio,criado_em,artigos(titulo)")
    .order("criado_em", { ascending: false });

  if (origem) consulta = consulta.eq("origem", origem);
  if (estado) consulta = consulta.eq("estado_envio", estado);

  const { data: leads, error } = await consulta;
  const { count: falhadas } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("estado_envio", "falhou");

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="font-literario text-2xl mb-1">Leads</h1>
          <p className="font-tecnico text-sm text-gray">
            {leads?.length ?? 0} lead{leads?.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex gap-2">
          {!!falhadas && (
            <form action={reenviarLeadsFalhadas}>
              <button
                type="submit"
                className="font-tecnico text-sm border border-red-700 text-red-700 px-4 py-2.5 hover:bg-red-700 hover:text-paper"
              >
                Reenviar {falhadas} falhada{falhadas === 1 ? "" : "s"}
              </button>
            </form>
          )}
          <a
            href="/painel/leads/export"
            className="font-tecnico text-sm border border-ink px-4 py-2.5 hover:bg-ink hover:text-paper"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 font-tecnico text-xs">
        <div className="flex gap-1.5">
          {["comentario", "subscricao", "ebook"].map((o) => (
            <a
              key={o}
              href={`/painel/leads?origem=${o}${estado ? `&estado=${estado}` : ""}`}
              className={`px-2.5 py-1 border ${origem === o ? "border-ink bg-ink text-paper" : "border-ink/20 text-gray"}`}
            >
              {ROTULO_ORIGEM[o]}
            </a>
          ))}
          {origem && (
            <a href={`/painel/leads${estado ? `?estado=${estado}` : ""}`} className="px-2.5 py-1 text-gray underline">
              limpar
            </a>
          )}
        </div>
      </div>

      {error && (
        <p className="font-tecnico text-sm text-red-700">Não foi possível carregar: {error.message}</p>
      )}

      {!error && (!leads || leads.length === 0) && (
        <p className="font-tecnico text-sm text-gray">Sem leads ainda.</p>
      )}

      {!error && leads && leads.length > 0 && (
        <table className="w-full font-tecnico text-sm">
          <thead>
            <tr className="text-left text-xs text-gray border-b border-ink/15">
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Origem</th>
              <th className="pb-2 font-medium">Artigo de entrada</th>
              <th className="pb-2 font-medium">Envio ao CRM</th>
              <th className="pb-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const artigo = lead.artigos as unknown as { titulo: string } | null;
              return (
                <tr key={lead.id} className="border-b border-ink/10">
                  <td className="py-2.5">{lead.email}</td>
                  <td className="py-2.5 text-gray">{ROTULO_ORIGEM[lead.origem] ?? lead.origem}</td>
                  <td className="py-2.5 text-gray">{artigo?.titulo ?? "—"}</td>
                  <td className="py-2.5">
                    <span
                      className={
                        lead.estado_envio === "enviado"
                          ? "text-emerald-700"
                          : lead.estado_envio === "falhou"
                            ? "text-red-700"
                            : "text-gray"
                      }
                    >
                      {lead.estado_envio}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray">{formatarData(lead.criado_em)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}

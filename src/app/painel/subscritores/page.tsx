import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Subscritores — Painel",
  robots: { index: false, follow: false },
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function PainelSubscritores() {
  const supabase = await createClient();
  const { data: subscritores, error } = await supabase
    .from("subscritores")
    .select("id,email,origem,criado_em")
    .order("criado_em", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-literario text-2xl mb-1">Subscritores</h1>
          <p className="font-tecnico text-sm text-gray">
            {subscritores ? subscritores.length : 0} email
            {subscritores?.length === 1 ? "" : "s"} recolhido
            {subscritores?.length === 1 ? "" : "s"}.
          </p>
        </div>
        {subscritores && subscritores.length > 0 && (
          <a
            href="/painel/subscritores/export"
            className="font-tecnico text-sm border border-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors"
          >
            Exportar CSV
          </a>
        )}
      </div>

      {error && (
        <p className="font-tecnico text-sm text-red-700">
          Não foi possível carregar os subscritores: {error.message}
        </p>
      )}

      {!error && (!subscritores || subscritores.length === 0) && (
        <p className="font-tecnico text-sm text-gray">
          Ainda não há subscritores.
        </p>
      )}

      {!error && subscritores && subscritores.length > 0 && (
        <table className="w-full font-tecnico text-sm">
          <thead>
            <tr className="text-left text-xs text-gray border-b border-ink/15">
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Origem</th>
              <th className="pb-2 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {subscritores.map((s) => (
              <tr key={s.id} className="border-b border-ink/10">
                <td className="py-2.5">{s.email}</td>
                <td className="py-2.5 text-gray">{s.origem ?? "—"}</td>
                <td className="py-2.5 text-gray">{formatarData(s.criado_em)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { tokenCancelamentoValido } from "@/lib/leads/assinatura";

export const metadata: Metadata = {
  title: "Cancelar subscrição — Revista",
  robots: { index: false, follow: false },
};

export default async function PaginaCancelarSubscricao({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  const valido = !!email && !!token && tokenCancelamentoValido(email, token);

  if (valido) {
    const admin = createAdminClient();
    await admin
      .from("leads")
      .update({ consentimento: false })
      .eq("email", email.toLowerCase().trim());
    await admin.from("subscritores").delete().eq("email", email.toLowerCase().trim());
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <h1 className="font-literario text-2xl mb-4">
        {valido ? "Subscrição cancelada" : "Ligação inválida"}
      </h1>
      <p className="font-tecnico text-sm text-gray">
        {valido
          ? "Já não vais receber mais emails. Se mudares de ideias, podes voltar a subscrever em qualquer artigo."
          : "Esta ligação não é válida ou já foi usada."}
      </p>
    </div>
  );
}

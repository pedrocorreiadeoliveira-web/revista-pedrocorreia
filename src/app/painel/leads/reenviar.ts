"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarLeadAoCrm } from "@/lib/crm";

export async function reenviarLeadsFalhadas() {
  const admin = createAdminClient();
  const { data: leads } = await admin
    .from("leads")
    .select("id,email,nome,origem,consentimento_em,artigos(titulo),categorias(nome)")
    .eq("estado_envio", "falhou");

  for (const lead of leads ?? []) {
    const artigo = lead.artigos as unknown as { titulo: string } | null;
    const categoria = lead.categorias as unknown as { nome: string } | null;
    await enviarLeadAoCrm(lead.id, {
      id: lead.id,
      email: lead.email,
      nome: lead.nome,
      origem: lead.origem,
      artigoTitulo: artigo?.titulo ?? null,
      categoriaNome: categoria?.nome ?? null,
      consentimentoEm: lead.consentimento_em,
    });
  }

  revalidatePath("/painel/leads");
}

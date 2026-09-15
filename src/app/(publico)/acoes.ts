"use server";

import { createClient } from "@/lib/supabase/server";
import { criarOuAtualizarLead } from "@/lib/leads/criar-ou-atualizar";

export type EstadoSubscricao = { sucesso: boolean; mensagem: string };

export async function subscrever(
  _estadoAnterior: EstadoSubscricao,
  formData: FormData,
): Promise<EstadoSubscricao> {
  const email = String(formData.get("email") ?? "").trim();
  const artigoId = String(formData.get("artigo_id") ?? "") || null;
  if (!email || !email.includes("@")) {
    return { sucesso: false, mensagem: "Escreve um email válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscritores")
    .insert({ email, origem: "subscricao" });

  if (error && !error.message.includes("duplicate")) {
    return { sucesso: false, mensagem: "Não foi possível subscrever agora. Tenta outra vez." };
  }

  await criarOuAtualizarLead({ email, origem: "subscricao", artigoId, consentimento: true });

  return { sucesso: true, mensagem: "Feito — obrigado por subscreveres." };
}

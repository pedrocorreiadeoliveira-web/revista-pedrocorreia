"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { criarOuAtualizarLead } from "@/lib/leads/criar-ou-atualizar";

export async function aprovarComentario(id: string) {
  const supabase = await createClient();
  const { data: comentario } = await supabase
    .from("comentarios")
    .update({ estado: "aprovado", aprovado_em: new Date().toISOString() })
    .eq("id", id)
    .select("email,nome,artigo_id,consentimento_marketing")
    .single();
  revalidatePath("/painel/comentarios");

  if (comentario?.consentimento_marketing) {
    await criarOuAtualizarLead({
      email: comentario.email,
      nome: comentario.nome,
      origem: "comentario",
      artigoId: comentario.artigo_id,
      consentimento: true,
    });
  }
}

export async function recusarComentario(id: string) {
  const supabase = await createClient();
  await supabase.from("comentarios").update({ estado: "recusado" }).eq("id", id);
  revalidatePath("/painel/comentarios");
}

export async function marcarComoSpam(id: string) {
  const supabase = await createClient();
  await supabase.from("comentarios").update({ estado: "spam" }).eq("id", id);
  revalidatePath("/painel/comentarios");
}

export async function responderComentario(
  artigoId: string,
  comentarioPaiId: string,
  resposta: string,
) {
  if (!resposta.trim()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("comentarios").insert({
    artigo_id: artigoId,
    comentario_pai_id: comentarioPaiId,
    nome: "Pedro Correia de Oliveira",
    email: user?.email ?? "",
    corpo: resposta.trim(),
    estado: "aprovado",
    aprovado_em: new Date().toISOString(),
  });
  revalidatePath("/painel/comentarios");
}

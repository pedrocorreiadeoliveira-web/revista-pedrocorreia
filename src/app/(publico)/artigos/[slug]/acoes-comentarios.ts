"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notificarComentarioNovo } from "@/lib/notificacoes/comentario";
import {
  TEMPO_MINIMO_PREENCHIMENTO_MS,
  COMPRIMENTO_MAXIMO_MENSAGEM,
  LIMITE_COMENTARIOS_POR_HORA,
  obterIpHash,
} from "@/lib/comentarios/anti-spam";

export type EstadoComentario = { sucesso: boolean; mensagem: string };

export async function enviarComentario(
  _estadoAnterior: EstadoComentario,
  formData: FormData,
): Promise<EstadoComentario> {
  // Campo armadilha: só um robô o preenche.
  if (String(formData.get("website") ?? "").trim()) {
    return { sucesso: true, mensagem: "Recebido — fica visível assim que for revisto." };
  }

  const artigoId = String(formData.get("artigo_id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const privacidade = formData.get("privacidade") === "on";
  const marketing = formData.get("marketing") === "on";
  const carimboRenderizado = Number(formData.get("carimbo") ?? 0);

  if (!nome || !email || !mensagem || !artigoId) {
    return { sucesso: false, mensagem: "Preenche o nome, o email e o comentário." };
  }
  if (!privacidade) {
    return { sucesso: false, mensagem: "Tens de aceitar a política de privacidade." };
  }
  if (mensagem.length > COMPRIMENTO_MAXIMO_MENSAGEM) {
    return { sucesso: false, mensagem: "O comentário é demasiado longo." };
  }
  if (Date.now() - carimboRenderizado < TEMPO_MINIMO_PREENCHIMENTO_MS) {
    return { sucesso: false, mensagem: "Volta a tentar dentro de instantes." };
  }

  const ipHash = await obterIpHash();
  const userAgent = (await headers()).get("user-agent") ?? "";

  const supabase = await createClient();

  // A contagem para limitar por IP precisa de ver comentários pendentes de
  // toda a gente, não só os aprovados — por isso usa o cliente com a chave
  // de serviço, só para esta verificação.
  const { count } = await createAdminClient()
    .from("comentarios")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("criado_em", new Date(Date.now() - 60 * 60 * 1000).toISOString());

  if ((count ?? 0) >= LIMITE_COMENTARIOS_POR_HORA) {
    return { sucesso: false, mensagem: "Demasiados comentários seguidos — tenta mais tarde." };
  }

  const { error } = await supabase.from("comentarios").insert({
    artigo_id: artigoId,
    nome,
    email,
    corpo: mensagem,
    consentimento_marketing: marketing,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (error) {
    return { sucesso: false, mensagem: "Não foi possível enviar. Tenta outra vez." };
  }

  const { data: artigo } = await supabase
    .from("artigos")
    .select("titulo")
    .eq("id", artigoId)
    .maybeSingle();

  await notificarComentarioNovo({
    nome,
    mensagem,
    artigoId,
    artigoTitulo: artigo?.titulo ?? "um artigo",
  });

  return { sucesso: true, mensagem: "Recebido — fica visível assim que for revisto." };
}

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarLeadAoCrm } from "@/lib/crm";
import { enviarMaterialDaCategoria } from "@/lib/notificacoes/material-lead";

export type OrigemLead = "comentario" | "subscricao" | "ebook";

type DadosLead = {
  email: string;
  nome?: string | null;
  origem: OrigemLead;
  artigoId?: string | null;
  consentimento: boolean;
};

// Quem comenta com consentimento, ou subscreve, é uma lead quente — grava-se
// (ou atualiza-se, por email) na tabela leads, envia-se ao CRM configurado, e
// — se a categoria do artigo de entrada tiver material associado — dispara o
// email com esse material.
export async function criarOuAtualizarLead(dados: DadosLead): Promise<void> {
  const email = dados.email.trim().toLowerCase();
  if (!email) return;

  const admin = createAdminClient();
  const agora = new Date().toISOString();

  let artigoTitulo: string | null = null;
  let categoriaId: string | null = null;
  let categoriaNome: string | null = null;

  if (dados.artigoId) {
    const { data: artigo } = await admin
      .from("artigos")
      .select("titulo,categoria_id,categorias(nome)")
      .eq("id", dados.artigoId)
      .maybeSingle();
    if (artigo) {
      artigoTitulo = artigo.titulo;
      categoriaId = artigo.categoria_id;
      categoriaNome = (artigo.categorias as unknown as { nome: string } | null)?.nome ?? null;
    }
  }

  const { data: existente } = await admin
    .from("leads")
    .select("id,consentimento")
    .eq("email", email)
    .maybeSingle();

  let leadId: string;

  if (existente) {
    leadId = existente.id;
    await admin
      .from("leads")
      .update({
        nome: dados.nome ?? undefined,
        origem: dados.origem,
        artigo_id: dados.artigoId ?? undefined,
        categoria_de_interesse: categoriaId ?? undefined,
        consentimento: dados.consentimento || existente.consentimento,
        ...(dados.consentimento && !existente.consentimento ? { consentimento_em: agora } : {}),
      })
      .eq("id", leadId);
  } else {
    const { data: nova, error } = await admin
      .from("leads")
      .insert({
        email,
        nome: dados.nome ?? null,
        origem: dados.origem,
        artigo_id: dados.artigoId ?? null,
        categoria_de_interesse: categoriaId,
        consentimento: dados.consentimento,
        consentimento_em: dados.consentimento ? agora : null,
      })
      .select("id")
      .single();
    if (error || !nova) return;
    leadId = nova.id;
  }

  if (!dados.consentimento) return;

  await enviarLeadAoCrm(leadId, {
    id: leadId,
    email,
    nome: dados.nome ?? null,
    origem: dados.origem,
    artigoTitulo,
    categoriaNome,
    consentimentoEm: agora,
  });

  if (categoriaId) {
    await enviarMaterialDaCategoria({ email, nome: dados.nome ?? null, categoriaId });
  }
}

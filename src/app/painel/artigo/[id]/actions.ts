"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { createClient } from "@/lib/supabase/server";
import { gerarSlugBase, calcularTempoLeitura } from "@/lib/texto";
import { converterParaHtml, converterParaTexto } from "@/lib/tiptap/gerar-html";

export type EtiquetaEntrada = { id?: string; nome: string };

export type DadosArtigo = {
  titulo: string;
  subtitulo: string;
  resumo: string;
  conteudo: JSONContent;
  categoriaId: string | null;
  etiquetas: EtiquetaEntrada[];
  imagemCapa: string | null;
  imagemCapaAlt: string | null;
  seoTitulo: string;
  seoDescricao: string;
  publicadoEm: string | null;
};

async function sincronizarEtiquetas(
  supabase: Awaited<ReturnType<typeof createClient>>,
  artigoId: string,
  etiquetas: EtiquetaEntrada[],
) {
  const idsFinais: string[] = [];

  for (const etiqueta of etiquetas) {
    if (etiqueta.id) {
      idsFinais.push(etiqueta.id);
      continue;
    }
    const slug = gerarSlugBase(etiqueta.nome);
    if (!slug) continue;
    const { data: existente } = await supabase
      .from("etiquetas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existente) {
      idsFinais.push(existente.id);
      continue;
    }
    const { data: nova, error } = await supabase
      .from("etiquetas")
      .insert({ nome: etiqueta.nome.trim(), slug })
      .select("id")
      .single();
    if (!error && nova) idsFinais.push(nova.id);
  }

  await supabase.from("artigos_etiquetas").delete().eq("artigo_id", artigoId);
  if (idsFinais.length) {
    await supabase.from("artigos_etiquetas").insert(
      idsFinais.map((etiqueta_id) => ({ artigo_id: artigoId, etiqueta_id })),
    );
  }
}

export async function guardarArtigo(id: string, dados: DadosArtigo) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("artigos")
    .update({
      titulo: dados.titulo || "Sem título",
      subtitulo: dados.subtitulo || null,
      resumo: dados.resumo || null,
      conteudo: dados.conteudo,
      categoria_id: dados.categoriaId,
      imagem_capa: dados.imagemCapa,
      imagem_capa_alt: dados.imagemCapaAlt,
      seo_titulo: dados.seoTitulo || null,
      seo_descricao: dados.seoDescricao || null,
      publicado_em: dados.publicadoEm,
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, mensagem: error.message };
  }

  await sincronizarEtiquetas(supabase, id, dados.etiquetas);
  revalidatePath("/painel");

  return { sucesso: true, mensagem: "" };
}

export async function publicarArtigo(id: string, dados: DadosArtigo) {
  const supabase = await createClient();

  const html = converterParaHtml(dados.conteudo);
  const texto = converterParaTexto(dados.conteudo);
  const tempoLeitura = calcularTempoLeitura(texto);
  const publicadoEm = dados.publicadoEm ?? new Date().toISOString();

  const { error } = await supabase
    .from("artigos")
    .update({
      titulo: dados.titulo || "Sem título",
      subtitulo: dados.subtitulo || null,
      resumo: dados.resumo || null,
      conteudo: dados.conteudo,
      conteudo_html: html,
      tempo_leitura: tempoLeitura,
      categoria_id: dados.categoriaId,
      imagem_capa: dados.imagemCapa,
      imagem_capa_alt: dados.imagemCapaAlt,
      seo_titulo: dados.seoTitulo || null,
      seo_descricao: dados.seoDescricao || null,
      publicado_em: publicadoEm,
      estado: "publicado",
    })
    .eq("id", id);

  if (error) {
    return { sucesso: false, mensagem: error.message };
  }

  await sincronizarEtiquetas(supabase, id, dados.etiquetas);
  revalidatePath("/painel");
  revalidatePath("/artigos");

  return { sucesso: true, mensagem: "" };
}

export async function despublicarArtigo(id: string) {
  const supabase = await createClient();
  await supabase.from("artigos").update({ estado: "rascunho" }).eq("id", id);
  revalidatePath("/painel");
}

export async function apagarArtigo(id: string) {
  const supabase = await createClient();
  await supabase.from("artigos").delete().eq("id", id);
  revalidatePath("/painel");
  redirect("/painel");
}

export async function listarEtiquetas() {
  const supabase = await createClient();
  const { data } = await supabase.from("etiquetas").select("id,nome,slug").order("nome");
  return data ?? [];
}

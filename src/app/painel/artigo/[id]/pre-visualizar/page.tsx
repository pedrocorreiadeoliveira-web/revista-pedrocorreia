import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { converterParaHtml, converterParaTexto } from "@/lib/tiptap/gerar-html";
import { calcularTempoLeitura } from "@/lib/texto";
import { ArtigoLeitura } from "@/components/artigo-leitura";
import type { JSONContent } from "@tiptap/core";

export const metadata: Metadata = {
  title: "Pré-visualização — Painel",
  robots: { index: false, follow: false },
};

export default async function PreVisualizarArtigo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artigo } = await supabase
    .from("artigos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!artigo) notFound();

  const conteudo = artigo.conteudo as JSONContent;
  const html = converterParaHtml(conteudo);
  const tempoLeitura = calcularTempoLeitura(converterParaTexto(conteudo));

  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-ink text-paper/70 font-tecnico text-xs text-center py-2">
        Pré-visualização — não é a página pública
      </div>
      <ArtigoLeitura
        titulo={artigo.titulo}
        subtitulo={artigo.subtitulo}
        dataPublicacao={artigo.publicado_em ?? new Date().toISOString()}
        tempoLeitura={tempoLeitura}
        imagemCapa={artigo.imagem_capa}
        imagemCapaAlt={artigo.imagem_capa_alt}
        corpoHtml={html}
      />
    </div>
  );
}

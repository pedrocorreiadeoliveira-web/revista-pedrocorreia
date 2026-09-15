import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditorArtigo } from "./editor-artigo";
import type { Artigo, Categoria, Etiqueta } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Editor — Painel",
  robots: { index: false, follow: false },
};

export default async function PaginaArtigo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: artigo }, { data: categorias }, { data: etiquetasExistentes }, { data: etiquetasDoArtigo }] =
    await Promise.all([
      supabase.from("artigos").select("*").eq("id", id).maybeSingle(),
      supabase.from("categorias").select("*").order("ordem"),
      supabase.from("etiquetas").select("*").order("nome"),
      supabase
        .from("artigos_etiquetas")
        .select("etiquetas(id,nome,slug)")
        .eq("artigo_id", id),
    ]);

  if (!artigo) notFound();

  const etiquetasIniciais = (etiquetasDoArtigo ?? [])
    .map((linha) => {
      const etiqueta = linha.etiquetas as unknown as Etiqueta | null;
      return etiqueta ? { id: etiqueta.id, nome: etiqueta.nome } : null;
    })
    .filter((e): e is { id: string; nome: string } => e !== null);

  return (
    <EditorArtigo
      artigo={artigo as Artigo}
      categorias={(categorias ?? []) as Categoria[]}
      etiquetasIniciais={etiquetasIniciais}
      etiquetasExistentes={(etiquetasExistentes ?? []) as Etiqueta[]}
    />
  );
}

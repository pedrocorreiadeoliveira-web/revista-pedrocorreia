import { createClient } from "@/lib/supabase/server";
import type { Artigo, Categoria, Etiqueta } from "@/lib/tipos";

export type ArtigoResumo = Pick<
  Artigo,
  | "id"
  | "slug"
  | "titulo"
  | "subtitulo"
  | "resumo"
  | "imagem_capa"
  | "imagem_capa_alt"
  | "publicado_em"
  | "tempo_leitura"
> & { categorias: Pick<Categoria, "id" | "nome" | "slug"> | null };

const CAMPOS_RESUMO =
  "id,slug,titulo,subtitulo,resumo,imagem_capa,imagem_capa_alt,publicado_em,tempo_leitura,categorias(id,nome,slug)";

export async function obterArtigosPublicados(): Promise<ArtigoResumo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artigos")
    .select(CAMPOS_RESUMO)
    .order("publicado_em", { ascending: false });
  return (data ?? []) as unknown as ArtigoResumo[];
}

export async function obterArtigoPorSlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artigos")
    .select(
      "*,categorias(id,nome,slug),artigos_etiquetas(etiquetas(id,nome,slug))",
    )
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function obterRelacionados(categoriaId: string | null, excluirId: string) {
  if (!categoriaId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("artigos")
    .select(CAMPOS_RESUMO)
    .eq("categoria_id", categoriaId)
    .neq("id", excluirId)
    .order("publicado_em", { ascending: false })
    .limit(3);
  return (data ?? []) as unknown as ArtigoResumo[];
}

export async function obterCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categorias").select("*").order("ordem");
  return (data ?? []) as Categoria[];
}

export async function obterCategoriaPorSlug(slug: string): Promise<Categoria | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("categorias").select("*").eq("slug", slug).maybeSingle();
  return data as Categoria | null;
}

export async function obterEtiquetas(): Promise<Etiqueta[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("etiquetas").select("*").order("nome");
  return (data ?? []) as Etiqueta[];
}

export type DefinicoesSite = { cta_frase: string; cta_apoio: string };

export async function obterDefinicoesSite(): Promise<DefinicoesSite> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("definicoes_site")
    .select("cta_frase,cta_apoio")
    .eq("id", true)
    .maybeSingle();
  return (
    data ?? {
      cta_frase: "Se algo aqui te tocou, provavelmente não é por acaso.",
      cta_apoio: "Trabalho com quem quer encurtar essa distância.",
    }
  );
}

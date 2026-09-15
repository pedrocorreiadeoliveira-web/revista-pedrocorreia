export type EstadoArtigo = "rascunho" | "publicado";

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
};

export type Etiqueta = {
  id: string;
  nome: string;
  slug: string;
};

export type Artigo = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  resumo: string | null;
  conteudo: Record<string, unknown>;
  conteudo_html: string;
  imagem_capa: string | null;
  imagem_capa_alt: string | null;
  categoria_id: string | null;
  estado: EstadoArtigo;
  publicado_em: string | null;
  tempo_leitura: number | null;
  seo_titulo: string | null;
  seo_descricao: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type ArtigoComRelacoes = Artigo & {
  categorias: Categoria | null;
  artigos_etiquetas: { etiquetas: Etiqueta }[];
};

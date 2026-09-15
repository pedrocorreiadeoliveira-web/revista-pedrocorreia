import type { Metadata } from "next";
import { obterDefinicoesSite, obterCategorias } from "@/lib/dados-publicos";
import { createClient } from "@/lib/supabase/server";
import { FormularioDefinicoes } from "./formulario";
import { Materiais } from "./materiais";

export const metadata: Metadata = {
  title: "Definições — Painel",
  robots: { index: false, follow: false },
};

export default async function PainelDefinicoes() {
  const [definicoes, categorias] = await Promise.all([obterDefinicoesSite(), obterCategorias()]);
  const supabase = await createClient();
  const { data: materiais } = await supabase
    .from("categorias_material")
    .select("categoria_id,titulo,ficheiro_url");

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-literario text-2xl mb-1">Definições</h1>
      <p className="font-tecnico text-sm text-gray mb-10">
        O texto do bloco preto e ouro que aparece no fim de cada artigo, a convidar
        para a mentoria. O destino do botão está fixo nas variáveis de ambiente
        (CTA_DESTINO).
      </p>
      <FormularioDefinicoes ctaFrase={definicoes.cta_frase} ctaApoio={definicoes.cta_apoio} />

      <h2 className="font-literario text-xl mt-14 mb-2">Material por categoria</h2>
      <p className="font-tecnico text-sm text-gray mb-6 max-w-lg">
        Quando alguém comenta com consentimento, ou subscreve, num artigo desta
        categoria, recebe este material automaticamente por email.
      </p>
      <Materiais categorias={categorias} materiais={materiais ?? []} />
    </main>
  );
}

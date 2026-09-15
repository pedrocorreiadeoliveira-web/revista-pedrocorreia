"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { gerarSlugBase } from "@/lib/texto";

export async function sairDoPainel() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}

async function slugDisponivel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slugBase: string,
): Promise<string> {
  let slug = slugBase || "artigo";
  let sufixo = 1;
  for (;;) {
    const { data } = await supabase
      .from("artigos")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    sufixo += 1;
    slug = `${slugBase}-${sufixo}`;
  }
}

export async function criarArtigo() {
  const supabase = await createClient();
  const slug = await slugDisponivel(supabase, `sem-titulo-${Date.now().toString(36)}`);

  const { data, error } = await supabase
    .from("artigos")
    .insert({
      slug,
      titulo: "Sem título",
      conteudo: { type: "doc", content: [{ type: "paragraph" }] },
      conteudo_html: "",
      estado: "rascunho",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Não foi possível criar o artigo.");
  }

  redirect(`/painel/artigo/${data.id}`);
}

export { gerarSlugBase };

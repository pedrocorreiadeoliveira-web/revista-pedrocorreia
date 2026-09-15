"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function guardarMaterialCategoria(
  categoriaId: string,
  titulo: string,
  ficheiroUrl: string,
) {
  if (!titulo.trim() || !ficheiroUrl) return;
  const supabase = await createClient();
  await supabase
    .from("categorias_material")
    .upsert(
      { categoria_id: categoriaId, titulo: titulo.trim(), ficheiro_url: ficheiroUrl, atualizado_em: new Date().toISOString() },
      { onConflict: "categoria_id" },
    );
  revalidatePath("/painel/definicoes");
}

export async function removerMaterialCategoria(categoriaId: string) {
  const supabase = await createClient();
  await supabase.from("categorias_material").delete().eq("categoria_id", categoriaId);
  revalidatePath("/painel/definicoes");
}

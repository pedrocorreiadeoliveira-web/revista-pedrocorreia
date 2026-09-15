"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoDefinicoes = { sucesso: boolean; mensagem: string };

export async function guardarDefinicoes(
  _estadoAnterior: EstadoDefinicoes,
  formData: FormData,
): Promise<EstadoDefinicoes> {
  const cta_frase = String(formData.get("cta_frase") ?? "").trim();
  const cta_apoio = String(formData.get("cta_apoio") ?? "").trim();

  if (!cta_frase) {
    return { sucesso: false, mensagem: "A frase não pode ficar em branco." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("definicoes_site")
    .update({ cta_frase, cta_apoio })
    .eq("id", true);

  if (error) {
    return { sucesso: false, mensagem: error.message };
  }

  revalidatePath("/", "layout");
  return { sucesso: true, mensagem: "Guardado." };
}

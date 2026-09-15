"use server";

import { createClient } from "@/lib/supabase/server";
import { isEmailAdmin } from "@/lib/auth";

export type EstadoEntrar = {
  sucesso: boolean;
  mensagem: string;
};

export async function pedirLigacaoDeEntrada(
  _estadoAnterior: EstadoEntrar,
  formData: FormData,
): Promise<EstadoEntrar> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { sucesso: false, mensagem: "Escreve o teu email." };
  }

  if (!isEmailAdmin(email)) {
    // Mensagem propositadamente genérica — não confirma nem nega quais
    // emails são administradores.
    return {
      sucesso: true,
      mensagem:
        "Se este email tiver acesso ao painel, vais receber uma ligação de entrada em instantes.",
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      sucesso: false,
      mensagem: "Não foi possível enviar a ligação agora. Tenta outra vez.",
    };
  }

  return {
    sucesso: true,
    mensagem:
      "Se este email tiver acesso ao painel, vais receber uma ligação de entrada em instantes.",
  };
}

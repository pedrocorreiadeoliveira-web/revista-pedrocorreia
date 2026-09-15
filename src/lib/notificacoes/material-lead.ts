import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarTokenCancelamento } from "@/lib/leads/assinatura";

type Params = { email: string; nome: string | null; categoriaId: string };

// Envia o material associado à categoria do artigo de entrada — não um email
// genérico. Se a categoria não tiver material configurado (em
// /painel/definicoes), não envia nada.
export async function enviarMaterialDaCategoria({ email, nome, categoriaId }: Params): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const admin = createAdminClient();
  const { data: material } = await admin
    .from("categorias_material")
    .select("titulo,ficheiro_url")
    .eq("categoria_id", categoriaId)
    .maybeSingle();

  if (!material) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const token = gerarTokenCancelamento(email);
  const linkCancelar = `${siteUrl}/cancelar-subscricao?email=${encodeURIComponent(email)}&token=${token}`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Revista <onboarding@resend.dev>",
    to: email,
    subject: material.titulo,
    text: `${nome ? `Olá ${nome},` : "Olá,"}\n\nAqui tens o material que prometi: ${material.titulo}\n${material.ficheiro_url}\n\n—\nPedro Correia de Oliveira\n\nJá não queres receber estes emails? Cancela aqui: ${linkCancelar}`,
  });
}

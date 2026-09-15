import "server-only";
import { Resend } from "resend";

type DadosNotificacao = {
  nome: string;
  mensagem: string;
  artigoTitulo: string;
  artigoId: string;
};

// Nunca deixa o envio de notificação impedir a gravação do comentário — só
// regista o erro. Tenta email (Resend) e, se configurado, um webhook próprio.
export async function notificarComentarioNovo(dados: DadosNotificacao) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const linkModeracao = `${siteUrl}/painel/comentarios#${dados.artigoId}`;

  const resultados = await Promise.allSettled([
    enviarEmail(dados, linkModeracao),
    enviarWebhook(dados, linkModeracao),
  ]);

  resultados.forEach((r) => {
    if (r.status === "rejected") console.error("[notificarComentarioNovo]", r.reason);
  });
}

async function enviarEmail(dados: DadosNotificacao, linkModeracao: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const destinatario = process.env.ADMIN_EMAIL;
  if (!apiKey || !destinatario) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Revista <onboarding@resend.dev>",
    to: destinatario,
    subject: `Novo comentário de ${dados.nome} — ${dados.artigoTitulo}`,
    text: `${dados.nome} comentou em "${dados.artigoTitulo}":\n\n${dados.mensagem}\n\nRever: ${linkModeracao}`,
  });
}

async function enviarWebhook(dados: DadosNotificacao, linkModeracao: string) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "comentario_novo",
      nome: dados.nome,
      mensagem: dados.mensagem,
      artigo: dados.artigoTitulo,
      link: linkModeracao,
    }),
  });
}

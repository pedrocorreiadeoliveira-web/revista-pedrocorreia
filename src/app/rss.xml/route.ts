import { obterArtigosPublicados } from "@/lib/dados-publicos";

function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const artigos = await obterArtigosPublicados();

  const itens = artigos
    .map(
      (a) => `
    <item>
      <title>${escaparXml(a.titulo)}</title>
      <link>${siteUrl}/artigos/${a.slug}</link>
      <guid>${siteUrl}/artigos/${a.slug}</guid>
      ${a.resumo ? `<description>${escaparXml(a.resumo)}</description>` : ""}
      ${a.publicado_em ? `<pubDate>${new Date(a.publicado_em).toUTCString()}</pubDate>` : ""}
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Revista — Pedro Correia de Oliveira</title>
    <link>${siteUrl}</link>
    <description>Artigos sobre limites, relações, autoestima e a distância entre quem somos e quem dizemos ser.</description>
    <language>pt-PT</language>${itens}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

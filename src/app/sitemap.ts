import type { MetadataRoute } from "next";
import { obterArtigosPublicados, obterCategorias } from "@/lib/dados-publicos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [artigos, categorias] = await Promise.all([obterArtigosPublicados(), obterCategorias()]);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/artigos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/sobre`, changeFrequency: "yearly", priority: 0.5 },
    ...categorias.map((c) => ({
      url: `${siteUrl}/categoria/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...artigos.map((a) => ({
      url: `${siteUrl}/artigos/${a.slug}`,
      lastModified: a.publicado_em ? new Date(a.publicado_em) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

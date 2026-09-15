import { ImageResponse } from "next/og";
import { obterArtigoPorSlug } from "@/lib/dados-publicos";

export const alt = "Revista — Pedro Correia de Oliveira";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ImagemOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await obterArtigoPorSlug(slug);
  const titulo = artigo?.titulo ?? "Revista";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0C",
          color: "#F3EFE7",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#6F6A60", letterSpacing: 2 }}>
          REVISTA
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titulo.length > 60 ? 56 : 72,
            fontWeight: 600,
            lineHeight: 1.2,
            maxWidth: 980,
          }}
        >
          {titulo}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#C9A227" }}>
          Pedro Correia de Oliveira
        </div>
      </div>
    ),
    { ...size },
  );
}

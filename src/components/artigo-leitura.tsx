function formatarData(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArtigoLeitura({
  titulo,
  subtitulo,
  dataPublicacao,
  tempoLeitura,
  imagemCapa,
  imagemCapaAlt,
  corpoHtml,
}: {
  titulo: string;
  subtitulo: string | null;
  dataPublicacao: string | null;
  tempoLeitura: number | null;
  imagemCapa: string | null;
  imagemCapaAlt: string | null;
  corpoHtml: string;
}) {
  return (
    <article className="max-w-[42rem] mx-auto px-6 py-16">
      <p className="font-tecnico text-xs tracking-wide text-gray mb-4">
        {[formatarData(dataPublicacao), tempoLeitura ? `${tempoLeitura} min de leitura` : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <h1 className="font-literario font-semibold text-4xl leading-tight mb-3">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="font-literario text-xl text-gray mb-8">{subtitulo}</p>
      )}
      {imagemCapa && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagemCapa}
          alt={imagemCapaAlt ?? ""}
          className="w-full h-auto mb-10"
        />
      )}
      <div
        className="corpo-leitura"
        dangerouslySetInnerHTML={{ __html: corpoHtml }}
      />
    </article>
  );
}

"use client";

import { useState } from "react";

export function BotoesPartilha({ titulo, url }: { titulo: string; url: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiarLigacao = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silenciosamente ignorado — o botão simplesmente não confirma
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 font-tecnico text-xs text-gray">
      <span>Partilhar:</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${titulo} — ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-ink"
      >
        WhatsApp
      </a>
      <button type="button" onClick={copiarLigacao} className="underline hover:text-ink">
        {copiado ? "Copiado para o Instagram" : "Copiar para o Instagram"}
      </button>
      <button type="button" onClick={copiarLigacao} className="underline hover:text-ink">
        {copiado ? "Ligação copiada" : "Copiar ligação"}
      </button>
    </div>
  );
}

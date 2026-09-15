"use client";

import { useState } from "react";
import {
  aprovarComentario,
  recusarComentario,
  marcarComoSpam,
  responderComentario,
} from "./actions";

export type ComentarioPendente = {
  id: string;
  artigo_id: string;
  nome: string;
  email: string;
  corpo: string;
  criado_em: string;
  artigoTitulo: string;
};

function contarLigacoes(texto: string): number {
  return (texto.match(/https?:\/\/\S+/gi) ?? []).length;
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

export function LinhaComentario({ comentario }: { comentario: ComentarioPendente }) {
  const [aResponder, setAResponder] = useState(false);
  const [resposta, setResposta] = useState("");
  const [aProcessar, setAProcessar] = useState(false);
  const suspeito = contarLigacoes(comentario.corpo) > 2;

  const executar = async (acao: () => Promise<void>) => {
    setAProcessar(true);
    await acao();
    setAProcessar(false);
  };

  return (
    <li id={comentario.artigo_id} className="border-b border-ink/10 py-5">
      <p className="font-tecnico text-xs text-gray mb-1">
        <span className="font-semibold text-ink">{comentario.nome}</span> · {comentario.email} · em
        &ldquo;{comentario.artigoTitulo}&rdquo; · {formatarData(comentario.criado_em)}
        {suspeito && <span className="text-red-700 ml-2">suspeito — várias ligações</span>}
      </p>
      <p className="font-literario text-base mb-3">{comentario.corpo}</p>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          disabled={aProcessar}
          onClick={() => executar(() => aprovarComentario(comentario.id))}
          className="font-tecnico text-xs border border-emerald-700 text-emerald-800 px-3 py-1.5 hover:bg-emerald-700 hover:text-paper disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          type="button"
          disabled={aProcessar}
          onClick={() => executar(() => recusarComentario(comentario.id))}
          className="font-tecnico text-xs border border-ink/30 text-gray px-3 py-1.5 hover:border-ink disabled:opacity-50"
        >
          Recusar
        </button>
        <button
          type="button"
          disabled={aProcessar}
          onClick={() => executar(() => marcarComoSpam(comentario.id))}
          className="font-tecnico text-xs border border-red-700 text-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-paper disabled:opacity-50"
        >
          Marcar como spam
        </button>
        <button
          type="button"
          onClick={() => setAResponder((v) => !v)}
          className="font-tecnico text-xs border border-ink/30 text-gray px-3 py-1.5 hover:border-ink"
        >
          Responder
        </button>
      </div>

      {aResponder && (
        <div className="mt-3 max-w-lg">
          <textarea
            value={resposta}
            onChange={(ev) => setResposta(ev.target.value)}
            rows={3}
            placeholder="A tua resposta, publicada logo como aprovada"
            className="w-full border border-gold/40 bg-paper px-3 py-2 font-literario text-sm focus-visible:border-gold resize-none mb-2"
          />
          <button
            type="button"
            disabled={aProcessar || !resposta.trim()}
            onClick={async () => {
              await executar(() =>
                responderComentario(comentario.artigo_id, comentario.id, resposta),
              );
              setResposta("");
              setAResponder(false);
            }}
            className="font-tecnico text-xs bg-gold text-ink px-4 py-2 hover:bg-gold-2 disabled:opacity-50"
          >
            Publicar resposta
          </button>
        </div>
      )}
    </li>
  );
}

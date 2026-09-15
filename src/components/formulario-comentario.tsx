"use client";

import { useActionState, useState } from "react";
import { enviarComentario, type EstadoComentario } from "@/app/(publico)/artigos/[slug]/acoes-comentarios";

const estadoInicial: EstadoComentario = { sucesso: false, mensagem: "" };

export function FormularioComentario({ artigoId }: { artigoId: string }) {
  const [estado, acao, aEnviar] = useActionState(enviarComentario, estadoInicial);
  const [carimbo] = useState(() => Date.now());

  if (estado.sucesso) {
    return (
      <p className="font-tecnico text-sm text-gray" role="status">
        {estado.mensagem}
      </p>
    );
  }

  return (
    <form action={acao} className="grid gap-4 max-w-lg">
      <input type="hidden" name="artigo_id" value={artigoId} />
      <input type="hidden" name="carimbo" value={carimbo} />
      {/* campo armadilha — invisível para uma pessoa, tentador para um robô */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Não preencher</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-nome" className="block font-tecnico text-xs text-gray mb-1.5">
            Nome
          </label>
          <input
            id="c-nome"
            name="nome"
            required
            maxLength={80}
            className="w-full border border-ink/20 bg-paper px-3 py-2 font-literario focus-visible:border-gold"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="block font-tecnico text-xs text-gray mb-1.5">
            Email (não é publicado)
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            maxLength={160}
            className="w-full border border-ink/20 bg-paper px-3 py-2 font-literario focus-visible:border-gold"
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-mensagem" className="block font-tecnico text-xs text-gray mb-1.5">
          Comentário
        </label>
        <textarea
          id="c-mensagem"
          name="mensagem"
          required
          rows={4}
          maxLength={3000}
          className="w-full border border-ink/20 bg-paper px-3 py-2 font-literario focus-visible:border-gold resize-none"
        />
      </div>

      <label className="flex items-start gap-2 font-tecnico text-xs text-gray">
        <input type="checkbox" name="privacidade" required className="mt-0.5" />
        Li e aceito a{" "}
        <a href="/privacidade" className="underline hover:text-ink">
          política de privacidade
        </a>
        .
      </label>
      <label className="flex items-start gap-2 font-tecnico text-xs text-gray">
        <input type="checkbox" name="marketing" className="mt-0.5" />
        Quero receber textos e materiais do Pedro por email.
      </label>

      <button
        type="submit"
        disabled={aEnviar}
        className="justify-self-start font-tecnico text-sm border border-ink px-6 py-2.5 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
      >
        {aEnviar ? "A enviar…" : "Publicar comentário"}
      </button>
      {estado.mensagem && !estado.sucesso && (
        <p className="font-tecnico text-xs text-red-700">{estado.mensagem}</p>
      )}
    </form>
  );
}

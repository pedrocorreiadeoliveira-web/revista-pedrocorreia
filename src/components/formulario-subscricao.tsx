"use client";

import { useActionState } from "react";
import { subscrever, type EstadoSubscricao } from "@/app/(publico)/acoes";

const estadoInicial: EstadoSubscricao = { sucesso: false, mensagem: "" };

export function FormularioSubscricao({ artigoId }: { artigoId?: string }) {
  const [estado, acao, aEnviar] = useActionState(subscrever, estadoInicial);

  if (estado.sucesso) {
    return (
      <p className="font-tecnico text-sm text-gray" role="status">
        {estado.mensagem}
      </p>
    );
  }

  return (
    <form action={acao} className="flex flex-col sm:flex-row gap-3 max-w-md">
      {artigoId && <input type="hidden" name="artigo_id" value={artigoId} />}
      <input
        type="email"
        name="email"
        required
        placeholder="O teu email"
        className="flex-1 border border-ink/20 bg-paper px-4 py-2.5 font-literario text-base focus-visible:border-gold"
      />
      <button
        type="submit"
        disabled={aEnviar}
        className="font-tecnico text-sm border border-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {aEnviar ? "A enviar…" : "Subscrever"}
      </button>
      {estado.mensagem && !estado.sucesso && (
        <p className="font-tecnico text-xs text-red-700 sm:col-span-2">{estado.mensagem}</p>
      )}
    </form>
  );
}

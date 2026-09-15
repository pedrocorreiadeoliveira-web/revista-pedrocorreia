"use client";

import { useActionState } from "react";
import { guardarDefinicoes, type EstadoDefinicoes } from "./actions";

const estadoInicial: EstadoDefinicoes = { sucesso: false, mensagem: "" };

export function FormularioDefinicoes({
  ctaFrase,
  ctaApoio,
}: {
  ctaFrase: string;
  ctaApoio: string;
}) {
  const [estado, acao, aGuardar] = useActionState(guardarDefinicoes, estadoInicial);

  return (
    <form action={acao} className="grid gap-6 max-w-xl">
      <div>
        <label className="block font-tecnico text-xs text-gray mb-1.5">
          Frase principal do bloco de conversão
        </label>
        <input
          name="cta_frase"
          defaultValue={ctaFrase}
          required
          className="w-full border border-ink/15 bg-paper px-3 py-2.5 font-literario text-lg focus-visible:border-gold"
        />
      </div>
      <div>
        <label className="block font-tecnico text-xs text-gray mb-1.5">Linha de apoio</label>
        <input
          name="cta_apoio"
          defaultValue={ctaApoio}
          className="w-full border border-ink/15 bg-paper px-3 py-2.5 font-literario text-base focus-visible:border-gold"
        />
      </div>
      <button
        type="submit"
        disabled={aGuardar}
        className="justify-self-start font-tecnico text-sm bg-ink text-paper px-6 py-3 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50"
      >
        {aGuardar ? "A guardar…" : "Guardar"}
      </button>
      {estado.mensagem && (
        <p className={`font-tecnico text-sm ${estado.sucesso ? "text-emerald-700" : "text-red-700"}`}>
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { pedirLigacaoDeEntrada, type EstadoEntrar } from "./actions";

const estadoInicial: EstadoEntrar = { sucesso: false, mensagem: "" };

export function FormularioEntrada() {
  const [estado, acao, aPedir] = useActionState(
    pedirLigacaoDeEntrada,
    estadoInicial,
  );

  return (
    <form action={acao} className="mt-8 grid gap-4">
      <div>
        <label htmlFor="email" className="block font-tecnico text-xs tracking-wide text-paper/60 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border border-paper/25 px-4 py-3 text-paper font-literario text-lg focus-visible:border-gold"
          placeholder="tu@exemplo.com"
        />
      </div>
      <button
        type="submit"
        disabled={aPedir}
        className="justify-self-start border border-gold text-gold-2 font-tecnico text-sm px-7 py-3 hover:bg-gold hover:text-ink transition-colors disabled:opacity-50"
      >
        {aPedir ? "A enviar…" : "Enviar ligação de entrada"}
      </button>
      {estado.mensagem && (
        <p role="status" className="font-tecnico text-sm text-paper/70">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}

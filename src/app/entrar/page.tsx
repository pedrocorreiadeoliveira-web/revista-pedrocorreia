import type { Metadata } from "next";
import { FormularioEntrada } from "./formulario-entrada";

export const metadata: Metadata = {
  title: "Entrar — Revista",
  robots: { index: false, follow: false },
};

export default function PaginaEntrar() {
  return (
    <main className="flex-1 flex items-center justify-center bg-ink px-6 py-20">
      <div className="w-full max-w-sm">
        <p className="font-tecnico text-xs tracking-wide text-paper/50 mb-3">
          Painel de publicação
        </p>
        <h1 className="font-literario text-3xl text-paper mb-2">Entrar</h1>
        <p className="font-tecnico text-sm text-paper/60">
          Escreve o teu email — enviamos uma ligação para entrares, sem
          palavra-passe.
        </p>
        <FormularioEntrada />
      </div>
    </main>
  );
}

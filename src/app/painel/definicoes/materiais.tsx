"use client";

import { useRef, useState } from "react";
import { carregarMedia, ErroDeCarregamento } from "@/lib/media/upload-cliente";
import { guardarMaterialCategoria, removerMaterialCategoria } from "./actions-material";
import type { Categoria } from "@/lib/tipos";

type Material = { categoria_id: string; titulo: string; ficheiro_url: string };

export function Materiais({
  categorias,
  materiais,
}: {
  categorias: Categoria[];
  materiais: Material[];
}) {
  return (
    <div className="grid gap-6">
      {categorias.map((categoria) => (
        <LinhaMaterial
          key={categoria.id}
          categoria={categoria}
          materialAtual={materiais.find((m) => m.categoria_id === categoria.id) ?? null}
        />
      ))}
    </div>
  );
}

function LinhaMaterial({
  categoria,
  materialAtual,
}: {
  categoria: Categoria;
  materialAtual: Material | null;
}) {
  const [titulo, setTitulo] = useState(materialAtual?.titulo ?? "");
  const [progresso, setProgresso] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ficheiroUrl, setFicheiroUrl] = useState(materialAtual?.ficheiro_url ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const carregar = async (ficheiro: File) => {
    setErro(null);
    try {
      setProgresso(0);
      const { url } = await carregarMedia(ficheiro, ficheiro.name, setProgresso);
      setFicheiroUrl(url);
      if (titulo.trim()) await guardarMaterialCategoria(categoria.id, titulo, url);
    } catch (e) {
      setErro(e instanceof ErroDeCarregamento ? e.message : "Não foi possível carregar.");
    } finally {
      setProgresso(null);
    }
  };

  return (
    <div className="border border-ink/10 bg-paper p-4">
      <p className="font-literario text-lg mb-3">{categoria.nome}</p>
      <div className="grid gap-2 max-w-md">
        <input
          value={titulo}
          onChange={(ev) => setTitulo(ev.target.value)}
          onBlur={() => ficheiroUrl && guardarMaterialCategoria(categoria.id, titulo, ficheiroUrl)}
          placeholder="Título do material (ex: Guia de limites saudáveis)"
          className="border border-ink/15 bg-paper px-3 py-2 font-literario text-sm focus-visible:border-gold"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-tecnico text-xs border border-ink/25 px-3 py-1.5 hover:border-ink"
          >
            {ficheiroUrl ? "Substituir ficheiro" : "Carregar ficheiro"}
          </button>
          {ficheiroUrl && (
            <>
              <a href={ficheiroUrl} target="_blank" rel="noopener noreferrer" className="font-tecnico text-xs underline text-gray">
                Ver ficheiro atual
              </a>
              <button
                type="button"
                onClick={async () => {
                  await removerMaterialCategoria(categoria.id);
                  setFicheiroUrl("");
                  setTitulo("");
                }}
                className="font-tecnico text-xs text-red-700 underline"
              >
                Remover
              </button>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(ev) => {
            const ficheiro = ev.target.files?.[0];
            ev.target.value = "";
            if (ficheiro) carregar(ficheiro);
          }}
        />
        {progresso !== null && (
          <p className="font-tecnico text-xs text-gray">A carregar… {progresso}%</p>
        )}
        {erro && <p className="font-tecnico text-xs text-red-700">{erro}</p>}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { comprimirImagem } from "@/lib/media/comprimir-imagem";
import { carregarMedia, ErroDeCarregamento } from "@/lib/media/upload-cliente";

type Ficheiro = { nome: string; url: string; ehImagem: boolean };

const LIMITE_VIDEO_MB = 50;

export default function PainelMedia() {
  const [ficheiros, setFicheiros] = useState<Ficheiro[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [carregamento, setCarregamento] = useState<{ progresso: number } | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [aArrastar, setAArrastar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recarregar = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("media")
      .list(undefined, { sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setErroLista(error.message);
      return;
    }
    setErroLista(null);
    setFicheiros(
      (data ?? [])
        .filter((f) => f.id)
        .map((f) => ({
          nome: f.name,
          url: supabase.storage.from("media").getPublicUrl(f.name).data.publicUrl,
          ehImagem: /\.(png|jpe?g|webp|gif|svg)$/i.test(f.name),
        })),
    );
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => recarregar(), 0);
    return () => clearTimeout(temporizador);
  }, [recarregar]);

  const carregarFicheiro = useCallback(
    async (ficheiro: File) => {
      setErroCarregamento(null);
      const ehImagem = ficheiro.type.startsWith("image/");
      const ehVideo = ficheiro.type.startsWith("video/");
      if (ehVideo && ficheiro.size > LIMITE_VIDEO_MB * 1024 * 1024) {
        setErroCarregamento(`Este vídeo tem mais de ${LIMITE_VIDEO_MB}MB — escolhe um ficheiro mais pequeno.`);
        return;
      }
      try {
        setCarregamento({ progresso: 0 });
        const dados = ehImagem ? await comprimirImagem(ficheiro) : ficheiro;
        const nome = ehImagem ? ficheiro.name.replace(/\.[^.]+$/, ".webp") : ficheiro.name;
        await carregarMedia(dados, nome, (p) => setCarregamento({ progresso: p }));
        await recarregar();
      } catch (e) {
        setErroCarregamento(
          e instanceof ErroDeCarregamento ? e.message : "Não foi possível carregar o ficheiro.",
        );
      } finally {
        setCarregamento(null);
      }
    },
    [recarregar],
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-literario text-2xl mb-1">Media</h1>
      <p className="font-tecnico text-sm text-gray mb-8">
        Imagens, vídeos e áudios já carregados — reutiliza-os sem carregar outra vez.
      </p>

      <div
        onDragOver={(ev) => {
          ev.preventDefault();
          setAArrastar(true);
        }}
        onDragLeave={() => setAArrastar(false)}
        onDrop={(ev) => {
          ev.preventDefault();
          setAArrastar(false);
          const ficheiro = ev.dataTransfer.files?.[0];
          if (ficheiro) carregarFicheiro(ficheiro);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mb-8 border border-dashed px-6 py-10 text-center cursor-pointer font-tecnico text-sm ${
          aArrastar ? "border-gold bg-paper" : "border-ink/25 text-gray"
        }`}
      >
        Arrasta um ficheiro para aqui, ou clica para escolher.
        <br />
        Imagens são comprimidas automaticamente. Vídeo até {LIMITE_VIDEO_MB}MB.
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,audio/mpeg,audio/mp3"
        hidden
        onChange={(ev) => {
          const ficheiro = ev.target.files?.[0];
          ev.target.value = "";
          if (ficheiro) carregarFicheiro(ficheiro);
        }}
      />

      {carregamento && (
        <div className="mb-8 font-tecnico text-xs text-gray">
          A carregar… {carregamento.progresso}%
          <div className="h-1 bg-ink/10 mt-1 max-w-xs">
            <div className="h-1 bg-gold transition-all" style={{ width: `${carregamento.progresso}%` }} />
          </div>
        </div>
      )}
      {erroCarregamento && (
        <p className="mb-8 font-tecnico text-xs text-red-700">{erroCarregamento}</p>
      )}

      {erroLista && (
        <p className="font-tecnico text-sm text-red-700">
          Não foi possível carregar a biblioteca: {erroLista}
        </p>
      )}

      {!erroLista && ficheiros?.length === 0 && (
        <p className="font-tecnico text-sm text-gray">Ainda não há ficheiros na biblioteca.</p>
      )}

      {!erroLista && ficheiros && ficheiros.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ficheiros.map((ficheiro) => (
            <li key={ficheiro.nome} className="border border-ink/10 bg-paper p-2">
              {ficheiro.ehImagem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ficheiro.url}
                  alt=""
                  className="w-full aspect-square object-cover mb-2"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-paper-2 mb-2 font-tecnico text-xs text-gray">
                  ficheiro
                </div>
              )}
              <p className="font-tecnico text-[11px] text-gray truncate">{ficheiro.nome}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

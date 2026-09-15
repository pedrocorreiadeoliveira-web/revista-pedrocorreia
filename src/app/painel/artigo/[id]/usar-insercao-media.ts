import { useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { comprimirImagem } from "@/lib/media/comprimir-imagem";
import { carregarMedia, ErroDeCarregamento } from "@/lib/media/upload-cliente";

export type EstadoCarregamento = { tipo: string; progresso: number } | null;

const LIMITE_VIDEO_MB = 50;

function pedirTextoAlternativo(): string | null {
  for (;;) {
    const alt = window.prompt("Texto alternativo da imagem (obrigatório, descreve o que se vê):");
    if (alt === null) return null; // cancelou
    if (alt.trim()) return alt.trim();
    window.alert("O texto alternativo é obrigatório — descreve rapidamente o que a imagem mostra.");
  }
}

function pedirLegenda(): string | undefined {
  const legenda = window.prompt("Legenda por baixo da imagem (opcional — deixa em branco para não pôr):");
  return legenda?.trim() || undefined;
}

export function useInsercaoDeMedia(editor: Editor | null) {
  const [carregamento, setCarregamento] = useState<EstadoCarregamento>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inputImagemRef = useRef<HTMLInputElement>(null);
  const inputFicheiroRef = useRef<HTMLInputElement>(null);
  const inputCapaRef = useRef<HTMLInputElement>(null);

  const inserirImagem = useCallback(async (ficheiro: File) => {
    setErro(null);
    const alt = pedirTextoAlternativo();
    if (alt === null) return;
    const legenda = pedirLegenda();

    try {
      setCarregamento({ tipo: "imagem", progresso: 0 });
      const comprimida = await comprimirImagem(ficheiro);
      const { url } = await carregarMedia(comprimida, ficheiro.name.replace(/\.[^.]+$/, ".webp"), (p) =>
        setCarregamento({ tipo: "imagem", progresso: p }),
      );
      editor?.chain().focus().inserirFigura({ src: url, alt, legenda }).run();
    } catch (e) {
      setErro(e instanceof ErroDeCarregamento ? e.message : "Não foi possível carregar a imagem.");
    } finally {
      setCarregamento(null);
    }
  }, [editor]);

  const inserirFicheiroVideoOuAudio = useCallback(async (ficheiro: File) => {
    setErro(null);
    const ehVideo = ficheiro.type.startsWith("video/");
    const ehAudio = ficheiro.type.startsWith("audio/");
    if (!ehVideo && !ehAudio) {
      setErro("Escolhe um ficheiro de vídeo (mp4) ou áudio (mp3).");
      return;
    }
    if (ehVideo && ficheiro.size > LIMITE_VIDEO_MB * 1024 * 1024) {
      setErro(`Este vídeo tem mais de ${LIMITE_VIDEO_MB}MB — escolhe um ficheiro mais pequeno.`);
      return;
    }
    const legenda = pedirLegenda();

    try {
      setCarregamento({ tipo: ehVideo ? "vídeo" : "áudio", progresso: 0 });
      const { url } = await carregarMedia(ficheiro, ficheiro.name, (p) =>
        setCarregamento({ tipo: ehVideo ? "vídeo" : "áudio", progresso: p }),
      );
      if (ehVideo) {
        editor?.chain().focus().inserirVideo({ tipo: "ficheiro", src: url, legenda }).run();
      } else {
        editor?.chain().focus().inserirAudio({ src: url, legenda }).run();
      }
    } catch (e) {
      setErro(e instanceof ErroDeCarregamento ? e.message : "Não foi possível carregar o ficheiro.");
    } finally {
      setCarregamento(null);
    }
  }, [editor]);

  const carregarImagemCapa = useCallback(async (ficheiro: File, aoTerminar: (url: string) => void) => {
    setErro(null);
    try {
      setCarregamento({ tipo: "capa", progresso: 0 });
      const comprimida = await comprimirImagem(ficheiro);
      const { url } = await carregarMedia(comprimida, ficheiro.name.replace(/\.[^.]+$/, ".webp"), (p) =>
        setCarregamento({ tipo: "capa", progresso: p }),
      );
      aoTerminar(url);
    } catch (e) {
      setErro(e instanceof ErroDeCarregamento ? e.message : "Não foi possível carregar a imagem.");
    } finally {
      setCarregamento(null);
    }
  }, []);

  return {
    carregamento,
    erro,
    limparErro: () => setErro(null),
    inputImagemRef,
    inputFicheiroRef,
    inputCapaRef,
    abrirSeletorDeImagem: () => inputImagemRef.current?.click(),
    abrirSeletorDeFicheiro: () => inputFicheiroRef.current?.click(),
    abrirSeletorDeCapa: () => inputCapaRef.current?.click(),
    inserirImagem,
    inserirFicheiroVideoOuAudio,
    carregarImagemCapa,
  };
}

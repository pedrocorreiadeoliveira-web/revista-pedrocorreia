"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { extensoesTiptap } from "@/lib/tiptap/extensions";
import { YOUTUBE_REGEX, VIMEO_REGEX } from "@/lib/tiptap/video-node";
import { BarraFerramentas } from "./barra-ferramentas";
import { useInsercaoDeMedia } from "./usar-insercao-media";
import {
  guardarArtigo,
  publicarArtigo,
  despublicarArtigo,
  apagarArtigo,
  type DadosArtigo,
  type EtiquetaEntrada,
} from "./actions";
import type { Artigo, Categoria, Etiqueta } from "@/lib/tipos";

type Props = {
  artigo: Artigo;
  categorias: Categoria[];
  etiquetasIniciais: EtiquetaEntrada[];
  etiquetasExistentes: Etiqueta[];
};

function paraDataInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export function EditorArtigo({
  artigo,
  categorias,
  etiquetasIniciais,
  etiquetasExistentes,
}: Props) {
  const router = useRouter();

  const [titulo, setTitulo] = useState(artigo.titulo === "Sem título" ? "" : artigo.titulo);
  const [subtitulo, setSubtitulo] = useState(artigo.subtitulo ?? "");
  const [resumo, setResumo] = useState(artigo.resumo ?? "");
  const [categoriaId, setCategoriaId] = useState<string | null>(artigo.categoria_id);
  const [etiquetas, setEtiquetas] = useState<EtiquetaEntrada[]>(etiquetasIniciais);
  const [entradaEtiqueta, setEntradaEtiqueta] = useState("");
  const [imagemCapa, setImagemCapa] = useState(artigo.imagem_capa ?? "");
  const [imagemCapaAlt, setImagemCapaAlt] = useState(artigo.imagem_capa_alt ?? "");
  const [seoTitulo, setSeoTitulo] = useState(artigo.seo_titulo ?? "");
  const [seoDescricao, setSeoDescricao] = useState(artigo.seo_descricao ?? "");
  const [publicadoEm, setPublicadoEm] = useState(paraDataInput(artigo.publicado_em));
  const [estado, setEstado] = useState(artigo.estado);

  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [sujo, setSujo] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erroAoGuardar, setErroAoGuardar] = useState(false);
  const [aPublicar, setAPublicar] = useState(false);

  const marcarAlterado = useCallback(() => setSujo(true), []);

  const editor = useEditor({
    extensions: extensoesTiptap({ comPlaceholder: true }),
    content: artigo.conteudo as JSONContent,
    immediatelyRender: false,
    onUpdate: () => marcarAlterado(),
    editorProps: {
      handlePaste: (view, event) => {
        const texto = event.clipboardData?.getData("text/plain")?.trim();
        if (!texto) return false;
        const ehYoutube = YOUTUBE_REGEX.test(texto);
        const ehVimeo = !ehYoutube && VIMEO_REGEX.test(texto);
        if (!ehYoutube && !ehVimeo) return false;
        view.dispatch(
          view.state.tr.replaceSelectionWith(
            view.state.schema.nodes.video.create({
              tipo: ehYoutube ? "youtube" : "vimeo",
              src: texto,
            }),
          ),
        );
        return true;
      },
    },
  });

  const {
    carregamento,
    erro: erroMedia,
    limparErro: limparErroMedia,
    inputImagemRef,
    inputFicheiroRef,
    inputCapaRef,
    abrirSeletorDeImagem,
    abrirSeletorDeFicheiro,
    abrirSeletorDeCapa,
    inserirImagem,
    inserirFicheiroVideoOuAudio,
    carregarImagemCapa,
  } = useInsercaoDeMedia(editor);

  const reunirDados = useCallback((): DadosArtigo => {
    return {
      titulo: titulo.trim() || "Sem título",
      subtitulo,
      resumo,
      conteudo: (editor?.getJSON() ?? artigo.conteudo) as JSONContent,
      categoriaId,
      etiquetas,
      imagemCapa: imagemCapa || null,
      imagemCapaAlt: imagemCapaAlt || null,
      seoTitulo,
      seoDescricao,
      publicadoEm: publicadoEm ? new Date(publicadoEm).toISOString() : null,
    };
  }, [
    titulo,
    subtitulo,
    resumo,
    editor,
    artigo.conteudo,
    categoriaId,
    etiquetas,
    imagemCapa,
    imagemCapaAlt,
    seoTitulo,
    seoDescricao,
    publicadoEm,
  ]);

  // Grava automaticamente 1.5s depois da última alteração. `sujo` só é
  // ligado por eventos (onChange / onUpdate do editor), nunca por este
  // efeito — o efeito só reage a essa mudança e agenda a gravação.
  useEffect(() => {
    if (!sujo) return;
    const temporizador = setTimeout(async () => {
      setAGuardar(true);
      const resultado = await guardarArtigo(artigo.id, reunirDados());
      setAGuardar(false);
      setErroAoGuardar(!resultado.sucesso);
      setSujo(false);
    }, 1500);
    return () => clearTimeout(temporizador);
  }, [sujo, reunirDados, artigo.id]);

  const guardarAgora = async () => {
    setSujo(false);
    setAGuardar(true);
    const resultado = await guardarArtigo(artigo.id, reunirDados());
    setAGuardar(false);
    setErroAoGuardar(!resultado.sucesso);
  };

  const préVisualizar = async () => {
    await guardarAgora();
    window.open(`/painel/artigo/${artigo.id}/pre-visualizar`, "_blank");
  };

  const publicar = async () => {
    setAPublicar(true);
    setSujo(false);
    const resultado = await publicarArtigo(artigo.id, reunirDados());
    setAPublicar(false);
    setErroAoGuardar(!resultado.sucesso);
    if (resultado.sucesso) setEstado("publicado");
  };

  const voltarARascunho = async () => {
    await despublicarArtigo(artigo.id);
    setEstado("rascunho");
  };

  const apagar = async () => {
    if (!window.confirm("Apagar este artigo? Não é possível desfazer.")) return;
    await apagarArtigo(artigo.id);
    router.push("/painel");
  };

  const adicionarEtiqueta = (nome: string) => {
    const limpo = nome.trim();
    if (!limpo) return;
    if (etiquetas.some((e) => e.nome.toLowerCase() === limpo.toLowerCase())) {
      setEntradaEtiqueta("");
      return;
    }
    const existente = etiquetasExistentes.find(
      (e) => e.nome.toLowerCase() === limpo.toLowerCase(),
    );
    setEtiquetas((atual) => [
      ...atual,
      existente ? { id: existente.id, nome: existente.nome } : { nome: limpo },
    ]);
    setEntradaEtiqueta("");
    marcarAlterado();
  };

  const textoGravacao = aGuardar
    ? "A guardar…"
    : erroAoGuardar
      ? "Não foi possível guardar"
      : sujo
        ? "Alterações por guardar"
        : "Guardado";

  return (
    <div className="flex-1 flex">
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-20 bg-paper-2 border-b border-ink/10 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`font-tecnico text-xs px-2 py-0.5 border ${
                estado === "publicado"
                  ? "border-emerald-700 text-emerald-800"
                  : "border-ink/20 text-gray"
              }`}
            >
              {estado === "publicado" ? "publicado" : "rascunho"}
            </span>
            <span className="font-tecnico text-xs text-gray">
              {textoGravacao}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarAberta((v) => !v)}
              className="font-tecnico text-xs text-gray hover:text-ink px-2"
            >
              {sidebarAberta ? "Esconder detalhes" : "Mostrar detalhes"}
            </button>
            <button
              type="button"
              onClick={préVisualizar}
              className="font-tecnico text-sm border border-ink/30 px-4 py-2 hover:border-ink"
            >
              Pré-visualizar
            </button>
            <button
              type="button"
              onClick={guardarAgora}
              className="font-tecnico text-sm border border-ink/30 px-4 py-2 hover:border-ink"
            >
              Guardar rascunho
            </button>
            {estado === "publicado" ? (
              <button
                type="button"
                onClick={voltarARascunho}
                className="font-tecnico text-sm border border-ink px-4 py-2 hover:bg-ink hover:text-paper"
              >
                Despublicar
              </button>
            ) : (
              <button
                type="button"
                onClick={publicar}
                disabled={aPublicar}
                className="font-tecnico text-sm bg-gold text-ink px-5 py-2 hover:bg-gold-2 disabled:opacity-50"
              >
                {aPublicar ? "A publicar…" : "Publicar"}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-[42rem] mx-auto px-6 py-12">
          <textarea
            value={titulo}
            onChange={(ev) => { setTitulo(ev.target.value); marcarAlterado(); }}
            placeholder="Título do artigo"
            rows={1}
            className="w-full resize-none overflow-hidden bg-transparent font-literario font-semibold text-4xl leading-tight placeholder:text-ink/25 focus:outline-none mb-4"
            onInput={(ev) => {
              const el = ev.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <input
            value={subtitulo}
            onChange={(ev) => { setSubtitulo(ev.target.value); marcarAlterado(); }}
            placeholder="Subtítulo (opcional)"
            className="w-full bg-transparent font-literario text-xl text-gray placeholder:text-ink/20 focus:outline-none mb-10"
          />

          <BarraFerramentas
            editor={editor}
            aoClicarImagem={abrirSeletorDeImagem}
            aoClicarFicheiroMedia={abrirSeletorDeFicheiro}
          />

          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(ev) => {
              const ficheiro = ev.target.files?.[0];
              ev.target.value = "";
              if (ficheiro) inserirImagem(ficheiro);
            }}
          />
          <input
            ref={inputFicheiroRef}
            type="file"
            accept="video/mp4,audio/mpeg,audio/mp3"
            hidden
            onChange={(ev) => {
              const ficheiro = ev.target.files?.[0];
              ev.target.value = "";
              if (ficheiro) inserirFicheiroVideoOuAudio(ficheiro);
            }}
          />

          {carregamento && (
            <div className="mb-4 font-tecnico text-xs text-gray">
              A carregar {carregamento.tipo}… {carregamento.progresso}%
              <div className="h-1 bg-ink/10 mt-1">
                <div
                  className="h-1 bg-gold transition-all"
                  style={{ width: `${carregamento.progresso}%` }}
                />
              </div>
            </div>
          )}
          {erroMedia && (
            <p className="mb-4 font-tecnico text-xs text-red-700">
              {erroMedia}{" "}
              <button type="button" onClick={limparErroMedia} className="underline">
                Fechar
              </button>
            </p>
          )}

          <EditorContent editor={editor} className="corpo-leitura" />
        </div>
      </div>

      {sidebarAberta && (
        <aside className="w-80 shrink-0 border-l border-ink/10 bg-paper px-6 py-8 overflow-y-auto">
          <h2 className="font-tecnico text-xs tracking-wide text-gray mb-6">
            Detalhes
          </h2>

          <div className="grid gap-6">
            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Resumo
              </label>
              <textarea
                value={resumo}
                onChange={(ev) => { setResumo(ev.target.value); marcarAlterado(); }}
                rows={3}
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-literario text-sm focus-visible:border-gold resize-none"
              />
            </div>

            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Categoria
              </label>
              <select
                value={categoriaId ?? ""}
                onChange={(ev) => { setCategoriaId(ev.target.value || null); marcarAlterado(); }}
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-sm focus-visible:border-gold"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {etiquetas.map((e) => (
                  <span
                    key={e.id ?? e.nome}
                    className="font-tecnico text-xs bg-paper-2 border border-ink/15 px-2 py-1 flex items-center gap-1.5"
                  >
                    {e.nome}
                    <button
                      type="button"
                      onClick={() => {
                        setEtiquetas((atual) => atual.filter((x) => x !== e));
                        marcarAlterado();
                      }}
                      className="text-gray hover:text-ink"
                      aria-label={`Remover etiqueta ${e.nome}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={entradaEtiqueta}
                onChange={(ev) => setEntradaEtiqueta(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === ",") {
                    ev.preventDefault();
                    adicionarEtiqueta(entradaEtiqueta);
                  }
                }}
                placeholder="Escreve e prime Enter"
                list="etiquetas-existentes"
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-literario text-sm focus-visible:border-gold"
              />
              <datalist id="etiquetas-existentes">
                {etiquetasExistentes.map((e) => (
                  <option key={e.id} value={e.nome} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Imagem de capa (endereço)
              </label>
              <input
                value={imagemCapa}
                onChange={(ev) => { setImagemCapa(ev.target.value); marcarAlterado(); }}
                placeholder="https://…"
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-xs focus-visible:border-gold mb-2"
              />
              <input
                value={imagemCapaAlt}
                onChange={(ev) => { setImagemCapaAlt(ev.target.value); marcarAlterado(); }}
                placeholder="Texto alternativo da imagem"
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-xs focus-visible:border-gold mb-2"
              />
              <button
                type="button"
                onClick={abrirSeletorDeCapa}
                className="font-tecnico text-xs border border-ink/25 px-3 py-1.5 hover:border-ink"
              >
                Carregar imagem
              </button>
              <input
                ref={inputCapaRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(ev) => {
                  const ficheiro = ev.target.files?.[0];
                  ev.target.value = "";
                  if (ficheiro) carregarImagemCapa(ficheiro, (url) => { setImagemCapa(url); marcarAlterado(); });
                }}
              />
            </div>

            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Título para o Google
              </label>
              <input
                value={seoTitulo}
                onChange={(ev) => { setSeoTitulo(ev.target.value); marcarAlterado(); }}
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-xs focus-visible:border-gold"
              />
            </div>
            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Descrição para o Google
              </label>
              <textarea
                value={seoDescricao}
                onChange={(ev) => { setSeoDescricao(ev.target.value); marcarAlterado(); }}
                rows={2}
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-xs focus-visible:border-gold resize-none"
              />
            </div>

            <div>
              <label className="block font-tecnico text-xs text-gray mb-1.5">
                Data de publicação
              </label>
              <input
                type="datetime-local"
                value={publicadoEm}
                onChange={(ev) => { setPublicadoEm(ev.target.value); marcarAlterado(); }}
                className="w-full border border-ink/15 bg-paper px-3 py-2 font-tecnico text-xs focus-visible:border-gold"
              />
            </div>

            <button
              type="button"
              onClick={apagar}
              className="font-tecnico text-xs text-red-700 hover:underline justify-self-start mt-4 text-left"
            >
              Apagar artigo
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

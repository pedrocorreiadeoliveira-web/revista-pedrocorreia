"use client";

import type { Editor } from "@tiptap/react";
import type { TipoDeFonte } from "@/lib/tiptap/fonte-mark";

function BotaoBarra({
  ativo,
  onClick,
  titulo,
  children,
}: {
  ativo?: boolean;
  onClick: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={titulo}
      onClick={onClick}
      className={`px-2.5 py-1.5 font-tecnico text-sm border ${
        ativo
          ? "border-ink bg-ink text-paper"
          : "border-transparent text-ink/70 hover:border-ink/20"
      }`}
    >
      {children}
    </button>
  );
}

export function BarraFerramentas({
  editor,
  aoClicarImagem,
  aoClicarFicheiroMedia,
}: {
  editor: Editor | null;
  aoClicarImagem?: () => void;
  aoClicarFicheiroMedia?: () => void;
}) {
  if (!editor) return null;

  const definirLigacao = () => {
    const anterior = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço da ligação", anterior ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const fonteAtual: TipoDeFonte = editor.isActive("fonte", { tipo: "destaque" })
    ? "destaque"
    : editor.isActive("fonte", { tipo: "tecnico" })
      ? "tecnico"
      : "literario";

  return (
    <div className="flex flex-wrap items-center gap-1 border border-ink/15 bg-paper px-2 py-1.5 mb-6 sticky top-0 z-10">
      <BotaoBarra
        titulo="Negrito"
        ativo={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>N</strong>
      </BotaoBarra>
      <BotaoBarra
        titulo="Itálico"
        ativo={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </BotaoBarra>
      <BotaoBarra
        titulo="Sublinhado"
        ativo={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">S</span>
      </BotaoBarra>

      <span className="w-px h-5 bg-ink/15 mx-1" />

      <BotaoBarra
        titulo="Título 2"
        ativo={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </BotaoBarra>
      <BotaoBarra
        titulo="Título 3"
        ativo={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </BotaoBarra>
      <BotaoBarra
        titulo="Citação em destaque"
        ativo={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;&rdquo;
      </BotaoBarra>

      <span className="w-px h-5 bg-ink/15 mx-1" />

      <BotaoBarra
        titulo="Lista com pontos"
        ativo={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </BotaoBarra>
      <BotaoBarra
        titulo="Lista numerada"
        ativo={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </BotaoBarra>
      <BotaoBarra
        titulo="Separador"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </BotaoBarra>
      <BotaoBarra
        titulo="Ligação"
        ativo={editor.isActive("link")}
        onClick={definirLigacao}
      >
        Lig.
      </BotaoBarra>

      <span className="w-px h-5 bg-ink/15 mx-1" />

      <BotaoBarra
        titulo="Alinhar à esquerda"
        ativo={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ⟸
      </BotaoBarra>
      <BotaoBarra
        titulo="Centrar"
        ativo={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ⟺
      </BotaoBarra>
      <BotaoBarra
        titulo="Alinhar à direita"
        ativo={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ⟹
      </BotaoBarra>

      <span className="w-px h-5 bg-ink/15 mx-1" />

      <select
        aria-label="Tipo de letra"
        value={fonteAtual}
        onChange={(ev) =>
          editor
            .chain()
            .focus()
            .definirFonte(ev.target.value as TipoDeFonte)
            .run()
        }
        className="font-tecnico text-sm bg-transparent border border-transparent hover:border-ink/20 px-2 py-1.5"
      >
        <option value="literario">Literário</option>
        <option value="destaque">Destaque</option>
        <option value="tecnico">Técnico</option>
      </select>

      {(aoClicarImagem || aoClicarFicheiroMedia) && (
        <>
          <span className="w-px h-5 bg-ink/15 mx-1" />
          {aoClicarImagem && (
            <BotaoBarra titulo="Inserir imagem" onClick={aoClicarImagem}>
              Img
            </BotaoBarra>
          )}
          {aoClicarFicheiroMedia && (
            <BotaoBarra titulo="Inserir vídeo ou áudio (ficheiro)" onClick={aoClicarFicheiroMedia}>
              Media
            </BotaoBarra>
          )}
        </>
      )}
    </div>
  );
}

import { Node, mergeAttributes } from "@tiptap/core";

export interface FiguraOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figura: {
      inserirFigura: (attrs: { src: string; alt: string; legenda?: string }) => ReturnType;
    };
  }
}

// Uma imagem com texto alternativo obrigatório e legenda opcional — nunca
// uma <img> nua. Ver src/app/painel/artigo/[id]/inserir-media.ts para o
// fluxo que garante o alt antes de chegar aqui.
export const Figura = Node.create<FiguraOptions>({
  name: "figura",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      legenda: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-figura]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, legenda } = HTMLAttributes as {
      src: string;
      alt: string;
      legenda: string | null;
    };
    const filhos: Array<[string, Record<string, unknown>] | [string, Record<string, unknown>, string]> = [
      ["img", { src, alt }],
    ];
    if (legenda) filhos.push(["figcaption", {}, legenda]);
    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes, { "data-figura": "" }),
      ...filhos,
    ];
  },

  addCommands() {
    return {
      inserirFigura:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

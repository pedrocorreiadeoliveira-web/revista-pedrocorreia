import { Mark, mergeAttributes } from "@tiptap/core";

// A revista só permite três tipos de letra, para manter identidade visual
// coerente entre artigos — ver aviso no painel. Nada de cor livre, nada de
// mais fontes.
export type TipoDeFonte = "literario" | "destaque" | "tecnico";

export interface FonteOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fonte: {
      definirFonte: (tipo: TipoDeFonte) => ReturnType;
      removerFonte: () => ReturnType;
    };
  }
}

export const FonteMark = Mark.create<FonteOptions>({
  name: "fonte",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      tipo: {
        default: "literario",
        parseHTML: (element) => element.getAttribute("data-fonte"),
        renderHTML: (attributes) => ({ "data-fonte": attributes.tipo }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-fonte]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `fonte-${HTMLAttributes["data-fonte"]}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      definirFonte:
        (tipo: TipoDeFonte) =>
        ({ commands }) => {
          if (tipo === "literario") {
            return commands.unsetMark(this.name);
          }
          return commands.setMark(this.name, { tipo });
        },
      removerFonte:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

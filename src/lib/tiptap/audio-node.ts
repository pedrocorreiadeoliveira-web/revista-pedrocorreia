import { Node, mergeAttributes } from "@tiptap/core";

export interface AudioOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      inserirAudio: (attrs: { src: string; legenda?: string }) => ReturnType;
    };
  }
}

// Para quando o Pedro quiser publicar o texto lido em voz.
export const Audio = Node.create<AudioOptions>({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      legenda: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-audio]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, legenda } = HTMLAttributes as { src: string; legenda: string | null };
    const filhos: Array<[string, Record<string, unknown>] | [string, Record<string, unknown>, string]> = [
      ["audio", { src, controls: "true", preload: "metadata" }],
    ];
    if (legenda) filhos.push(["p", { class: "audio-legenda" }, legenda]);

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { "data-audio": "", class: "audio-player" }),
      ...filhos,
    ];
  },

  addCommands() {
    return {
      inserirAudio:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

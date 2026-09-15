import { Node, mergeAttributes } from "@tiptap/core";

export type TipoDeVideo = "youtube" | "vimeo" | "ficheiro";

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      inserirVideo: (attrs: { tipo: TipoDeVideo; src: string; legenda?: string }) => ReturnType;
    };
  }
}

export const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
export const VIMEO_REGEX = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;

function embedUrl(tipo: TipoDeVideo, src: string): string {
  if (tipo === "youtube") {
    const id = src.match(YOUTUBE_REGEX)?.[1] ?? src;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (tipo === "vimeo") {
    const id = src.match(VIMEO_REGEX)?.[1] ?? src;
    return `https://player.vimeo.com/video/${id}`;
  }
  return src;
}

// Vídeo do YouTube/Vimeo (colado como ligação) ou ficheiro mp4 carregado
// para o Storage — mesmo nó, o "tipo" decide como se desenha.
export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      tipo: { default: "ficheiro" },
      src: { default: null },
      legenda: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { tipo, src, legenda } = HTMLAttributes as {
      tipo: TipoDeVideo;
      src: string;
      legenda: string | null;
    };

    const conteudo =
      tipo === "ficheiro"
        ? (["video", { src, controls: "true", preload: "metadata" }] as [string, Record<string, unknown>])
        : ([
            "iframe",
            {
              src: embedUrl(tipo, src),
              loading: "lazy",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: "true",
              frameborder: "0",
            },
          ] as [string, Record<string, unknown>]);

    const filhos: Array<[string, Record<string, unknown>] | [string, Record<string, unknown>, string]> = [
      conteudo,
    ];
    if (legenda) filhos.push(["p", { class: "video-legenda" }, legenda]);

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-video": "",
        class: tipo === "ficheiro" ? "video-ficheiro" : "video-embed",
      }),
      ...filhos,
    ];
  },

  addCommands() {
    return {
      inserirVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

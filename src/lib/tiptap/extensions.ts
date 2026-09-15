import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { FonteMark } from "./fonte-mark";
import { Figura } from "./figura-node";
import { Video } from "./video-node";
import { Audio } from "./audio-node";

// Extensões partilhadas entre o editor (painel) e a leitura (pré-visualização
// e, na Fase 4, o site público) — têm de ser exatamente as mesmas dos dois
// lados para o HTML gerado a partir do JSON bater sempre certo.
export function extensoesTiptap({ comPlaceholder = false } = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Figura,
    Video,
    Audio,
    FonteMark,
    ...(comPlaceholder
      ? [Placeholder.configure({ placeholder: "Escreve o artigo…" })]
      : []),
  ];
}

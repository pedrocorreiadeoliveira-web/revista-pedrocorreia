import { generateHTML } from "@tiptap/html";
import { generateText } from "@tiptap/core";
import { extensoesTiptap } from "./extensions";
import type { JSONContent } from "@tiptap/core";

const extensoes = extensoesTiptap();

export function converterParaHtml(conteudo: JSONContent): string {
  if (!conteudo || !conteudo.content || conteudo.content.length === 0) {
    return "";
  }
  return generateHTML(conteudo, extensoes);
}

export function converterParaTexto(conteudo: JSONContent): string {
  if (!conteudo || !conteudo.content || conteudo.content.length === 0) {
    return "";
  }
  return generateText(conteudo, extensoes);
}

import type { Metadata } from "next";
import { BlocoConversao } from "@/components/bloco-conversao";

export const metadata: Metadata = {
  title: "Sobre — Revista",
  description: "Pedro Correia de Oliveira, mentor de desenvolvimento pessoal.",
};

export default function PaginaSobre() {
  return (
    <>
      <div className="max-w-[42rem] mx-auto px-6 py-16">
        <h1 className="font-literario font-semibold text-4xl mb-8">Sobre</h1>
        <div className="corpo-leitura">
          <p>
            Sou Pedro Correia de Oliveira, mentor de desenvolvimento pessoal em Portugal.
            Escrevo há dezasseis anos — primeiro para mim, hoje para quem me acompanha
            nas redes sociais.
          </p>
          <p>
            Trabalho três temas que se cruzam sempre: limites, relações e autoestima.
            No fundo, é tudo a mesma pergunta — a distância entre quem somos e quem
            dizemos ser, e o que fazemos com ela.
          </p>
          <p>
            Esta revista é onde escrevo sobre o que faço na mentoria: o método, os
            temas que trabalho com quem me procura, e as ideias que sustentam esse
            trabalho. Se algum texto te tocar, o próximo passo natural é conversarmos.
          </p>
        </div>
      </div>
      <BlocoConversao />
    </>
  );
}

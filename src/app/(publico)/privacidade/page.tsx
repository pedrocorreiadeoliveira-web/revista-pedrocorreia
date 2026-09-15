import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade — Revista",
  description: "Que dados são recolhidos nesta revista, para quê, e como pedir a sua eliminação.",
};

export default function PaginaPrivacidade() {
  return (
    <div className="max-w-[42rem] mx-auto px-6 py-16">
      <h1 className="font-literario font-semibold text-3xl mb-8">Privacidade</h1>
      <div className="corpo-leitura">
        <p>
          Esta página explica, em português simples, que dados esta revista recolhe,
          para quê, por quanto tempo, e como pedir a sua eliminação.
        </p>

        <h2>Comentários</h2>
        <p>
          Ao comentares um artigo, guardamos o teu nome, o email e o texto do
          comentário. O nome e o comentário ficam visíveis publicamente depois de
          aprovados; o email nunca é publicado — serve só para contacto e para
          evitar comentários repetidos.
        </p>

        <h2>Subscrição por email</h2>
        <p>
          Se subscreveres, guardamos o teu email só para te enviar novos textos.
          Se marcares a caixa de consentimento ao comentar, podes também receber
          materiais relacionados com o tema do artigo que estavas a ler. Podes
          deixar de receber a qualquer momento através da ligação de cancelamento
          em qualquer email.
        </p>

        <h2>Quanto tempo guardamos os dados</h2>
        <p>
          Enquanto a conversa ou a subscrição estiverem ativas. Pedidos de
          eliminação são tratados o mais rapidamente possível.
        </p>

        <h2>Como pedir a eliminação dos teus dados</h2>
        <p>
          Escreve para o email de contacto da mentoria a pedir a remoção dos teus
          dados — comentários, subscrição e qualquer registo associado ao teu
          email são apagados.
        </p>
      </div>
    </div>
  );
}

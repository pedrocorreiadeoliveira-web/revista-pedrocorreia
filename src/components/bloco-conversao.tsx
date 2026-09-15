import { obterDefinicoesSite } from "@/lib/dados-publicos";

export async function BlocoConversao() {
  const { cta_frase, cta_apoio } = await obterDefinicoesSite();
  const destino = process.env.CTA_DESTINO ?? "/sobre";

  return (
    <section className="bg-ink text-paper text-center px-6 py-20">
      <p className="font-literario italic text-2xl sm:text-3xl max-w-xl mx-auto mb-3">
        {cta_frase}
      </p>
      <p className="font-tecnico text-sm text-paper/60 mb-8">{cta_apoio}</p>
      <a
        href={destino}
        className="inline-block border border-gold text-gold-2 font-tecnico text-sm px-8 py-3 hover:bg-gold hover:text-ink transition-colors"
      >
        Falar comigo
      </a>
    </section>
  );
}

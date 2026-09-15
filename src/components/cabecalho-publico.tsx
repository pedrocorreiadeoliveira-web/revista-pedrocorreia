import Link from "next/link";

export function CabecalhoPublico() {
  return (
    <header className="bg-ink text-paper">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-literario text-xl">
          Revista
        </Link>
        <nav className="flex items-center gap-6 font-tecnico text-sm text-paper/70">
          <Link href="/artigos" className="hover:text-gold-2">
            Artigos
          </Link>
          <Link href="/sobre" className="hover:text-gold-2">
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  );
}

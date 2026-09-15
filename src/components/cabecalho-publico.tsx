import Link from "next/link";
import Image from "next/image";

export function CabecalhoPublico() {
  return (
    <header className="bg-ink text-paper">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-literario text-xl">Revista</span>
        </Link>
        <nav className="flex items-center gap-6 font-tecnico text-sm text-paper/70">
          <Link href="/artigos" className="hover:text-gold-2">
            Artigos
          </Link>
          <Link href="/sobre" className="hover:text-gold-2">
            Sobre
          </Link>
          <Link href="/sobre" aria-label="Sobre Pedro Correia de Oliveira" className="shrink-0">
            <Image
              src="/pedro-foto.jpg"
              alt="Pedro Correia de Oliveira"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover border border-gold/40"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sairDoPainel } from "./actions";

// O proxy (src/proxy.ts) já garante que só chega aqui um administrador com
// sessão válida — este layout só precisa de mostrar quem está autenticado.
export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { count: pendentes } = await supabase
    .from("comentarios")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendente");

  const seccoes = [
    { href: "/painel", nome: "Artigos" },
    { href: "/painel/media", nome: "Media" },
    { href: "/painel/subscritores", nome: "Subscritores" },
    { href: "/painel/leads", nome: "Leads" },
    {
      href: "/painel/comentarios",
      nome: pendentes ? `Comentários (${pendentes})` : "Comentários",
    },
    { href: "/painel/definicoes", nome: "Definições" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper-2">
      <header className="bg-ink text-paper px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-literario text-lg">Revista</span>
          <nav className="flex items-center gap-4 font-tecnico text-xs text-paper/70">
            {seccoes.map((seccao) => (
              <Link key={seccao.href} href={seccao.href} className="hover:text-gold-2">
                {seccao.nome}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 font-tecnico text-xs text-paper/60">
          <span>{user?.email}</span>
          <form action={sairDoPainel}>
            <button type="submit" className="hover:text-gold-2">
              Sair
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

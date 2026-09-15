import { CabecalhoPublico } from "@/components/cabecalho-publico";
import { RodapePublico } from "@/components/rodape-publico";

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CabecalhoPublico />
      <main className="flex-1 bg-paper">{children}</main>
      <RodapePublico />
    </>
  );
}

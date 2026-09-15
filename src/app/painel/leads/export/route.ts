import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function paraCsv(linhas: string[][]): string {
  return linhas
    .map((linha) => linha.map((campo) => `"${String(campo ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("email,nome,origem,estado_envio,criado_em,artigos(titulo)")
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const csv = paraCsv([
    ["email", "nome", "origem", "artigo_entrada", "estado_envio", "criado_em"],
    ...(data ?? []).map((l) => {
      const artigo = l.artigos as unknown as { titulo: string } | null;
      return [l.email, l.nome ?? "", l.origem, artigo?.titulo ?? "", l.estado_envio, l.criado_em];
    }),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}

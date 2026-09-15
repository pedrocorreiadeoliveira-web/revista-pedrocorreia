import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function paraCsv(linhas: string[][]): string {
  return linhas
    .map((linha) =>
      linha
        .map((campo) => `"${String(campo ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscritores")
    .select("email,origem,criado_em")
    .order("criado_em", { ascending: false });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const csv = paraCsv([
    ["email", "origem", "criado_em"],
    ...(data ?? []).map((s) => [s.email, s.origem ?? "", s.criado_em]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscritores.csv"',
    },
  });
}

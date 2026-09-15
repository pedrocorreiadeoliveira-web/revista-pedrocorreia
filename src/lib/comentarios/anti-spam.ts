import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

export const TEMPO_MINIMO_PREENCHIMENTO_MS = 3000;
export const COMPRIMENTO_MAXIMO_MENSAGEM = 3000;
export const LIMITE_COMENTARIOS_POR_HORA = 5;

export async function obterIpHash(): Promise<string> {
  const cabecalhos = await headers();
  const ip =
    cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    cabecalhos.get("x-real-ip") ||
    "desconhecido";
  return createHash("sha256").update(ip).digest("hex");
}

export function contarLigacoes(texto: string): number {
  return (texto.match(/https?:\/\/\S+/gi) ?? []).length;
}

import "server-only";
import { createHmac } from "node:crypto";

// Token simples para a ligação de cancelamento de subscrição de um clique —
// não precisa de sessão. Usa a chave de serviço como segredo (já é privada
// e só vive no servidor).
function segredo(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "segredo-de-desenvolvimento";
}

export function gerarTokenCancelamento(email: string): string {
  return createHmac("sha256", segredo()).update(email.toLowerCase().trim()).digest("hex").slice(0, 32);
}

export function tokenCancelamentoValido(email: string, token: string): boolean {
  return gerarTokenCancelamento(email) === token;
}

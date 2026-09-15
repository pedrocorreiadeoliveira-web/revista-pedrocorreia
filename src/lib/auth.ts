import "server-only";

// Lista de administradores — os únicos emails autorizados a entrar em /painel.
// Definida na variável de ambiente ADMIN_EMAILS (separados por vírgula).
// O mesmo valor tem de estar guardado na base de dados (app.admin_emails) —
// ver supabase/migrations/0001_init.sql e README.md.
function listaDeAdministradores(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return listaDeAdministradores().includes(email.trim().toLowerCase());
}

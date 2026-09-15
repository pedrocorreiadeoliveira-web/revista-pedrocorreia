import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a chave de serviço — ignora RLS por completo.
// NUNCA importar este ficheiro de um Client Component. Usar apenas em rotas de
// servidor (route handlers, server actions) que já verificaram, por si só, que
// quem está a chamar é um administrador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

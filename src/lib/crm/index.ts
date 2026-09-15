import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fornecedorNenhum } from "./nenhum";
import { fornecedorWebhook } from "./webhook";
import type { LeadParaCrm } from "./tipos";

export type { LeadParaCrm } from "./tipos";

function obterFornecedor() {
  const tipo = process.env.CRM_PROVIDER ?? "nenhum";
  return tipo === "webhook" ? fornecedorWebhook : fornecedorNenhum;
}

const TENTATIVAS_MAXIMAS = 3;
const ESPERA_BASE_MS = 500;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Envia a lead ao fornecedor de CRM configurado, com até 3 tentativas e
// espera crescente entre elas. Cada tentativa fica registada em
// leads_envios, mesmo quando falha — nunca lança erro para quem chama.
export async function enviarLeadAoCrm(leadId: string, lead: LeadParaCrm): Promise<void> {
  const fornecedor = obterFornecedor();
  const admin = createAdminClient();

  for (let tentativa = 1; tentativa <= TENTATIVAS_MAXIMAS; tentativa++) {
    const resultado = await fornecedor.enviarLead(lead);

    await admin.from("leads_envios").insert({
      lead_id: leadId,
      tentativa,
      sucesso: resultado.sucesso,
      resposta: resultado.resposta,
    });

    if (resultado.sucesso) {
      await admin.from("leads").update({ estado_envio: "enviado" }).eq("id", leadId);
      return;
    }

    if (tentativa < TENTATIVAS_MAXIMAS) {
      await esperar(ESPERA_BASE_MS * 2 ** (tentativa - 1));
    }
  }

  await admin.from("leads").update({ estado_envio: "falhou" }).eq("id", leadId);
}

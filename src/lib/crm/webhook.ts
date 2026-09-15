import type { FornecedorCrm, LeadParaCrm, ResultadoEnvioCrm } from "./tipos";

// Fornecedor "webhook" — envia a lead por POST em JSON para qualquer CRM que
// aceite um endereço de webhook (Zapier, Make, HubSpot via automação, etc).
export const fornecedorWebhook: FornecedorCrm = {
  async enviarLead(lead: LeadParaCrm): Promise<ResultadoEnvioCrm> {
    const url = process.env.CRM_WEBHOOK_URL;
    if (!url) {
      return { sucesso: false, resposta: "CRM_WEBHOOK_URL não está definido." };
    }

    const cabecalhos: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.CRM_WEBHOOK_SECRET) {
      cabecalhos.Authorization = `Bearer ${process.env.CRM_WEBHOOK_SECRET}`;
    }

    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: cabecalhos,
        body: JSON.stringify({
          email: lead.email,
          nome: lead.nome,
          origem: lead.origem,
          artigo: lead.artigoTitulo,
          categoria: lead.categoriaNome,
          consentimento_em: lead.consentimentoEm,
        }),
      });

      if (!resposta.ok) {
        return { sucesso: false, resposta: `HTTP ${resposta.status}` };
      }
      return { sucesso: true, resposta: `HTTP ${resposta.status}` };
    } catch (erro) {
      return { sucesso: false, resposta: erro instanceof Error ? erro.message : "Erro desconhecido" };
    }
  },
};

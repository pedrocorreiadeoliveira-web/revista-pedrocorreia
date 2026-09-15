import type { FornecedorCrm, ResultadoEnvioCrm } from "./tipos";

// Fornecedor "nenhum" — a lead só fica gravada na tabela leads, sem enviar
// para fora. É o valor por omissão até haver um CRM real ligado.
export const fornecedorNenhum: FornecedorCrm = {
  async enviarLead(): Promise<ResultadoEnvioCrm> {
    return { sucesso: true, resposta: "Sem fornecedor de CRM configurado — só gravado localmente." };
  },
};

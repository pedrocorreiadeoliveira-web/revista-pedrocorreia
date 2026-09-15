export type LeadParaCrm = {
  id: string;
  email: string;
  nome: string | null;
  origem: "comentario" | "subscricao" | "ebook";
  artigoTitulo: string | null;
  categoriaNome: string | null;
  consentimentoEm: string | null;
};

export type ResultadoEnvioCrm = { sucesso: boolean; resposta: string };

// Contrato que qualquer fornecedor de CRM tem de cumprir. Para acrescentar um
// fornecedor novo (ex: HubSpot direto), basta criar um ficheiro que
// implemente isto e adicioná-lo ao switch em ./index.ts — o resto da
// aplicação não muda.
export interface FornecedorCrm {
  enviarLead(lead: LeadParaCrm): Promise<ResultadoEnvioCrm>;
}

export interface IUc {
  codigo: number;
  endereco: string;
  situacao: string;
  hidrometro: number;
}

export interface IUcDetail {
  referencia: string;
  situacao: string;
  valor: number;
  vencimento: string;
  codigoBarras: string | null;
  pix: string | null;
  documentoId: string | null;
}

export interface DueDate {
  ucId: string;
  organizacaoId: string;
  codigo: string;
  cpf: string;
  diaOpcaoVencimento: string;
}

export interface Pessoa {
  bairro: string;
  celular: string;
  cep: string;
  codigo: string;
  complemento: string;
  cpfCnpj: string;
  email: string;
  logradouro: string;
  lote: string;
  municipio: string;
  nome: string;
  numero: string;
  quadra: string;
  tipo: string;
}
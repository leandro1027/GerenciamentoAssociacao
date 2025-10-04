export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  role: 'USER' | 'ADMIN';
  telefone?: string;
  profileImageUrl?: string;
  pontos:number
}

export type StatusVoluntario = 'pendente' | 'aprovado' | 'recusado';

export interface Voluntario {
  id: number;
  usuarioId: number;
  motivo: string;
  status: StatusVoluntario;
  usuario?: Usuario;
}

export interface Doacao {
  id: number;
  usuarioId: number;
  valor: number;
  tipo: string;
  data: string;
  usuario?: Usuario;
}

export interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export enum Especie {
  CAO = 'CAO',
  GATO = 'GATO',
  OUTRO = 'OUTRO',
}

export enum Sexo {
  MACHO = 'MACHO',
  FEMEA = 'FEMEA',
}

export enum Porte {
  PEQUENO = 'PEQUENO',
  MEDIO = 'MEDIO',
  GRANDE = 'GRANDE',
}

export enum StatusAnimal {
  DISPONIVEL = 'DISPONIVEL',
  EM_PROCESSO_ADOCAO = 'EM_PROCESSO_ADOCAO',
  ADOTADO = 'ADOTADO',
}

export interface Animal {
  id: string;
  nome: string;
  raca: string;
  descricao: string;
  especie: Especie;
  sexo: Sexo;
  porte: Porte;
  idade: string;
  disponivel: boolean;
  status: StatusAnimal;
  animalImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  comunitario: boolean;
  localizacaoComunitaria: string;
}

export enum StatusAdocao {
  SOLICITADA = 'SOLICITADA',
  EM_ANALISE = 'EM_ANALISE',
  APROVADA = 'APROVADA',
  RECUSADA = 'RECUSADA',
}

export interface Adocao {
  id: string;
  dataSolicitacao: string;
  dataFinalizacao?: string | null;
  status: StatusAdocao;
  observacoesAdmin?: string | null;
  tipoMoradia?: string | null;
  outrosAnimais?: string | null;
  tempoDisponivel?: string | null;
  motivoAdocao?: string | null;
  usuarioId: number;
  animalId: string;
  animal?: Animal;
  usuario?: Usuario;
}

export enum DivulgacaoStatus {
  PENDENTE = 'PENDENTE',
  REVISADO = 'REVISADO',
  REJEITADO = 'REJEITADO',
}

export interface Divulgacao {
  id: string;
  localizacao: string;
  raca: string;
  castrado: boolean;
  resgate: boolean;
  imageUrl: string;
  descricao?: string | null;
  status: DivulgacaoStatus;
  createdAt: string; // Datas são recebidas como string da API
  usuarioId: number;
  usuario?: Usuario;
}


export interface Parceiro {
  id: number;
  nome: string;
  logoUrl: string;
  createdAt: string;
}

export interface Configuracao {
  id: number;
  gamificacaoAtiva: boolean;
};


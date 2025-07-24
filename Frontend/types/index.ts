export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  role: 'USER' | 'ADMIN';
  telefone?: string;
  profileImageUrl?: string;
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

// --- NOVOS TIPOS E ENUMS PARA ANIMAIS ---

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
  descricao: string;
  especie: Especie;
  sexo: Sexo;
  porte: Porte;
  idade: string;
  raca: string;
  disponivel: boolean;
  status: StatusAnimal;
  animalImageUrl?: string | null;
  createdAt: string; // ou Date
  updatedAt: string; // ou Date
}

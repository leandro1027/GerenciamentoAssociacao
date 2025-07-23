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


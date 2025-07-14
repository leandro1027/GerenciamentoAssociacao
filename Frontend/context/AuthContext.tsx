'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '../types';
import api from '@/app/services/api';

// Define a forma dos dados do contexto
interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  // Simula o login. Num projeto real, isto seria uma chamada POST para /auth/login
  const login = async (email: string, pass: string) => {
    // Para esta simulação, qualquer senha serve, mas o email tem de existir.
    // Isto é inseguro e apenas para fins de demonstração.
    if (!email) throw new Error("O email é obrigatório.");

    try {
      // Como não temos um endpoint para buscar por email, buscamos todos e filtramos.
      // Isto é ineficiente e apenas para a simulação.
      const { data: users } = await api.get<Usuario[]>('/usuario');
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        setUser(foundUser);
        router.push('/'); // Redireciona para a página inicial após o login
      } else {
        throw new Error('Utilizador não encontrado.');
      }
    } catch (error) {
      console.error(error);
      throw error; // Propaga o erro para ser tratado na página de login
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login'); // Redireciona para a página de login após o logout
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Cria um hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

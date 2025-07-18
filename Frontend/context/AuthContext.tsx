'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '../types';
import api from '@/app/services/api';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  const login = async (email: string, pass: string) => {
    if (!email || !pass) throw new Error("Email e senha são obrigatórios.");

    try {
      const response = await api.post<Usuario>('/auth/login', { email, senha: pass });
      if (response.data) {
        setUser(response.data);
        router.push('/');
      } else {
        throw new Error('Resposta inesperada da API.');
      }
    } catch (error: any) {
      console.error("Falha no login:", error);
      throw new Error(error.response?.data?.message || 'Falha no login.');
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const value = { user, isAuthenticated: !!user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
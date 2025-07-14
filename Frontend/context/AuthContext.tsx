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
      // Num projeto real, seria um POST para /auth/login
      const { data: users } = await api.get<Usuario[]>('/usuario');
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      // Lógica de login atualizada para verificar a senha
      if (foundUser && foundUser.senha === pass) {
        setUser(foundUser);
        router.push('/');
      } else {
        throw new Error('Email ou senha inválidos.');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '../types';
import api from '@/app/services/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromCookies = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          setAuthHeader(token);
          const { data: userData } = await api.get<Usuario>('/auth/profile');
          setUser(userData);
        } catch (error) {
          Cookies.remove('token');
          setAuthHeader(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUserFromCookies();
  }, []);

  const login = async (email: string, pass: string) => {
    const response = await api.post<{ access_token: string }>('/auth/login', { email, senha: pass });
    const { access_token } = response.data;

    if (access_token) {
      Cookies.set('token', access_token, { expires: 1 / 24 });
      setAuthHeader(access_token);
      const { data: userData } = await api.get<Usuario>('/auth/profile');
      setUser(userData);
      router.push('/');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setAuthHeader(null);
    setUser(null);
    router.push('/login');
  };

  // NOVA FUNÇÃO PARA ATUALIZAR O UTILIZADOR EM TODA A APLICAÇÃO
  const updateUser = (newUserData: Usuario) => {
    setUser(newUserData);
  };

  const value = { user, isAuthenticated: !!user, isLoading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

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
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', { email, senha: pass });
      const { access_token } = response.data;

      if (access_token) {
        Cookies.set('token', access_token, { expires: 1 / 24 });
        setAuthHeader(access_token);
        
        const { data: userData } = await api.get<Usuario>('/auth/profile');
        setUser(userData);

        router.push('/');
      } else {
        throw new Error('Token não recebido.');
      }
    } catch (error: any) {
      console.error("Falha no login:", error);
      throw new Error(error.response?.data?.message || 'Falha no login.');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setAuthHeader(null);
    setUser(null);
    router.push('/login');
  };

  const value = { user, isAuthenticated: !!user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

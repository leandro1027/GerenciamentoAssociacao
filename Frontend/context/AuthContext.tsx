'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '../types';
import api from '@/app/services/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para configurar o token no Axios
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  // Tenta carregar o utilizador a partir do token ao iniciar
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setAuthToken(token);
      // Aqui, num projeto real, você faria um pedido a um endpoint /me
      // para obter os dados do utilizador a partir do token.
      // Para simplificar, vamos apenas assumir que o token é válido.
      // A lógica de login irá definir o utilizador.
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', { email, senha: pass });
      const { access_token } = response.data;

      if (access_token) {
        Cookies.set('token', access_token, { expires: 1/24 }); // Expira em 1 hora
        setAuthToken(access_token);
        
        // Vamos buscar os dados do utilizador após o login
        // (Isto requer um novo endpoint protegido no back-end)
        // Por agora, vamos simular:
        const usersResponse = await api.get<Usuario[]>('/usuario');
        const loggedUser = usersResponse.data.find(u => u.email === email);
        if (loggedUser) setUser(loggedUser);

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
    setAuthToken(null);
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

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '../types';
import api from '@/app/services/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast'; // 1. IMPORTAR O TOAST

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Partial<Usuario>) => void; // Alterado para Partial<Usuario> para mais flexibilidade
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

  // --- FUNÇÃO LOGIN ATUALIZADA ---
  const login = async (email: string, pass: string) => {
    // 2. ATUALIZAR O TIPO DA RESPOSTA ESPERADA
    const response = await api.post<{ access_token: string; dailyPointsAwarded: boolean }>('/auth/login', { email, senha: pass });
    const { access_token, dailyPointsAwarded } = response.data;

    if (access_token) {
      Cookies.set('token', access_token, { expires: 1 }); // Expira em 1 dia
      setAuthHeader(access_token);
      
      // Busca os dados do usuário atualizados (com os novos pontos, se houver)
      const { data: userData } = await api.get<Usuario>('/auth/profile');
      setUser(userData);

      // 3. VERIFICAR A FLAG E MOSTRAR A NOTIFICAÇÃO
      if (dailyPointsAwarded) {
        toast.success('Você ganhou 5 pontos pelo seu login diário! 🎉');
      }
      
      toast.success(`Bem-vindo(a) de volta, ${userData.nome}!`);
      router.push('/perfil');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setAuthHeader(null);
    setUser(null);
    router.push('/login');
  };

  // Função para atualizar o usuário em toda a aplicação (ex: após editar perfil)
  const updateUser = (newUserData: Partial<Usuario>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...newUserData } : null);
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

'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';
import { Voluntario, StatusVoluntario } from '../../types';
import toast from 'react-hot-toast';

// Ícone Genérico
const Icon = ({ path, className = "w-12 h-12" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function VoluntarioPage() {
  const { user, isAuthenticated } = useAuth();
  const [motivo, setMotivo] = useState('');
  const [voluntarioStatus, setVoluntarioStatus] = useState<StatusVoluntario | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsCheckingStatus(true);
      const checkStatus = async () => {
        try {
          const response = await api.get<Voluntario[]>('/voluntario');
          const minhaCandidatura = response.data.find(v => v.usuarioId === user.id);
          if (minhaCandidatura) {
            setVoluntarioStatus(minhaCandidatura.status);
          }
        } catch (error) {
          console.error("Erro ao verificar status de voluntário", error);
        } finally {
          setIsCheckingStatus(false);
        }
      };
      checkStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error('Utilizador não autenticado.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/voluntario', {
        usuarioId: user.id,
        motivo,
      });

      toast.success('Candidatura enviada com sucesso!');
      setMotivo('');
      setVoluntarioStatus('pendente');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao enviar a candidatura.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700 text-lg">Verificando o seu status...</p>
      </main>
    );
  }

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center space-y-4">
          <Icon path="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" className="mx-auto h-14 w-14 text-amber-700" />
          <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
          <p className="text-gray-600">Faça login para se candidatar como voluntário.</p>
          <Link href="/login" className="inline-block mt-4 bg-amber-800 text-white px-6 py-2 rounded-lg shadow hover:bg-amber-900 transition">
            Ir para Login
          </Link>
        </div>
      );
    }

    if (voluntarioStatus) {
      const statusInfo = {
        pendente: {
          icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "yellow-500",
          title: "Candidatura em Análise",
          message: "Sua candidatura foi recebida e está sendo analisada. Entraremos em contato em breve!",
        },
        aprovado: {
          icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "green-500",
          title: "Candidatura Aprovada!",
          message: "Parabéns! Você agora faz parte da equipe de voluntários. Obrigado por se juntar a nós.",
        },
        recusado: {
          icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
          color: "red-500",
          title: "Candidatura Recusada",
          message: "Agradecemos seu interesse, mas sua candidatura não foi aprovada neste momento.",
        }
      };

      const { icon, color, title, message } = statusInfo[voluntarioStatus];

      return (
        <div className="text-center space-y-4">
          <Icon path={icon} className={`mx-auto h-14 w-14 text-${color}`} />
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">{message}</p>
          <Link href="/" className="text-sm text-amber-800 hover:underline">
            Voltar à Página Inicial
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Seja um Voluntário</h1>
          <p className="text-gray-600">Junte-se a nós e ajude a transformar vidas.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidato:</label>
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-800">{user?.nome}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">Motivação</label>
            <Textarea
              id="motivo"
              placeholder="Conte-nos o que te motiva a ser voluntário..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">
            Enviar Candidatura
          </Button>
        </form>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:block">
          <img
            src="https://img.freepik.com/fotos-premium/um-tipo-happy-e-sorridente-com-um-cao-em-laranja_87910-8370.jpg"
            alt="Voluntário com cachorro"
            className="rounded-2xl shadow-2xl object-cover"
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

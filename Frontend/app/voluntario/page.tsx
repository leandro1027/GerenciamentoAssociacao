'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';
import { Voluntario, StatusVoluntario } from '../../types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// --- Componente de Ícone ---
const Icon = ({ path, className = "w-12 h-12" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Componente Principal da Página ---
export default function VoluntarioPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [motivo, setMotivo] = useState('');
  const [voluntarioStatus, setVoluntarioStatus] = useState<StatusVoluntario | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Se não estiver autenticado, mostra um aviso e redireciona
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para se candidatar como voluntário.');
      router.push('/login');
      return;
    }

    // Se estiver autenticado, verifica o status
    if (user) {
      setIsCheckingStatus(true);
      const checkStatus = async () => {
        try {
          const response = await api.get<Voluntario>('/voluntario/meu-status');
          if (response.data && response.data.status) {
            setVoluntarioStatus(response.data.status);
          }
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error("Erro ao verificar status de voluntário", error);
          }
        } finally {
          setIsCheckingStatus(false);
        }
      };
      checkStatus();
    } else {
        setIsCheckingStatus(false);
    }
  }, [isAuthenticated, user, router]);

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
  
  if (isCheckingStatus || !isAuthenticated) {
    return (
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <p>A carregar...</p>
      </main>
    );
  }

  const renderContent = () => {
    if (voluntarioStatus) {
      const statusInfo = {
        pendente: {
          icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "amber",
          title: "Candidatura em Análise",
          message: "A sua candidatura foi recebida e está a ser analisada pela nossa equipa. Entraremos em contacto em breve!",
        },
        aprovado: {
          icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          color: "green",
          title: "Candidatura Aprovada!",
          message: "Parabéns! Você agora faz parte da nossa equipa de voluntários. Obrigado por se juntar à nossa causa.",
        },
        recusado: {
          icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
          color: "red",
          title: "Candidatura Não Aprovada",
          message: "Agradecemos o seu interesse, mas neste momento não foi possível aprovar a sua candidatura. Obrigado pela sua compreensão.",
        }
      };
      const currentStatus = statusInfo[voluntarioStatus];

      return (
        <div className="text-center">
          <Icon path={currentStatus.icon} className={`mx-auto h-12 w-12 text-${currentStatus.color}-600`} />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{currentStatus.title}</h2>
          <p className="mt-2 text-gray-600">{currentStatus.message}</p>
          <div className="mt-8">
            <Link href="/" className="text-sm font-medium text-amber-800 hover:text-amber-900">
              Voltar à Página Inicial
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Seja um Voluntário</h1>
          <p className="mt-2 text-gray-600">Junte-se a nós e faça a diferença. Preencha a sua candidatura abaixo.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Candidatando-se como:</label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg">
              <p className="font-semibold text-gray-800">{user?.nome}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div>
            <label htmlFor="motivo" className="block mb-2 text-sm font-medium text-gray-700">Por que você quer ser voluntário?</label>
            <Textarea
              id="motivo"
              placeholder="Conte-nos um pouco sobre a sua motivação para ajudar a nossa causa..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">
            Enviar Candidatura
          </Button>
        </form>
      </>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
             <div className="bg-white p-8 rounded-2xl shadow-xl">
                {renderContent()}
            </div>
        </div>
    </main>
  );
}

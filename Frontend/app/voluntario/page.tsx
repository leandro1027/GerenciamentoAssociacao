'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';
import { Voluntario, StatusVoluntario } from '../../types';

export default function VoluntarioPage() {
  const { user, isAuthenticated } = useAuth();
  const [motivo, setMotivo] = useState('');
  const [voluntarioStatus, setVoluntarioStatus] = useState<StatusVoluntario | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verifica se o usuario já é um voluntário
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
      setSubmitError('Utilizador não autenticado.');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const response = await api.post('/voluntario', {
        usuarioId: user.id,
        motivo,
      });

      setSuccess('Candidatura enviada com sucesso! Entraremos em contacto em breve.');
      setMotivo('');
      setVoluntarioStatus('pendente');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao enviar a candidatura.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingStatus) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p>Verificando seu estado...</p>
      </main>
    );
  }

  // Se não ta logado
  if (!isAuthenticated) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Necessário</h2>
                <p className="text-gray-600 mb-6">Você precisa de estar logado para se candidatar como voluntário.</p>
                <Link href="/login" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Ir para a página de Login
                </Link>
            </div>
        </main>
    );
  }

  // Se já tem uma candidatura
  if (voluntarioStatus) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Estado da sua Candidatura</h2>
          <p className="text-gray-600 mb-6">
            A sua candidatura já foi recebida e o seu estado atual é:
          </p>
          <span className={`px-4 py-2 text-lg font-semibold rounded-full ${
            voluntarioStatus === 'aprovado' ? 'bg-green-100 text-green-800' :
            voluntarioStatus === 'recusado' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {voluntarioStatus.charAt(0).toUpperCase() + voluntarioStatus.slice(1)}
          </span>
          <div className="mt-8">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
                Voltar à Página Inicial
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
            Seja um Voluntário
            </h1>
            <p className="mt-2 text-gray-600">
            Complete a sua candidatura abaixo.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Candidatando-se como:
              </label>
              <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">{user?.nome}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="motivo" className="block mb-2 text-sm font-medium text-gray-600">
                Por que você quer ser voluntário?
              </label>
              <Textarea
                id="motivo"
                placeholder="Conte-nos um pouco sobre a sua motivação para ajudar a nossa causa..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" isLoading={isLoading}>
              Enviar Candidatura
            </Button>
          </form>

        {success && (
          <div className="p-4 mt-4 text-center text-green-800 bg-green-100 rounded-lg">
            {success}
          </div>
        )}
        {submitError && (
          <div className="p-4 mt-4 text-center text-red-800 bg-red-100 rounded-lg">
            {submitError}
          </div>
        )}

        <div className="text-center mt-4">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
                Voltar à Página Inicial
            </Link>
        </div>
      </div>
    </main>
  );
}

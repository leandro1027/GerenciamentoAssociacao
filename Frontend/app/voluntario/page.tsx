'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { Usuario } from '../../types';
import Link from 'next/link';

export default function VoluntarioPage() {
  // Estados para o formulário
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [motivo, setMotivo] = useState('');

  // Estados para feedback
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Efeito para buscar os utilizadores quando a página carrega
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get<Usuario[]>('/usuario');
        setUsuarios(response.data);
      } catch (err) {
        setFetchError('Não foi possível carregar os utilizadores. Tente novamente mais tarde.');
      }
    };
    fetchUsuarios();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUserId) {
      setSubmitError('Por favor, selecione um utilizador.');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      await api.post('/voluntario', {
        usuarioId: parseInt(selectedUserId, 10), // Converte a string para número
        motivo,
      });

      setSuccess('Candidatura enviada com sucesso! Entraremos em contacto em breve.');
      setSelectedUserId('');
      setMotivo('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao enviar a candidatura.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
            Seja um Voluntário
            </h1>
            <p className="mt-2 text-gray-600">
            Preencha o formulário abaixo para se candidatar.
            </p>
        </div>
        
        {fetchError ? (
          <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">
            {fetchError}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="usuario" className="block mb-2 text-sm font-medium text-gray-600">
                Selecione o seu nome
              </label>
              <select
                id="usuario"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-200"
                required
              >
                <option value="" disabled>-- Escolha um utilizador --</option>
                {usuarios.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nome} ({user.email})
                  </option>
                ))}
              </select>
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
        )}

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

'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario } from '../../types';
import Link from 'next/link';
import Input from '../components/common/input';
import Button from '../components/common/button';

export default function AdminPanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha de admin
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [voluntariosRes, usuariosRes] = await Promise.all([
          api.get<Voluntario[]>('/voluntario'),
          api.get<Usuario[]>('/usuario')
        ]);
        setVoluntarios(voluntariosRes.data);
        setUsuarios(usuariosRes.data);
      } catch (err) {
        setError('Falha ao carregar os dados do painel.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (voluntarioId: number, status: StatusVoluntario) => {
    try {
      await api.patch(`/voluntario/${voluntarioId}`, { status });
      setVoluntarios(prev => prev.map(v => v.id === voluntarioId ? { ...v, status } : v));
    } catch (err) {
      alert('Erro ao atualizar o status.');
    }
  };

  const getStatusClass = (status: StatusVoluntario) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'recusado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800">Acesso Restrito</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Senha de Administrador</label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <Button type="submit">Entrar</Button>
            {loginError && <p className="text-sm text-center text-red-600">{loginError}</p>}
          </form>
        </div>
      </main>
    );
  }

  // Painel Administrativo
  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Painel Administrativo</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-blue-600 hover:underline">
            Sair
          </button>
        </header>

        {error && <div className="p-4 mb-6 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
        
        {loading ? <p className="text-center">Carregando os dados...</p> : (
          <>
            {/* Seção de Gestão de Voluntários */}
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Voluntários</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voluntarios.map(voluntario => (
                      <tr key={voluntario.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{voluntario.usuario?.nome || 'Utilizador não encontrado'}</div>
                          <div className="text-sm text-gray-500">{voluntario.usuario?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm whitespace-normal">{voluntario.motivo}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(voluntario.status)}`}>
                            {voluntario.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                          {voluntario.status === 'pendente' && (
                            <>
                              <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-green-600 hover:text-green-900 transition-colors">Aprovar</button>
                              <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900 transition-colors">Recusar</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Seção de Lista de Membros */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Membros Registados</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

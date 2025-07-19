'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario, Slide } from '../../types';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';

export default function AdminPanelPage() {
  const { user, isAuthenticated } = useAuth();

  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o formulário de slides
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideFile, setSlideFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [voluntariosRes, usuariosRes, slidesRes] = await Promise.all([
        api.get<Voluntario[]>('/voluntario'),
        api.get<Usuario[]>('/usuario'),
        api.get<Slide[]>('/slide'),
      ]);
      setVoluntarios(voluntariosRes.data);
      setUsuarios(usuariosRes.data);
      setSlides(slidesRes.data);
    } catch (err) {
      setError('Falha ao carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleUpdateStatus = async (voluntarioId: number, status: StatusVoluntario) => {
    try {
      await api.patch(`/voluntario/${voluntarioId}`, { status });
      setVoluntarios(prev => prev.map(v => v.id === voluntarioId ? { ...v, status } : v));
    } catch (err) {
      alert('Erro ao atualizar o status.');
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFile) {
      alert('Por favor, selecione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('file', slideFile);
    formData.append('title', slideTitle);
    formData.append('subtitle', slideSubtitle);

    try {
      const response = await api.post<Slide>('/slide', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSlides([response.data, ...slides]);
      setSlideTitle('');
      setSlideSubtitle('');
      setSlideFile(null);
      const fileInput = document.getElementById('slide-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      alert('Erro ao criar o slide.');
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (window.confirm('Tem a certeza de que deseja apagar este slide?')) {
      try {
        await api.delete(`/slide/${id}`);
        setSlides(slides.filter(slide => slide.id !== id));
      } catch (error) {
        alert('Erro ao apagar o slide.');
      }
    }
  };

  const getStatusClass = (status: StatusVoluntario) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'recusado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">Você não tem permissão para aceder a esta página.</p>
          <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
            Voltar à Página Inicial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Painel Administrativo</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Voltar à Página Inicial
          </Link>
        </header>

        {error && <div className="p-4 mb-6 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
        
        {loading ? <p className="text-center">A carregar dados...</p> : (
          <>
            <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão do Carrossel</h2>
              <form onSubmit={handleCreateSlide} className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Adicionar Novo Slide</h3>
                <Input value={slideTitle} onChange={e => setSlideTitle(e.target.value)} placeholder="Título do Slide" required />
                <Input value={slideSubtitle} onChange={e => setSlideSubtitle(e.target.value)} placeholder="Subtítulo (opcional)" />
                <div>
                  <label htmlFor="slide-file-input" className="block mb-2 text-sm font-medium text-gray-700">Imagem do Slide</label>
                  <input
                    id="slide-file-input"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSlideFile(e.target.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <Button type="submit">Adicionar Slide</Button>
              </form>
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Slides Atuais</h3>
                <div className="space-y-2">
                  {slides.map(slide => (
                    <div key={slide.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        <img src={`http://localhost:3001${slide.imageUrl}`} alt={slide.title} className="w-20 h-12 object-cover rounded-md" />
                        <div>
                          <p className="font-semibold text-gray-900">{slide.title}</p>
                          <p className="text-sm text-gray-500">{slide.subtitle}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSlide(slide.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Apagar</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

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

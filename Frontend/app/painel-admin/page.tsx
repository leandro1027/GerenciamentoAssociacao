'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario, Slide } from '../../types';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';

type AdminView = 'slides' | 'voluntarios' | 'membros';


// 1. COMPONENTE PARA GERIR SLIDES
const SlideManager = ({ initialSlides }: { initialSlides: Slide[] }) => {
  const [slides, setSlides] = useState(initialSlides);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Por favor, selecione uma imagem.');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subtitle', subtitle);

    try {
      const response = await api.post<Slide>('/slide', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSlides([response.data, ...slides]);
      setTitle(''); setSubtitle(''); setFile(null);
      (document.getElementById('slide-file-input') as HTMLInputElement).value = '';
    } catch (error) {
      alert('Erro ao criar o slide.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem a certeza?')) {
      try {
        await api.delete(`/slide/${id}`);
        setSlides(slides.filter(slide => slide.id !== id));
      } catch (error) {
        alert('Erro ao apagar o slide.');
      }
    }
  };

  return (
    <section>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleCreate} className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Adicionar Novo Slide</h3>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do Slide" required />
          <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtítulo (opcional)" />
          <div>
            <label htmlFor="slide-file-input" className="block mb-2 text-sm font-medium text-gray-700">Imagem do Slide</label>
            <input id="slide-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
          </div>
          <Button type="submit">Adicionar Slide</Button>
        </form>
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Slides Atuais</h3>
          <div className="space-y-2">
            {slides.map(slide => (
              <div key={slide.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                <div className="flex items-center space-x-4">
                  <img src={`${api.defaults.baseURL}${slide.imageUrl}`} alt={slide.title} className="w-20 h-12 object-cover rounded-md" />
                  <div>
                    <p className="font-semibold text-gray-900">{slide.title}</p>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Apagar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. COMPONENTE PARA GERIR VOLUNTÁRIOS
const VolunteerManager = ({ initialVolunteers }: { initialVolunteers: Voluntario[] }) => {
    const [voluntarios, setVoluntarios] = useState(initialVolunteers);

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

    return (
        <section>
            <div className="bg-white rounded-xl shadow p-6">
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
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(voluntario.status)}`}>{voluntario.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                                        {voluntario.status === 'pendente' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-green-600 hover:text-green-900">Aprovar</button>
                                                <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900">Recusar</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---

export default function AdminPanelPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [activeView, setActiveView] = useState<AdminView>('slides');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
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
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  
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

  const Sidebar = () => (
    <aside className={`bg-stone-800 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}>
        <div className="mb-8"><h2 className="text-2xl font-bold">Cadastro</h2></div>
        <nav className="flex flex-col space-y-2">
            <button onClick={() => setActiveView('slides')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'slides' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>📝 Listar/Cadastrar Slides</button>
            <button onClick={() => setActiveView('voluntarios')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'voluntarios' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>🤝 Listar Voluntários</button>
            <button onClick={() => setActiveView('membros')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'membros' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>👥 Listar Membros</button>
        </nav>
        <div className="mt-auto"><Link href="/" className="block text-center p-3 rounded-lg bg-stone-700 hover:bg-stone-600 transition-colors whitespace-nowrap">Sair do Painel</Link></div>
    </aside>
  );

  const MainContent = () => {
    const viewTitles: Record<AdminView, string> = {
      slides: 'Gestão do Carrossel',
      voluntarios: 'Gestão de Voluntários',
      membros: 'Membros Registados',
    };

    return (
    <div className="flex-1 flex flex-col h-screen overflow-y-hidden">
        <header className="bg-white shadow-sm p-4 flex-shrink-0 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{viewTitles[activeView]}</h1>
        </header>
        <div className="flex-1 p-6 md:p-10 bg-gray-100 overflow-y-auto">
            {loading && <p>A carregar dados...</p>}
            {error && <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
            
            {!loading && !error && (
                <>
                    {activeView === 'slides' && <SlideManager initialSlides={slides} />}
                    {activeView === 'voluntarios' && <VolunteerManager initialVolunteers={voluntarios} />}
                    {activeView === 'membros' && (
                        <section>
                            <div className="bg-white rounded-xl shadow p-6">
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
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    </div>
    )
  };

  return (
    <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <MainContent />
    </div>
  );
}

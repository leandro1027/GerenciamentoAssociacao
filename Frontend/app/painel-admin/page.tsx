'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario, Slide, Doacao, Animal, Especie, Sexo, Porte, Adocao, StatusAdocao, Divulgacao, DivulgacaoStatus, Parceiro, StatusAnimal } from '../../types';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// Para o gráfico funcionar, certifique-se de que a biblioteca está instalada:
// npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'


// TIPO PARA CONTROLAR A VISTA ATIVA (ADICIONADO 'dashboard')
type AdminView = 'dashboard' | 'slides' | 'voluntarios' | 'membros' | 'doacoes' | 'animais' | 'adocoes' | 'divulgacoes' | 'conteudo';

// --- COMPONENTES FILHOS ---

// 1. COMPONENTE: Dashboard (VERSÃO MELHORADA)
const Dashboard = ({
  user,
  stats,
  recentActivities,
  setActiveView,
}: {
  user: Usuario | null;
  stats: {
    pedidosPendentes: number;
    divulgacoesPendentes: number;
    animaisDisponiveis: number;
    totalMembros: number;
  };
  recentActivities: {
      adocoes: Adocao[];
      voluntarios: Voluntario[];
  };
  setActiveView: (view: AdminView) => void;
}) => {

  // Dados de exemplo para o gráfico. O ideal é buscar estes dados da sua API.
  const weeklyActivityData = [
    { name: 'Seg', NovasAdoções: 2, NovasDivulgações: 3 },
    { name: 'Ter', NovasAdoções: 1, NovasDivulgações: 5 },
    { name: 'Qua', NovasAdoções: 4, NovasDivulgações: 2 },
    { name: 'Qui', NovasAdoções: 3, NovasDivulgações: 6 },
    { name: 'Sex', NovasAdoções: 5, NovasDivulgações: 4 },
    { name: 'Sáb', NovasAdoções: 2, NovasDivulgações: 8 },
    { name: 'Dom', NovasAdoções: 1, NovasDivulgações: 5 },
  ];

  const StatCard = ({ title, value, icon, description }: { title: string; value: number; icon: React.ReactNode; description: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-amber-100 rounded-full">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">{description}</p>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* Cabeçalho de Boas-Vindas */}
      <div className="relative p-8 bg-stone-900 rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Cão feliz"/>
        <div className="relative z-20">
            <h1 className="text-3xl font-bold text-white">Bem-vindo, {user?.nome?.split(' ')[0]}!</h1>
            <p className="text-stone-300 mt-1">O seu trabalho faz toda a diferença. Vamos ver as novidades.</p>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Adoções Pendentes"
          value={stats.pedidosPendentes}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          description="Pedidos aguardando a sua análise."
        />
        <StatCard
          title="Divulgações Pendentes"
          value={stats.divulgacoesPendentes}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514M15 11L11 17l4 6" /></svg>}
          description="Novos casos da comunidade para revisar."
        />
        <StatCard
          title="Animais Disponíveis"
          value={stats.animaisDisponiveis}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
          description="Animais aguardando um novo lar."
        />
        <StatCard
          title="Total de Membros"
          value={stats.totalMembros}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          description="Utilizadores registados na plataforma."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Atividade */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Atividade na Última Semana</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={weeklyActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9' }}/>
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="NovasAdoções" fill="#c2410c" name="Adoções" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="NovasDivulgações" fill="#f59e0b" name="Divulgações" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Atividades Recentes</h2>
            <div className="space-y-4">
                {recentActivities.adocoes.length === 0 && recentActivities.voluntarios.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>
                )}
                {recentActivities.adocoes.map(adocao => (
                    <div key={adocao.id} className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>
                        {/* CORRIGIDO: Adicionado optional chaining para evitar erros */}
                        <p className="text-sm text-gray-700"><span className="font-semibold">{adocao.usuario?.nome || 'Utilizador'}</span> quer adotar <span className="font-semibold">{adocao.animal?.nome || 'um animal'}</span>.</p>
                    </div>
                ))}
                {recentActivities.voluntarios.map(voluntario => (
                    <div key={voluntario.id} className="flex items-center gap-3">
                         <div className="p-2 bg-green-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9M15 21a2 2 0 002-2v-3.354" /></svg></div>
                        {/* CORRIGIDO: Adicionado optional chaining para evitar erros */}
                        <p className="text-sm text-gray-700"><span className="font-semibold">{voluntario.usuario?.nome || 'Alguém'}</span> candidatou-se como voluntário.</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

// 2. COMPONENTE PARA GERIR SLIDES
const SlideManager = ({ initialSlides }: { initialSlides: Slide[] }) => {
  const [slides, setSlides] = useState(initialSlides);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecione uma imagem.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subtitle', subtitle);

    try {
      const response = await api.post<Slide>('/slide', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSlides([response.data, ...slides]);
      setTitle(''); setSubtitle(''); setFile(null);
      (document.getElementById('slide-file-input') as HTMLInputElement).value = '';
      toast.success('Slide criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar o slide.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem a certeza?')) {
      try {
        await api.delete(`/slide/${id}`);
        setSlides(slides.filter(slide => slide.id !== id));
        toast.success('Slide apagado com sucesso!');
      } catch (error) {
        toast.error('Erro ao apagar o slide.');
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
            <input id="slide-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required />
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

// 3. COMPONENTE PARA GERIR VOLUNTÁRIOS
const VolunteerManager = ({ initialVolunteers }: { initialVolunteers: Voluntario[] }) => {
    const [voluntarios, setVoluntarios] = useState(initialVolunteers);

    const handleUpdateStatus = async (voluntarioId: number, status: StatusVoluntario) => {
        try {
          await api.patch(`/voluntario/${voluntarioId}`, { status });
          setVoluntarios(prev => prev.map(v => v.id === voluntarioId ? { ...v, status } : v));
          toast.success('Status do voluntário atualizado!');
        } catch (err) {
          toast.error('Erro ao atualizar o status.');
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
                                      {voluntario.status === 'aprovado' && (
                                          <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900">Alterar para Recusado</button>
                                      )}
                                      {voluntario.status === 'recusado' && (
                                          <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-green-600 hover:text-green-900">Alterar para Aprovado</button>
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

// 4. COMPONENTE PARA GERIR MEMBROS
const MemberManager = ({ initialUsers }: { initialUsers: Usuario[] }) => {
    const [usuarios, setUsuarios] = useState(initialUsers);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    const handleDelete = async (userId: number) => {
        if (confirm('Tem a certeza de que deseja apagar este membro?')) {
            try {
                await api.delete(`/usuario/${userId}`);
                setUsuarios(usuarios.filter(u => u.id !== userId));
                toast.success('Membro apagado com sucesso!');
            } catch (error) {
                toast.error('Erro ao apagar o membro.');
            }
        }
    };

    const handleEdit = (user: Usuario) => {
        setEditingUser({ ...user });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const { id, nome, email, telefone } = editingUser;
            const response = await api.patch(`/usuario/${id}`, { nome, email, telefone });
            setUsuarios(usuarios.map(u => u.id === id ? response.data : u));
            setEditingUser(null);
            toast.success('Membro atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar o membro.');
        }
    };

    return (
        <section>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map(user => (
                                <tr key={user.id}>
                                    {editingUser?.id === user.id ? (
                                        <>
                                            <td className="px-6 py-4"><Input value={editingUser.nome} onChange={e => setEditingUser({...editingUser, nome: e.target.value})} /></td>
                                            <td className="px-6 py-4"><Input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} /></td>
                                            <td className="px-6 py-4"><Input value={editingUser.telefone || ''} onChange={e => setEditingUser({...editingUser, telefone: e.target.value})} /></td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={handleUpdate} className="text-amber-600 hover:text-amber-900">Guardar</button>
                                                <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

// 5. COMPONENTE PARA LISTAR DOAÇÕES
const DonationManager = ({ initialDonations }: { initialDonations: Doacao[] }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <section>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {initialDonations.map(doacao => (
                                <tr key={doacao.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{doacao.usuario?.nome || 'Utilizador não encontrado'}</div>
                                        <div className="text-sm text-gray-500">{doacao.usuario?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(doacao.valor)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(doacao.data)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

// 6. COMPONENTE PARA GERIR ANIMAIS
const AnimalManager = ({ animals, setAnimals }: { animals: Animal[], setAnimals: React.Dispatch<React.SetStateAction<Animal[]>> }) => {
  const [formData, setFormData] = useState({ nome: '', raca: '', idade: '', descricao: '' });
  const [especie, setEspecie] = useState<Especie>(Especie.CAO);
  const [sexo, setSexo] = useState<Sexo>(Sexo.MACHO);
  const [porte, setPorte] = useState<Porte>(Porte.PEQUENO);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const handleCreateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
        toast.error('Por favor, selecione uma imagem para o animal.');
        return;
    }
    setIsLoading(true);

    const data = new FormData();
    data.append('nome', formData.nome);
    data.append('raca', formData.raca);
    data.append('idade', formData.idade);
    data.append('descricao', formData.descricao);
    data.append('especie', especie);
    data.append('sexo', sexo);
    data.append('porte', porte);
    data.append('file', file);

    try {
      const response = await api.post<Animal>('/animais', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAnimals(prev => [response.data, ...prev]);
      toast.success('Animal cadastrado com sucesso!');
      setFormData({ nome: '', raca: '', idade: '', descricao: '' });
      setEspecie(Especie.CAO);
      setSexo(Sexo.MACHO);
      setPorte(Porte.PEQUENO);
      setFile(null);
      (document.getElementById('animal-file-input') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      toast.error('Não foi possível cadastrar o animal.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (animalId: string) => {
    if (confirm('Tem a certeza que deseja apagar este animal?')) {
      try {
        await api.delete(`/animais/${animalId}`);
        setAnimals(prev => prev.filter(a => a.id !== animalId));
        toast.success('Animal apagado com sucesso!');
      } catch (error) {
        toast.error('Erro ao apagar o animal.');
      }
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal({ ...animal });
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAnimal) return;
    setIsLoading(true);

    try {
      const { id, nome, raca, idade, descricao, especie, sexo, porte } = editingAnimal;
      const response = await api.patch<Animal>(`/animais/${id}`, { nome, raca, idade, descricao, especie, sexo, porte });
      setAnimals(prev => prev.map(a => a.id === id ? response.data : a));
      setEditingAnimal(null);
      toast.success('Animal atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar o animal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Cadastrar Novo Animal</h3>
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Bob" required />
            </div>
            <div>
              <label htmlFor="raca" className="block text-sm font-medium text-gray-700 mb-2">Raça</label>
              <Input id="raca" value={formData.raca} onChange={(e) => setFormData({...formData, raca: e.target.value})} placeholder="Ex: Sem Raça Definida (SRD)" required />
            </div>
            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
              <Input id="idade" value={formData.idade} onChange={(e) => setFormData({...formData, idade: e.target.value})} placeholder="Ex: Aprox. 2 anos" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="especie" className="block text-sm font-medium text-gray-700 mb-2">Espécie</label>
              <select id="especie" value={especie} onChange={(e) => setEspecie(e.target.value as Especie)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                <option value={Especie.CAO}>Cão</option>
                <option value={Especie.GATO}>Gato</option>
              </select>
            </div>
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
              <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                <option value={Sexo.MACHO}>Macho</option>
                <option value={Sexo.FEMEA}>Fêmea</option>
              </select>
            </div>
            <div>
              <label htmlFor="porte" className="block text-sm font-medium text-gray-700 mb-2">Porte</label>
              <select id="porte" value={porte} onChange={(e) => setPorte(e.target.value as Porte)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                <option value={Porte.PEQUENO}>Pequeno</option>
                <option value={Porte.MEDIO}>Médio</option>
                <option value={Porte.GRANDE}>Grande</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="animal-file-input" className="block text-sm font-medium text-gray-700 mb-2">Foto do Animal</label>
            <input id="animal-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">Descrição e Comportamento</label>
            <textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 placeholder:text-gray-400 text-gray-900" placeholder="Conte a história do animal, como ele é com pessoas, outros animais, etc." required></textarea>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>Cadastrar Animal</Button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Animais Cadastrados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.map(animal => (
                <tr key={animal.id}>
                  {editingAnimal?.id === animal.id ? (
                    <>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4"><Input value={editingAnimal.nome} onChange={e => setEditingAnimal({...editingAnimal, nome: e.target.value})} /></td>
                      <td className="px-6 py-4"><Input value={editingAnimal.descricao} onChange={e => setEditingAnimal({...editingAnimal, descricao: e.target.value})} /></td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4 text-center space-x-2">
                          <button onClick={handleUpdate} className="text-amber-600 hover:text-amber-900">Guardar</button>
                          <button onClick={() => setEditingAnimal(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <img src={`${api.defaults.baseURL}${animal.animalImageUrl}`} alt={animal.nome} className="w-12 h-12 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{animal.descricao}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.status}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(animal)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// 7. COMPONENTE PARA GERIR ADOÇÕES
const AdoptionManager = ({ initialAdoptions, onUpdate }: { initialAdoptions: Adocao[], onUpdate: (updatedAdoption: Adocao) => void }) => {
    const [selectedAdoption, setSelectedAdoption] = useState<Adocao | null>(null);
    const [activeTab, setActiveTab] = useState<'pendentes' | 'finalizadas'>('pendentes');

    const pendingAdoptions = initialAdoptions.filter(a => a.status === StatusAdocao.SOLICITADA || a.status === StatusAdocao.EM_ANALISE);
    const finalizedAdoptions = initialAdoptions.filter(a => a.status === StatusAdocao.APROVADA || a.status === StatusAdocao.RECUSADA);

    const getStatusClass = (status: StatusAdocao) => {
        switch (status) {
            case StatusAdocao.APROVADA: return 'bg-green-100 text-green-800';
            case StatusAdocao.RECUSADA: return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleUpdateStatus = async (adocaoId: string, status: StatusAdocao) => {
        try {
            const response = await api.patch<Adocao>(`/adocoes/${adocaoId}/status`, { status });
            onUpdate(response.data);
            toast.success(`Pedido ${status === StatusAdocao.APROVADA ? 'aprovado' : 'recusado'} com sucesso!`);
            setSelectedAdoption(null);
        } catch (error) {
            toast.error('Erro ao atualizar o status do pedido.');
        }
    };

    const handleWhatsAppContact = (adocao: Adocao, isFollowUp: boolean = false) => {
        if (!adocao.usuario?.telefone) {
            toast.error('Este utilizador não possui um número de telefone registado.');
            return;
        }
        const numero = adocao.usuario.telefone.replace(/\D/g, '');
        const nomeAnimal = adocao.animal?.nome;
        let texto;

        if (isFollowUp) {
            texto = encodeURIComponent(`Olá ${adocao.usuario.nome}! Somos da associação de protetores independentes Fabiana Forte Huergo e gostaríamos de fazer o acompanhamento da adoção do(a) ${nomeAnimal}. Como ele(a) está a adaptar-se ao novo lar?`);
        } else {
            texto = encodeURIComponent(`Olá ${adocao.usuario.nome}! Vimos o seu interesse em adotar o(a) ${nomeAnimal}. Gostaríamos de conversar mais sobre o processo!`);
        }
        
        window.open(`https://wa.me/55${numero}?text=${texto}`, '_blank');
    };

    return (
        <section className="bg-white rounded-xl shadow p-6">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('pendentes')} className={`${activeTab === 'pendentes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Pedidos Pendentes ({pendingAdoptions.length})
                    </button>
                    <button onClick={() => setActiveTab('finalizadas')} className={`${activeTab === 'finalizadas' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Adoções Finalizadas ({finalizedAdoptions.length})
                    </button>
                </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(activeTab === 'pendentes' ? pendingAdoptions : finalizedAdoptions).map(adocao => (
                            (adocao.animal && adocao.usuario) && (
                                <tr key={adocao.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adocao.animal.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adocao.usuario.nome}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(adocao.status)}`}>
                                            {adocao.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                                        {activeTab === 'pendentes' ? (
                                            <button onClick={() => setSelectedAdoption(adocao)} className="text-amber-600 hover:text-amber-900">Analisar Pedido</button>
                                        ) : (
                                            adocao.status === StatusAdocao.APROVADA && (
                                                <button onClick={() => handleWhatsAppContact(adocao, true)} className="text-green-600 hover:text-green-900">Acompanhar via WhatsApp</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedAdoption && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-gray-50 rounded-xl shadow-2xl p-8 max-w-3xl w-full transform transition-all duration-300 scale-95 animate-fade-in-up">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Pedido de Adoção</h2>
                            <button onClick={() => setSelectedAdoption(null)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="py-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Informações do Animal</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p><strong className="font-medium text-gray-800">Nome:</strong> {selectedAdoption.animal?.nome}</p>
                                        <p><strong className="font-medium text-gray-800">Espécie:</strong> {selectedAdoption.animal?.especie}</p>
                                        <p><strong className="font-medium text-gray-800">Raça:</strong> {selectedAdoption.animal?.raca}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Informações do Candidato</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p><strong className="font-medium text-gray-800">Nome:</strong> {selectedAdoption.usuario?.nome}</p>
                                        <p><strong className="font-medium text-gray-800">Email:</strong> {selectedAdoption.usuario?.email}</p>
                                        <p><strong className="font-medium text-gray-800">Telefone:</strong> {selectedAdoption.usuario?.telefone || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Respostas do Questionário</h3>
                                <div className="bg-white p-4 rounded-lg border space-y-3 text-gray-600">
                                    <div>
                                        <p className="font-medium text-gray-800">Qual o seu tipo de moradia?</p>
                                        <p className="pl-2">- {selectedAdoption.tipoMoradia || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Você possui outros animais?</p>
                                        <p className="pl-2">- {selectedAdoption.outrosAnimais || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Quanto tempo você terá disponível?</p>
                                        <p className="pl-2">- {selectedAdoption.tempoDisponivel || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Por que gostaria de adotar?</p>
                                        <p className="pl-2">- {selectedAdoption.motivoAdocao || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t space-y-4 sm:space-y-0">
                            <Button onClick={() => handleWhatsAppContact(selectedAdoption)} className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.001 2C5.582 2 2 5.582 2 10.001c0 1.511.413 2.925 1.15 4.156l-1.15 4.156 4.296-1.13c1.21.69 2.598 1.093 4.054 1.093 4.418 0 8-3.582 8-8.001 0-4.418-3.582-8-8-8zm4.134 9.478c-.23.645-.854 1.11-1.48 1.228-.51.1-.926.04-1.37-.158-.58-.26-1.18-.59-1.73-.99-1.12-0.8-1.88-1.88-2.08-2.22-.2-.34-.48-.59-.48-.96 0-.37.23-.59.48-.79.25-.2.53-.26.73-.26h.3c.23 0 .45.03.65.34.2.31.68.82.73.88.05.06.1.12.01.23-.09.11-.14.17-.26.31-.12.14-.23.28-.34.39-.12.12-.23.26-.11.48.11.22.53.88 1.12 1.44.79.79 1.41 1.02 1.63 1.12.22.1.34.09.48-.06.14-.15.59-.68.73-.88.14-.2.31-.23.53-.23.2 0 .48.01.68.03.2.02.31.01.45.14.14.13.23.29.26.48.03.19.03.91-.2 1.556z" /></svg>
                                Contactar Candidato
                            </Button>
                            <div className="flex space-x-3 w-full sm:w-auto">
                                {selectedAdoption.status === StatusAdocao.SOLICITADA ? (
                                    <>
                                        <Button onClick={() => handleUpdateStatus(selectedAdoption.id, StatusAdocao.APROVADA)} className="w-full bg-amber-600 hover:bg-amber-700">Aprovar</Button>
                                        <Button onClick={() => handleUpdateStatus(selectedAdoption.id, StatusAdocao.RECUSADA)} className="w-full bg-red-600 hover:bg-red-700">Recusar</Button>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-600">Este pedido já foi processado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

// 8. COMPONENTE PARA GERIR DIVULGAÇÕES
const DivulgacaoManager = ({ initialDivulgacoes, onUpdate }: { initialDivulgacoes: Divulgacao[], onUpdate: () => void }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'historico'>('pendentes');

  const pendingDivulgacoes = initialDivulgacoes.filter(d => d.status === DivulgacaoStatus.PENDENTE);
  const processedDivulgacoes = initialDivulgacoes.filter(
    d => d.status === DivulgacaoStatus.REVISADO || d.status === DivulgacaoStatus.REJEITADO
  );

  const handleAction = async (action: Promise<any>, successMessage: string) => {
    try {
      await action;
      toast.success(successMessage);
      onUpdate(); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Ocorreu um erro.";
      toast.error(errorMessage);
    }
  };

  const handleWhatsAppContact = (divulgacao: Divulgacao) => {
      if (!divulgacao.usuario?.telefone) {
          toast.error('Este utilizador não possui um número de telefone registado.');
          return;
      }
      const numero = divulgacao.usuario.telefone.replace(/\D/g, '');
      const nomeAnimal = divulgacao.raca;
      const texto = encodeURIComponent(`Olá ${divulgacao.usuario.nome}! Somos da associação e vimos a sua divulgação sobre um animal (${nomeAnimal}) na localização "${divulgacao.localizacao}". Gostaríamos de conversar para saber mais detalhes!`);
      
      window.open(`https://wa.me/55${numero}?text=${texto}`, '_blank');
  };

  const handleStatusChange = async (id: string, status: DivulgacaoStatus) => {
    setLoadingStates(prev => ({ ...prev, [`status-${id}`]: true }));
    await handleAction(
      api.patch(`/divulgacao/${id}/status`, { status }),
      `Divulgação atualizada com sucesso!`
    );
    setLoadingStates(prev => ({ ...prev, [`status-${id}`]: false }));
  };
  
  const handleConvertToAnimal = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [`convert-${id}`]: true }));
    await handleAction(
      api.post(`/divulgacao/${id}/convert-to-animal`),
      "Animal listado para adoção com sucesso!"
    );
    setLoadingStates(prev => ({ ...prev, [`convert-${id}`]: false }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem a certeza que deseja excluir esta divulgação?")) {
      return;
    }
    setLoadingStates(prev => ({ ...prev, [`delete-${id}`]: true }));
    await handleAction(api.delete(`/divulgacao/${id}`), "Divulgação excluída.");
    setLoadingStates(prev => ({ ...prev, [`delete-${id}`]: false }));
  };
  
  const StatusBadge = ({ status }: { status: DivulgacaoStatus }) => {
    const styles: Record<DivulgacaoStatus, string> = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      REVISADO: 'bg-green-100 text-green-800',
      REJEITADO: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
  };

  const divulgacoesToShow = activeTab === 'pendentes' ? pendingDivulgacoes : processedDivulgacoes;

  return (
    <section>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('pendentes')} className={`${activeTab === 'pendentes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Pendentes ({pendingDivulgacoes.length})
                </button>
                <button onClick={() => setActiveTab('historico')} className={`${activeTab === 'historico' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Histórico ({processedDivulgacoes.length})
                </button>
            </nav>
        </div>

        {divulgacoesToShow.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            {activeTab === 'pendentes' ? 'Nenhuma divulgação pendente encontrada.' : 'Nenhuma divulgação no histórico.'}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {divulgacoesToShow.map((divulgacao) => (
            <div key={divulgacao.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-transform hover:scale-105 border">
              <div className="relative">
                <img 
                  src={`${api.defaults.baseURL}${divulgacao.imageUrl}`} 
                  alt={divulgacao.raca} 
                  className="w-full h-56 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(`${api.defaults.baseURL}${divulgacao.imageUrl}`)}
                />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={divulgacao.status} />
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-800">{divulgacao.raca}</h3>
                <p className="text-sm text-gray-600">{divulgacao.localizacao}</p>
                
                <div className="my-3 text-sm space-y-1 text-gray-700">
                  <p><strong>Enviado por:</strong> {divulgacao.usuario?.nome || 'N/A'}</p>
                  <p><strong>Data:</strong> {new Date(divulgacao.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${divulgacao.castrado ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                      {divulgacao.castrado ? 'Castrado' : 'Não Castrado'}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${divulgacao.resgate ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>
                      {divulgacao.resgate ? 'Resgate' : 'Particular'}
                    </span>
                  </div>
                </div>

                {divulgacao.descricao && <p className="text-sm text-gray-600 mb-4 flex-1">"{divulgacao.descricao}"</p>}

                <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                  <Button 
                    variant="primary"
                    onClick={() => handleWhatsAppContact(divulgacao)}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Contactar via WhatsApp
                  </Button>

                  {divulgacao.status === 'PENDENTE' && (
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="success" 
                        onClick={() => handleConvertToAnimal(divulgacao.id)} 
                        isLoading={loadingStates[`convert-${divulgacao.id}`]}
                      >
                        Aprovar e Listar
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => handleStatusChange(divulgacao.id, DivulgacaoStatus.REJEITADO)} 
                        isLoading={loadingStates[`status-${divulgacao.id}`]}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                   <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleDelete(divulgacao.id)}
                      isLoading={loadingStates[`delete-${divulgacao.id}`]}
                   >
                     Excluir Permanentemente
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Visualização ampliada" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </section>
  );
};

// 9. COMPONENTE PARA GERIR CONTEÚDO E PARCEIROS
const ConteudoManager = () => {
  const [activeTab, setActiveTab] = useState<'sobre' | 'parceiros'>('sobre');
  const [conteudo, setConteudo] = useState({ titulo: '', subtitulo: '', itens: '[]', imagemUrl: '' });
  const [itensList, setItensList] = useState<string[]>(['']);
  const [fileSobre, setFileSobre] = useState<File | null>(null);
  const [isLoadingSobre, setIsLoadingSobre] = useState(false);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [nomeParceiro, setNomeParceiro] = useState('');
  const [fileParceiro, setFileParceiro] = useState<File | null>(null);
  const [isLoadingParceiros, setIsLoadingParceiros] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [conteudoRes, parceirosRes] = await Promise.all([
        api.get('/conteudo-home'),
        api.get<Parceiro[]>('/parceiros')
      ]);
      
      setConteudo(conteudoRes.data);
      setItensList(JSON.parse(conteudoRes.data.itens || '[]'));
      setParceiros(parceirosRes.data);

    } catch (error) {
      toast.error('Erro ao carregar dados de conteúdo.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleItemChange = (index: number, value: string) => {
    const newItens = [...itensList];
    newItens[index] = value;
    setItensList(newItens);
  };
  const addItem = () => setItensList([...itensList, '']);
  const removeItem = (index: number) => setItensList(itensList.filter((_, i) => i !== index));
  const handleSubmitSobre = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingSobre(true);
    const formData = new FormData();
    formData.append('titulo', conteudo.titulo);
    formData.append('subtitulo', conteudo.subtitulo);
    formData.append('itens', JSON.stringify(itensList.filter(item => item.trim() !== '')));
    if (fileSobre) {
      formData.append('file', fileSobre);
    }
    try {
      await api.patch('/conteudo-home', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Conteúdo da página inicial atualizado com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar o conteúdo.');
    } finally {
      setIsLoadingSobre(false);
    }
  };

  const handleCreateParceiro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileParceiro) {
      toast.error('Por favor, selecione um logótipo.');
      return;
    }
    setIsLoadingParceiros(true);
    const formData = new FormData();
    formData.append('file', fileParceiro);
    formData.append('nome', nomeParceiro);
    try {
      await api.post<Parceiro>('/parceiros', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNomeParceiro('');
      setFileParceiro(null);
      (document.getElementById('partner-file-input') as HTMLInputElement).value = '';
      toast.success('Parceiro criado com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar o parceiro.');
    } finally {
      setIsLoadingParceiros(false);
    }
  };

  const handleDeleteParceiro = async (id: number) => {
    if (confirm('Tem a certeza que deseja apagar este parceiro?')) {
      try {
        await api.delete(`/parceiros/${id}`);
        toast.success('Parceiro apagado com sucesso!');
        fetchData();
      } catch (error) {
        toast.error('Erro ao apagar o parceiro.');
      }
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('sobre')} className={`${activeTab === 'sobre' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Conteúdo "Sobre"
                </button>
                <button onClick={() => setActiveTab('parceiros')} className={`${activeTab === 'parceiros' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                    Gestão de Parceiros
                </button>
            </nav>
        </div>

        {activeTab === 'sobre' && (
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Editar Secção "Sobre" da Página Inicial</h2>
                <form onSubmit={handleSubmitSobre} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Secção</label>
                        <Input value={conteudo.titulo} onChange={e => setConteudo({...conteudo, titulo: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (parágrafo)</label>
                        <Textarea value={conteudo.subtitulo} onChange={e => setConteudo({...conteudo, subtitulo: e.target.value})} rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tópicos da Lista</label>
                        <div className="space-y-2">
                        {itensList.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                            <Input value={item} onChange={e => handleItemChange(index, e.target.value)} placeholder={`Tópico ${index + 1}`} />
                            <Button type="button" variant="danger" onClick={() => removeItem(index)} className="px-3 py-2 h-full">X</Button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" variant="outline" onClick={addItem} className="mt-2">Adicionar Tópico</Button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Secção</label>
                        <input type="file" onChange={e => setFileSobre(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"/>
                        {conteudo.imagemUrl && <img src={`${api.defaults.baseURL}${conteudo.imagemUrl}`} alt="Preview" className="mt-4 w-48 h-auto rounded-lg" />}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoadingSobre} className="bg-amber-800 hover:bg-amber-900">Guardar Alterações do Conteúdo</Button>
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'parceiros' && (
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Editar Parceiros</h2>
                <div className="bg-white rounded-xl p-0">
                    <form onSubmit={handleCreateParceiro} className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Adicionar Novo Parceiro</h3>
                        <Input value={nomeParceiro} onChange={e => setNomeParceiro(e.target.value)} placeholder="Nome do Parceiro" required />
                        <div>
                            <label htmlFor="partner-file-input" className="block mb-2 text-sm font-medium text-gray-700">Logótipo do Parceiro</label>
                            <input id="partner-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFileParceiro(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required />
                        </div>
                        <Button type="submit" isLoading={isLoadingParceiros}>Adicionar Parceiro</Button>
                    </form>
                    <div>
                        <h3 className="font-semibold mb-2 text-gray-800">Parceiros Atuais</h3>
                        <div className="space-y-2">
                        {parceiros.map(parceiro => (
                            <div key={parceiro.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                            <div className="flex items-center space-x-4">
                                <img src={`${api.defaults.baseURL}${parceiro.logoUrl}`} alt={parceiro.nome} className="w-20 h-12 object-contain rounded-md bg-gray-100 p-1" />
                                <div>
                                <p className="font-semibold text-gray-900">{parceiro.nome}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteParceiro(parceiro.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Apagar</button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </section>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function AdminPanelPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [adocoes, setAdocoes] = useState<Adocao[]>([]);
  const [divulgacoes, setDivulgacoes] = useState<Divulgacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [voluntariosRes, usuariosRes, slidesRes, doacoesRes, animaisRes, adocoesRes, divulgacoesRes] = await Promise.all([
        api.get<Voluntario[]>('/voluntario'),
        api.get<Usuario[]>('/usuario'),
        api.get<Slide[]>('/slide'),
        api.get<Doacao[]>('/doacao'),
        api.get<Animal[]>('/animais'),
        api.get<Adocao[]>('/adocoes'),
        api.get<Divulgacao[]>('/divulgacao'), 
      ]);
      setVoluntarios(voluntariosRes.data);
      setUsuarios(usuariosRes.data);
      setSlides(slidesRes.data);
      setDoacoes(doacoesRes.data);
      setAnimais(animaisRes.data);
      setAdocoes(adocoesRes.data);
      setDivulgacoes(divulgacoesRes.data);
    } catch (err) {
      setError('Falha ao carregar os dados do painel.');
      toast.error('Falha ao carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      setLoading(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchData]);
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">Você não tem permissão para aceder a esta página.</p>
          <Link href="/" className="mt-6 inline-block text-amber-600 hover:underline">
            Voltar à Página Inicial
          </Link>
        </div>
      </main>
    );
  }

  const Sidebar = () => (
    <aside className={`bg-stone-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}>
        <div className="mb-8"><h2 className="text-2xl font-bold">Painel Admin</h2></div>
        <nav className="flex flex-col space-y-2">
            <button onClick={() => setActiveView('dashboard')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'dashboard' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>📊 Dashboard</button>
            <button onClick={() => setActiveView('slides')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'slides' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>📝 Gerir Slides</button>
            <button onClick={() => setActiveView('animais')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'animais' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>🐾 Gerir Animais</button>
            <button onClick={() => setActiveView('adocoes')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'adocoes' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>❤️ Gerir Adoções</button>
            <button onClick={() => setActiveView('divulgacoes')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'divulgacoes' ? 'bg-stone-700' : 'hover:bg-amber-700'}`}>📢 Gerir Divulgações</button>
            <button onClick={() => setActiveView('voluntarios')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'voluntarios' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>🤝 Gerir Voluntários</button>
            <button onClick={() => setActiveView('membros')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'membros' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>👥 Gerir Membros</button>
            <button onClick={() => setActiveView('doacoes')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'doacoes' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>💰 Histórico de Doações</button>
            <button onClick={() => setActiveView('conteudo')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'conteudo' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>📄 Gerir Conteúdo</button>
        </nav>
        <div className="mt-auto"><Link href="/" className="block text-center p-3 rounded-lg bg-stone-700 hover:bg-stone-600 transition-colors whitespace-nowrap">Sair do Painel</Link></div>
    </aside>
  );

  const MainContent = () => {
    const viewTitles: Record<AdminView, string> = {
      dashboard: 'Dashboard',
      slides: 'Gestão do Carrossel',
      animais: 'Gestão de Animais para Adoção',
      adocoes: 'Gestão de Pedidos de Adoção',
      voluntarios: 'Gestão de Voluntários',
      membros: 'Membros Registados',
      doacoes: 'Histórico de Doações',
      divulgacoes: 'Gestão de Divulgações da Comunidade',
      conteudo: 'Gestão de Conteúdo e Parceiros'
    };
    
    const dashboardStats = {
        pedidosPendentes: adocoes.filter(a => a.status === StatusAdocao.SOLICITADA).length,
        divulgacoesPendentes: divulgacoes.filter(d => d.status === DivulgacaoStatus.PENDENTE).length,
        animaisDisponiveis: animais.filter(a => a.status === StatusAnimal.DISPONIVEL).length,
        totalMembros: usuarios.length,
    }

    const recentActivities = {
        adocoes: adocoes.filter(a => a.status === StatusAdocao.SOLICITADA).slice(0, 2),
        // CORRIGIDO: Comparação com o valor string 'pendente'
        voluntarios: voluntarios.filter(v => v.status === 'pendente').slice(0, 2),
    }

    return (
    <div className="flex-1 flex flex-col h-screen overflow-y-hidden">
        <header className="bg-white shadow-sm p-4 flex-shrink-0 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{viewTitles[activeView]}</h1>
        </header>
        <div className="flex-1 p-6 md:p-10 bg-gray-100 overflow-y-auto">
            {loading && <p className="text-center text-gray-600">A carregar dados...</p>}
            {error && <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
            
            {!loading && !error && (
                <>
                    {activeView === 'dashboard' && <Dashboard user={user} stats={dashboardStats} recentActivities={recentActivities} setActiveView={setActiveView} />}
                    {activeView === 'slides' && <SlideManager initialSlides={slides} />}
                    {activeView === 'animais' && <AnimalManager animals={animais} setAnimals={setAnimais} />}
                    {activeView === 'adocoes' && <AdoptionManager initialAdoptions={adocoes} onUpdate={(updated) => setAdocoes(adocoes.map(a => a.id === updated.id ? updated : a))} />}
                    {activeView === 'divulgacoes' && <DivulgacaoManager initialDivulgacoes={divulgacoes} onUpdate={fetchData} />}
                    {activeView === 'voluntarios' && <VolunteerManager initialVolunteers={voluntarios} />}
                    {activeView === 'membros' && <MemberManager initialUsers={usuarios} />}
                    {activeView === 'doacoes' && <DonationManager initialDonations={doacoes} />}
                    {activeView === 'conteudo' && <ConteudoManager />}
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

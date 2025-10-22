'use client';

import { useState, useEffect, FormEvent, useCallback, useRef, useMemo } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario, Slide, Doacao, Animal, Especie, Sexo, Porte, Adocao, StatusAdocao, Divulgacao, DivulgacaoStatus, Parceiro, StatusAnimal, AnimalComunitario, DoacaoComUsuario, StatusDoacao} from '../../types';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Textarea from '../components/common/textarea';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';
import { buildImageUrl } from '@/utils/helpers';



// --- COMPONENTE REUTILIZÁVEL DE MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-300 scale-95 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2 mb-6">{children}</p>
        <div className="flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline" className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancelar</Button>
          <Button onClick={onConfirm} className="bg-amber-600 hover:bg-amber-700">Confirmar</Button>
        </div>
      </div>
    </div>
  );
};


// TIPO PARA CONTROLAR A VISTA ATIVA
type AdminView = 'dashboard' | 'slides' | 'voluntarios' | 'membros' | 'doacoes' | 'animais' | 'adocoes' | 'divulgacoes' | 'conteudo' | 'relatórios' | 'configuracoes' | 'animaisComunitarios';

// --- TIPOS ADICIONAIS PARA O DASHBOARD DINÂMICO ---
type WeeklyActivity = {
  name: string;
  NovasAdoções: number;
  NovasDivulgações: number;
};

type DashboardStats = {
  pedidosPendentes: number;
  divulgacoesPendentes: number;
  animaisDisponiveis: number;
  totalMembros: number;
};

type RecentActivities = {
  adocoes: Adocao[];
  voluntarios: Voluntario[];
};

// --- COMPONENTES FILHOS ---

// 1. COMPONENTE: Dashboard
const Dashboard = ({
  user,
  setActiveView,
}: {
  user: Usuario | null;
  setActiveView: (view: AdminView) => void;
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    pedidosPendentes: 0,
    divulgacoesPendentes: 0,
    animaisDisponiveis: 0,
    totalMembros: 0,
  });
  const [weeklyActivityData, setWeeklyActivityData] = useState<WeeklyActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivities>({ adocoes: [], voluntarios: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/dashboard/summary');
        const data = response.data;

        setStats(data.stats);
        setWeeklyActivityData(data.weeklyActivity);
        setRecentActivities(data.recentActivities);

      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard.');
        toast.error('Erro ao buscar dados do dashboard.');
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
        </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <section className="space-y-8">
      <div className="relative p-8 bg-stone-900 rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Cão feliz"/>
        <div className="relative z-20">
            <h1 className="text-3xl font-bold text-white">Bem-vindo, {user?.nome?.split(' ')[0]}!</h1>
            <p className="text-stone-300 mt-1">O seu trabalho faz toda a diferença. Vamos ver as novidades.</p>
        </div>
      </div>
      
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
          description="Usuários registados na plataforma."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Atividades Recentes</h2>
            <div className="space-y-4">
                {recentActivities.adocoes.length === 0 && recentActivities.voluntarios.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>
                )}
                {recentActivities.adocoes.map(adocao => (
                    <div key={adocao.id} className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></div>
                        <p className="text-sm text-gray-700"><span className="font-semibold">{adocao.usuario?.nome || 'Utilizador'}</span> quer adotar <span className="font-semibold">{adocao.animal?.nome || 'um animal'}</span>.</p>
                    </div>
                ))}
                {recentActivities.voluntarios.map(voluntario => (
                    <div key={voluntario.id} className="flex items-center gap-3">
                         <div className="p-2 bg-green-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9M15 21a2 2 0 002-2v-3.354" /></svg></div>
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
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setFile(null);
    setEditingSlide(null);
    const fileInput = document.getElementById('slide-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handleEditClick = (slide: Slide) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (editingSlide) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
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
      toast.success('Slide criado com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao criar o slide.');
    }
  };

  const handleUpdate = async () => {
    if (!editingSlide) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await api.patch<Slide>(`/slide/${editingSlide.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSlides(slides.map(s => s.id === editingSlide.id ? response.data : s));
      toast.success('Slide atualizado com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar o slide.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem acerteza que deseja excluir este slide?')) {
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
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
          <h3 className="font-semibold text-gray-800">{editingSlide ? 'Editar Slide' : 'Adicionar Novo Slide'}</h3>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do Slide" required />
          <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtítulo (opcional)" />
          <div>
            <label htmlFor="slide-file-input" className="block mb-2 text-sm font-medium text-gray-700">Imagem do Slide</label>
            <input 
              id="slide-file-input" 
              type="file" 
              accept="image/*" 
              onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" 
              required={!editingSlide}
            />
             {editingSlide && <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a imagem atual.</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Button type="submit">{editingSlide ? 'Salvar Alterações' : 'Adicionar Slide'}</Button>
            {editingSlide && (
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            )}
          </div>
        </form>
        
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Slides Atuais</h3>
          <div className="space-y-2">
            {slides.map(slide => (
              <div key={slide.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                <div className="flex items-center space-x-4">
                  <img src={buildImageUrl(slide.imageUrl)} alt={slide.title} className="w-20 h-12 object-cover rounded-md" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x48?text=Erro'; }} />
                  <div>
                    <p className="font-semibold text-gray-900">{slide.title}</p>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={() => handleEditClick(slide)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">Editar</button>
                    <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Apagar</button>
                </div>
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
    
    const handleWhatsAppContact = (voluntario: Voluntario) => {
        if (!voluntario.usuario?.telefone) {
            toast.error('Este candidato não possui um número de telefone cadastrado.');
            return;
        }
        const numero = voluntario.usuario.telefone.replace(/\D/g, '');
        const texto = encodeURIComponent(
            `Olá ${voluntario.usuario.nome}! Somos da associação e recebemos sua candidatura para voluntariado. Gostaríamos de conversar um pouco mais sobre o seu interesse em nos ajudar!`
        );
        
        window.open(`https://wa.me/55${numero}?text=${texto}`, '_blank');
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
                                      <div className="text-sm font-medium text-gray-900">{voluntario.usuario?.nome || 'Utilizador não identificado'}</div>
                                      <div className="text-sm text-gray-500">{voluntario.usuario?.email}</div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 max-w-sm whitespace-normal">{voluntario.motivo}</td>
                                  <td className="px-6 py-4 text-center">
                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(voluntario.status)}`}>{voluntario.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-medium space-x-4 whitespace-nowrap">
                                    {voluntario.status === 'pendente' && (
                                        <>
                                            <button onClick={() => handleWhatsAppContact(voluntario)} className="text-green-600 hover:text-green-800">Mensagem</button>
                                            <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-blue-600 hover:text-blue-900">Aprovar</button>
                                            <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900">Recusar</button>
                                        </>
                                    )}
                                    {(voluntario.status === 'aprovado' || voluntario.status === 'recusado') && (
                                        <button onClick={() => handleWhatsAppContact(voluntario)} className="text-green-600 hover:text-green-800">
                                            Chamar no WhatsApp
                                        </button>
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
const MemberManager = ({ initialUsers, onUserUpdate }: { initialUsers: Usuario[], onUserUpdate: (user: Usuario) => void }) => {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState(initialUsers);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    
    const [modalState, setModalState] = useState<{ isOpen: boolean; userToUpdate: Usuario | null; newRole: string | null }>({
        isOpen: false,
        userToUpdate: null,
        newRole: null,
    });

    const handleDelete = async (userId: number) => {
        if (confirm('Tem certeza de que deseja apagar este membro?')) {
            try {
                await api.delete(`/usuario/${userId}`);
                const updatedUsers = usuarios.filter(u => u.id !== userId);
                setUsuarios(updatedUsers);
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
            const updatedUser = response.data;
            setUsuarios(usuarios.map(u => u.id === id ? updatedUser : u));
            onUserUpdate(updatedUser);
            setEditingUser(null);
            toast.success('Membro atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar o membro.');
        }
    };

    const handleRoleChange = (user: Usuario) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        setModalState({
            isOpen: true,
            userToUpdate: user,
            newRole: newRole,
        });
    };

    const confirmRoleChange = async () => {
        const { userToUpdate, newRole } = modalState;
        if (!userToUpdate || !newRole) return;

        try {
            const response = await api.patch(`/usuario/${userToUpdate.id}/role`, { role: newRole });
            const updatedUser = response.data;
            setUsuarios(usuarios.map(u => u.id === userToUpdate.id ? updatedUser : u));
            onUserUpdate(updatedUser);
            toast.success(`'${userToUpdate.nome}' agora é um ${newRole === 'ADMIN' ? 'Administrador' : 'Utilizador'}.`);
        } catch (error) {
            toast.error('Erro ao alterar a permissão do utilizador.');
        } finally {
            setModalState({ isOpen: false, userToUpdate: null, newRole: null });
        }
    };

    return (
        <section>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, userToUpdate: null, newRole: null })}
                onConfirm={confirmRoleChange}
                title="Confirmar Alteração de Permissão"
            >
                Deseja mesmo tornar '{modalState.userToUpdate?.nome}' um {modalState.newRole === 'ADMIN' ? 'Administrador' : 'Utilizador'}?
            </ConfirmationModal>

            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Admin</th>
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
                                            <td className="px-6 py-4"></td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={handleUpdate} className="text-amber-600 hover:text-amber-900">Salvar</button>
                                                <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
                                                    checked={user.role === 'ADMIN'}
                                                    onChange={() => handleRoleChange(user)}
                                                    disabled={user.id === currentUser?.id}
                                                />
                                            </td>
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

// COMPONENTE PARA LISTAR DOAÇÕES
const DonationManager = ({ initialDonations }: { initialDonations: DoacaoComUsuario[] }) => {
    // ESTADO PARA GERENCIAR AS DOAÇÕES E O CARREGAMENTO
    const [donations, setDonations] = useState<DoacaoComUsuario[]>(initialDonations);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // FUNÇÃO PARA ATUALIZAR O STATUS (CONFIRMAR/REJEITAR)
    const handleUpdateStatus = async (id: number, status: StatusDoacao) => {
        setLoadingId(id); // Ativa o ícone de loading para a linha específica
        try {
            const response = await api.patch(`/doacao/${id}/status`, { status });
            // Atualiza a lista na tela sem precisar recarregar a página
            setDonations(prevDonations =>
                prevDonations.map(d => (d.id === id ? response.data : d))
            );
            toast.success(`Doação ${status === 'CONFIRMADA' ? 'confirmada' : 'rejeitada'}!`);
        } catch (error) {
            toast.error('Erro ao atualizar o status da doação.');
        } finally {
            setLoadingId(null); // Desativa o loading
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string | Date) => { // Date para evitar erros
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Comprovante</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {donations.map(doacao => (
                                <tr key={doacao.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{doacao.usuario?.nome || 'Doação Anônima'}</div>
                                        <div className="text-sm text-gray-500">{doacao.usuario?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(doacao.valor)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(doacao.data)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            doacao.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                                            doacao.status === 'REJEITADA' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {doacao.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        {/* --- CORREÇÃO AQUI --- */}
                                        <a
                                            href={buildImageUrl(doacao.comprovanteUrl)} // Usa buildImageUrl
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-600 hover:text-amber-800 inline-flex items-center gap-1 font-semibold"
                                        >
                                            Visualizar <ExternalLink size={14} />
                                        </a>
                                        {/* --- FIM DA CORREÇÃO --- */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {loadingId === doacao.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                                        ) : doacao.status === 'PENDENTE' ? (
                                            <div className="flex justify-center space-x-3">
                                                <button onClick={() => handleUpdateStatus(doacao.id, 'CONFIRMADA')} className="text-green-600 hover:text-green-800" title="Confirmar Doação">
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(doacao.id, 'REJEITADA')} className="text-red-600 hover:text-red-800" title="Rejeitar Doação">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
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


// 6. COMPONENTE PARA GERIR ANIMAIS
const AnimalManager = ({ animals, setAnimals }: { animals: Animal[], setAnimals: React.Dispatch<React.SetStateAction<Animal[]>> }) => {
  const initialState = {
    nome: '',
    raca: '',
    idade: '',
    descricao: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [especie, setEspecie] = useState<Especie>(Especie.CAO);
  const [sexo, setSexo] = useState<Sexo>(Sexo.MACHO);
  const [porte, setPorte] = useState<Porte>(Porte.PEQUENO);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData(initialState);
    setEspecie(Especie.CAO);
    setSexo(Sexo.MACHO);
    setPorte(Porte.PEQUENO);
    setFile(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      resetForm();
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      toast.error('Não foi possível cadastrar o animal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (animalId: string) => {
    if (window.confirm('Tem certeza que deseja apagar este animal?')) {
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
    setEditingId(animal.id);
    setFormData({
      nome: animal.nome,
      raca: animal.raca,
      idade: animal.idade,
      descricao: animal.descricao,
    });
    setEspecie(animal.especie);
    setSexo(animal.sexo);
    setPorte(animal.porte);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setIsLoading(true);

    const updatedData = {
      ...formData,
      especie,
      sexo,
      porte,
    };

    try {
      const response = await api.patch<Animal>(`/animais/${editingId}`, updatedData);
      setAnimals(prev => prev.map(a => a.id === editingId ? response.data : a));
      toast.success('Animal atualizado com sucesso!');
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar o animal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          {editingId ? 'Editar Animal' : 'Cadastrar Novo Animal'}
        </h3>
        <form onSubmit={editingId ? handleUpdate : handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Bob" required />
            </div>
            <div>
              <label htmlFor="raca" className="block text-sm font-medium text-gray-700 mb-2">Raça</label>
              <Input id="raca" value={formData.raca} onChange={(e) => setFormData({ ...formData, raca: e.target.value })} placeholder="Ex: Sem Raça Definida (SRD)" required />
            </div>
            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
              <Input id="idade" value={formData.idade} onChange={(e) => setFormData({ ...formData, idade: e.target.value })} placeholder="Ex: Aprox. 2 anos" required />
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
          {!editingId && (
            <div>
              <label htmlFor="animal-file-input" className="block text-sm font-medium text-gray-700 mb-2">Foto do Animal</label>
              <input ref={fileInputRef} id="animal-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required={!editingId} />
            </div>
          )}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">Descrição e Comportamento</label>
            <textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 placeholder:text-gray-400 text-gray-900" placeholder="Conte a história do animal, como ele é com pessoas, outros animais, etc." required></textarea>
          </div>
          <div className="flex justify-end items-center gap-4">
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar Edição
              </Button>
            )}
            <Button type="submit" isLoading={isLoading}>
              {editingId ? 'Atualizar Animal' : 'Cadastrar Animal'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Animais Cadastrados</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porte</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    Nenhum animal encontrado.
                  </td>
                </tr>
              ) : (
                animals.map(animal => (
                  <tr key={animal.id}>
                    <td className="px-6 py-4">
                      <img src={buildImageUrl(animal.animalImageUrl)} alt={animal.nome} className="w-12 h-12 object-cover rounded-md" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48x48?text=Erro'; }} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.porte}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(animal)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                    </td>
                  </tr>
                ))
              )}
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
            toast.error('Este usuário não possui um número de telefone registado.');
            return;
        }
        const numero = adocao.usuario.telefone.replace(/\D/g, '');
        const nomeAnimal = adocao.animal?.nome;
        let texto;

        if (isFollowUp) {
            texto = encodeURIComponent(`Olá ${adocao.usuario.nome}! Somos da associação de protetores independentes Fabiana Forte Huergo e gostaríamos de fazer o acompanhamento da adoção do(a) ${nomeAnimal}. Como ele(a) está se adaptando ao novo lar?`);
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
                                                <button onClick={() => handleWhatsAppContact(adocao, true)} className="text-green-600 hover:text-green-900">Chamar no  WhatsApp</button>
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
                                Chamar no Whatsapp
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDivulgacao, setSelectedDivulgacao] = useState<Divulgacao | null>(null);
  const [animalFormData, setAnimalFormData] = useState({
    nome: '',
    raca: '',
    descricao: '',
    idade: '',
    especie: Especie.CAO,
    sexo: Sexo.MACHO,
    porte: Porte.PEQUENO,
  });

  const pendingDivulgacoes = initialDivulgacoes.filter(d => d.status === DivulgacaoStatus.PENDENTE);
  const processedDivulgacoes = initialDivulgacoes.filter(
    d => d.status === DivulgacaoStatus.REVISADO || d.status === DivulgacaoStatus.REJEITADO
  );
  
  const handleOpenApprovalModal = (divulgacao: Divulgacao) => {
    setSelectedDivulgacao(divulgacao);
    setAnimalFormData({
      nome: '',
      raca: divulgacao.raca,
      descricao: divulgacao.descricao || '',
      idade: '',
      especie: Especie.CAO,
      sexo: Sexo.MACHO,
      porte: Porte.PEQUENO,
    });
    setIsModalOpen(true);
  };

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
        toast.error('Este usuário não possui um número de telefone registado.');
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
  
  const handleConvertToAnimal = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDivulgacao) return;

    const id = selectedDivulgacao.id;
    setLoadingStates(prev => ({ ...prev, [`convert-${id}`]: true }));
    
    await handleAction(
      api.post(`/divulgacao/${id}/convert-to-animal`, animalFormData),
      "Animal listado para adoção com sucesso!"
    );
    
    setLoadingStates(prev => ({ ...prev, [`convert-${id}`]: false }));
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta divulgação?")) {
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
      {isModalOpen && selectedDivulgacao && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full transform transition-all duration-300 scale-95 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aprovar e Listar Animal</h2>
            <form onSubmit={handleConvertToAnimal} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="animal-nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Animal</label>
                    <Input id="animal-nome" value={animalFormData.nome} onChange={e => setAnimalFormData({...animalFormData, nome: e.target.value})} placeholder="Nome para o animal" required />
                  </div>
                  <div>
                    <label htmlFor="animal-raca" className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                    <Input id="animal-raca" value={animalFormData.raca} onChange={e => setAnimalFormData({...animalFormData, raca: e.target.value})} required />
                  </div>
              </div>
              <div>
                <label htmlFor="animal-descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <Textarea id="animal-descricao" value={animalFormData.descricao} onChange={e => setAnimalFormData({...animalFormData, descricao: e.target.value})} rows={3} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="animal-idade" className="block text-sm font-medium text-gray-700 mb-1">Idade (texto)</label>
                    <Input id="animal-idade" value={animalFormData.idade} onChange={e => setAnimalFormData({...animalFormData, idade: e.target.value})} placeholder="Ex: Aprox. 2 anos" required />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                      <select value={animalFormData.especie} onChange={e => setAnimalFormData({...animalFormData, especie: e.target.value as Especie})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-amber-500 focus:border-amber-500">
                          <option value={Especie.CAO}>Cão</option>
                          <option value={Especie.GATO}>Gato</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                      <select value={animalFormData.sexo} onChange={e => setAnimalFormData({...animalFormData, sexo: e.target.value as Sexo})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-amber-500 focus:border-amber-500">
                          <option value={Sexo.MACHO}>Macho</option>
                          <option value={Sexo.FEMEA}>Fêmea</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                      <select value={animalFormData.porte} onChange={e => setAnimalFormData({...animalFormData, porte: e.target.value as Porte})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-amber-500 focus:border-amber-500">
                          <option value={Porte.PEQUENO}>Pequeno</option>
                          <option value={Porte.MEDIO}>Médio</option>
                          <option value={Porte.GRANDE}>Grande</option>
                      </select>
                  </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancelar</Button>
                <Button type="submit" isLoading={loadingStates[`convert-${selectedDivulgacao.id}`]} className="bg-amber-600 hover:bg-amber-700">Confirmar e Listar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
               <img src={buildImageUrl(divulgacao.imageUrl)} alt={divulgacao.raca} className="w-full h-56 object-cover cursor-pointer" onClick={() => setSelectedImage(buildImageUrl(divulgacao.imageUrl))} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x224?text=Erro'; }} />
                <div className="absolute top-2 right-2"><StatusBadge status={divulgacao.status} /></div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-800">{divulgacao.raca}</h3>
                <p className="text-sm text-gray-600">{divulgacao.localizacao}</p>
                <div className="my-3 text-sm space-y-1 text-gray-700">
                  <p><strong>Enviado por:</strong> {divulgacao.usuario?.nome || 'N/A'}</p>
                  <p><strong>Data:</strong> {new Date(divulgacao.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${divulgacao.castrado ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>{divulgacao.castrado ? 'Castrado' : 'Não Castrado'}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${divulgacao.resgate ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>{divulgacao.resgate ? 'Resgate' : 'Particular'}</span>
                  </div>
                </div>
                {divulgacao.descricao && <p className="text-sm text-gray-600 mb-4 flex-1">"{divulgacao.descricao}"</p>}
                <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                  <Button variant="primary" onClick={() => handleWhatsAppContact(divulgacao)} className="w-full bg-green-500 hover:bg-green-600">Contactar via WhatsApp</Button>
                  {divulgacao.status === 'PENDENTE' && (
                    <div className="flex flex-col space-y-2">
                      <Button variant="success" onClick={() => handleOpenApprovalModal(divulgacao)} isLoading={loadingStates[`convert-${divulgacao.id}`]}>Aprovar e Listar</Button>
                      <Button variant="danger" onClick={() => handleStatusChange(divulgacao.id, DivulgacaoStatus.REJEITADO)} isLoading={loadingStates[`status-${divulgacao.id}`]}>Rejeitar</Button>
                    </div>
                  )}
                   <Button variant="outline" className="w-full" onClick={() => handleDelete(divulgacao.id)} isLoading={loadingStates[`delete-${divulgacao.id}`]}>Excluir Permanentemente</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedImage(null)}>
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
      toast.error('Por favor, selecione uma logótipo.');
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
    if (confirm('Tem certeza que deseja apagar este parceiro?')) {
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
                <h2 className="text-xl font-bold text-slate-800 mb-6">Editar Seção "Sobre" da Página Inicial</h2>
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
                        {conteudo.imagemUrl && <img src={buildImageUrl(conteudo.imagemUrl)} alt="Preview" className="mt-4 w-48 h-auto rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
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
                                <img src={buildImageUrl(parceiro.logoUrl)} alt={parceiro.nome} className="w-20 h-12 object-contain rounded-md bg-gray-100 p-1" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x48?text=Logo'; }}/>
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


// --- COMPONENTE PARA GERIR RELATÓRIOS DO SISTEMA ---
const ReportsManager = () => {
  // Função genérica para lidar com o download de qualquer relatório
  const handleExport = async (format: 'csv' | 'pdf', reportType: string, fileName: string) => {
    const endpoint = `/reports/${reportType}/${format}`;
    const toastId = toast.loading(
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-600 border-t-transparent"></div>
        <span>Gerando seu relatório {format.toUpperCase()}...</span>
      </div>
    );

    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      
      const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      
      toast.dismiss(toastId);
      toast.success(
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Download do relatório iniciado!
        </div>
      );

    } catch (error) {
      toast.dismiss(toastId);
      toast.error(
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          Erro ao gerar o relatório {format.toUpperCase()}
        </div>
      );
      console.error(`Erro na exportação de ${format.toUpperCase()}:`, error);
    }
  };

  type ReportCardProps = {
    title: string;
    description: string;
    reportType: string;
    csvFileName: string;
    pdfFileName: string;
    icon: React.ReactNode;
    color: string;
  };

  // Componente para o cartão de cada relatório
  const ReportCard = ({ title, description, reportType, csvFileName, pdfFileName, icon, color }: ReportCardProps) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex gap-1">
          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
            CSV
          </span>
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
            PDF
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-700 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed mb-6 text-sm">
        {description}
      </p>
      
      <div className="flex gap-3">
        <Button 
          onClick={() => handleExport('csv', reportType, csvFileName)}
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 group/btn"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </div>
        </Button>
        <Button 
          onClick={() => handleExport('pdf', reportType, pdfFileName)}
          className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 group/btn"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </div>
        </Button>
      </div>
    </div>
  );

  // Ícones para os diferentes tipos de relatório
  const ReportIcons = {
    donations: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ),
    animals: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 5a2 2 0 10-4 0 2 2 0 004 0z" /></svg> ),
    adoptions: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> ),
    users: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg> ),
    volunteers: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> ),
    financial: ( <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m-3-7h.01" /></svg> ),
  };
  
  // Array de configuração para os relatórios
  const reportsData = [
    { title: "Relatório de Doações", description: "Exporte uma lista completa de todas as doações recebidas com valores, datas e doadores.", reportType: "donations", icon: ReportIcons.donations },
    { title: "Relatório de Animais", description: "Lista de todos os animais cadastrados.", reportType: "animals", icon: ReportIcons.animals },
    { title: "Relatório de Adoções", description: "Histórico completo de processos de adoção, status e informações dos adotantes.", reportType: "adoptions", icon: ReportIcons.adoptions },
    { title: "Relatório de Usuários", description: "Dados dos usuários cadastrados no sistema.", reportType: "users", icon: ReportIcons.users },
    { title: "Relatório de Voluntários", description: "Informações sobre voluntários.", reportType: "volunteers", icon: ReportIcons.volunteers },
  ];

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsData.map((report) => (
          <ReportCard 
            key={report.reportType}
            title={report.title}
            description={report.description}
            reportType={report.reportType}
            csvFileName={`relatorio_${report.reportType}.csv`}
            pdfFileName={`relatorio_${report.reportType}.pdf`}
            icon={report.icon}
            color="bg-gradient-to-br from-amber-600 to-orange-700"
          />
        ))}
      </div>
    </section>
  );
};

// 10. COMPONENTE PARA GERIR CONFIGURAÇÕES
const ConfiguracaoManager = () => {
  const [gamificacaoAtiva, setGamificacaoAtiva] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/configuracao');
        setGamificacaoAtiva(response.data.gamificacaoAtiva);
      } catch (error) {
        toast.error("Erro ao carregar as configurações.");
        console.error("Erro ao buscar configuração:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleToggleChange = async (novoStatus: boolean) => {
    setGamificacaoAtiva(novoStatus);

    try {
      await api.patch('/configuracao', {
        gamificacaoAtiva: novoStatus,
      });
      toast.success('Configuração guardada com sucesso!');
    } catch (error) {
      toast.error('Erro ao guardar a configuração.');
      setGamificacaoAtiva(!novoStatus);
      console.error("Erro ao salvar configuração:", error);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Configurações Gerais</h3>
        
        {isLoading ? (
          <p className="text-gray-500">carregando...</p>
        ) : (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Sistema de Gamificação</p>
              <p className="text-sm text-gray-500">
                Ative ou desative a atribuição de pontos e conquistas em todo o site.
              </p>
            </div>
            <label htmlFor="gamification-toggle" className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="gamification-toggle" 
                className="sr-only peer"
                checked={gamificacaoAtiva}
                onChange={(e) => handleToggleChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

// 11. COMPONENTE PARA GERIR ANIMAIS COMUNITÁRIOS
const AnimalComunitarioManager = ({ animais, onUpdate }: { animais: AnimalComunitario[], onUpdate: () => void }) => {
    // Estado inicial alinhado com o DTO
    const initialState = {
        nomeTemporario: '',
        enderecoCompleto: '',
    };
    
    // Posição inicial do mapa
    const initialPosition = { lat: -26.24, lng: -50.28 };

    const [formData, setFormData] = useState(initialState);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Estado para as coordenadas do mapa
    const [coordinates, setCoordinates] = useState(initialPosition);

    // Estado para o campo de busca de endereço e loading do geocoding
    const [addressSearch, setAddressSearch] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Importação dinâmica do mapa para rodar apenas no cliente
    const MapaDeSelecao = useMemo(() => dynamic(
        () => import('../components/common/MapaDeSelecao'),
        {
            ssr: false,
            loading: () => <div className="h-[300px] w-full flex justify-center items-center bg-gray-100 rounded-lg"><p className="text-gray-500"> carregando mapa...</p></div>
        }
    ), []);
    
    // Reseta o formulário e os novos estados
    const resetForm = () => {
        setFormData(initialState);
        setFile(null);
        setEditingId(null);
        setCoordinates(initialPosition);
        setAddressSearch('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    // Recebe a posição do componente do mapa
    const handlePositionChange = (position: { lat: number; lng: number }) => {
        setCoordinates(position);
    };

    // Função para buscar o endereço na API de geocoding
    const handleAddressSearch = async () => {
        if (!addressSearch.trim()) {
            toast.error("Por favor, digite um endereço para buscar.");
            return;
        }
        setIsGeocoding(true);
        try {
            const response = await api.get('/geocoding/search', {
                params: { address: addressSearch }
            });
            const { lat, lng } = response.data;
            setCoordinates({ lat, lng });
            toast.success("Endereço encontrado!");
        } catch (error) {
            toast.error("Não foi possível encontrar este endereço.");
            console.error("Erro de Geocoding:", error);
        } finally {
            setIsGeocoding(false);
        }
    };

    // Envia os dados para a API (criar ou atualizar)
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append('nomeTemporario', formData.nomeTemporario);
        data.append('enderecoCompleto', formData.enderecoCompleto);
        data.append('latitude', String(coordinates.lat));
        data.append('longitude', String(coordinates.lng));
        
        if (file) {
            data.append('file', file);
        }

        try {
            if (editingId) {
                await api.patch(`/animais-comunitarios/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Registo atualizado com sucesso!');
            } else {
                if (!file) {
                    toast.error('Por favor, selecione uma imagem.');
                    setIsLoading(false);
                    return;
                }
                await api.post('/animais-comunitarios', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Animal comunitário registado com sucesso!');
            }
            resetForm();
            onUpdate();
        } catch (error) {
            console.error('Erro ao salvar animal comunitário:', error);
            toast.error('Não foi possível salvar o registo.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Prepara o formulário para edição
    const handleEdit = (animal: AnimalComunitario) => {
        setEditingId(animal.id);
        setFormData({
            nomeTemporario: animal.nomeTemporario,
            enderecoCompleto: animal.enderecoCompleto || '',
        });
        if (animal.latitude && animal.longitude) {
            setCoordinates({ lat: animal.latitude, lng: animal.longitude });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (animalId: string) => {
        if (window.confirm('Tem certeza que deseja apagar este registo?')) {
            try {
                await api.delete(`/animais-comunitarios/${animalId}`);
                toast.success('Registo apagado com sucesso!');
                onUpdate();
            } catch (error) {
                toast.error('Erro ao apagar o registo.');
            }
        }
    };

    return (
        <section className="space-y-8">
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    {editingId ? 'Editar Animal Comunitário' : 'Registar Novo Animal Comunitário'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Nome / Identificação" 
                            value={formData.nomeTemporario} 
                            onChange={(e) => setFormData({ ...formData, nomeTemporario: e.target.value })} 
                            placeholder="Ex: Gato Frajola do Bairro" 
                            required 
                        />
                        <Input 
                            label="Endereço Completo (Texto)" 
                            value={formData.enderecoCompleto} 
                            onChange={(e) => setFormData({ ...formData, enderecoCompleto: e.target.value })} 
                            placeholder="Ex: Rua das Flores, 123, Centro" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Procurar endereço no mapa
                        </label>
                        <div className="flex items-stretch gap-2">
                           <Input 
                                value={addressSearch}
                                onChange={(e) => setAddressSearch(e.target.value)}
                                placeholder="Digite o endereço e clique em buscar..."
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddressSearch(); }}}
                           />
                           <Button type="button" onClick={handleAddressSearch} isLoading={isGeocoding}>
                               Buscar
                           </Button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Localização no Mapa (arraste o pino para ajustar)
                        </label>
                        <MapaDeSelecao 
                          position={[coordinates.lat, coordinates.lng]}
                          onPositionChange={handlePositionChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Animal</label>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" required={!editingId} />
                        {editingId && <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a foto atual.</p>}
                    </div>
                    
                    <div className="flex justify-end items-center gap-4">
                        {editingId && (<Button type="button" variant="outline" onClick={resetForm}>Cancelar Edição</Button>)}
                        <Button type="submit" isLoading={isLoading}>{editingId ? 'Atualizar Registo' : 'Adicionar Registo'}</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Animais Comunitários Registados</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localização (Texto)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {animais.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        Nenhum animal comunitário registado.
                                    </td>
                                </tr>
                            ) : (
                                animais.map(animal => (
                                    <tr key={animal.id}>
                                        <td className="px-6 py-4">
                                          <img src={buildImageUrl(animal.imageUrl)} alt={animal.nomeTemporario} className="w-16 h-16 object-cover rounded-md" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Erro'; }}/>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.nomeTemporario}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.enderecoCompleto || 'Não informado'}</td>
                                        <td className="px-6 py-4 text-center text-sm font-medium space-x-4">
                                            <button onClick={() => handleEdit(animal)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                            <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
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
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [adocoes, setAdocoes] = useState<Adocao[]>([]);
  const [divulgacoes, setDivulgacoes] = useState<Divulgacao[]>([]);
  const [animaisComunitarios, setAnimaisComunitarios] = useState<AnimalComunitario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [voluntariosRes, usuariosRes, slidesRes, doacoesRes, animaisRes, adocoesRes, divulgacoesRes, animaisComunitariosRes] = await Promise.all([
        api.get<Voluntario[]>('/voluntario'),
        api.get<Usuario[]>('/usuario'),
        api.get<Slide[]>('/slide'),
        api.get<Doacao[]>('/doacao'),
        api.get<Animal[]>('/animais?context=admin'),
        api.get<Adocao[]>('/adocoes'),
        api.get<Divulgacao[]>('/divulgacao'),
        api.get<AnimalComunitario[]>('/animais-comunitarios'),
      ]);
      setVoluntarios(voluntariosRes.data);
      setUsuarios(usuariosRes.data);
      setSlides(slidesRes.data);
      setDoacoes(doacoesRes.data);
      setAnimais(animaisRes.data);
      setAdocoes(adocoesRes.data);
      setDivulgacoes(divulgacoesRes.data);
      setAnimaisComunitarios(animaisComunitariosRes.data);
    } catch (err) {
      setError('Falha ao carregar os dados do painel.');
      toast.error('Falha ao carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchData]);
  
  const handleUserUpdate = (updatedUser: Usuario) => {
    setUsuarios(currentUsers => 
        currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">Você não tem permissão para acessar o painel administrativo.</p>
          <Link href="/" className="mt-6 inline-block text-amber-600 hover:underline">
            Voltar à Página Inicial
          </Link>
        </div>
      </main>
    );
  }

const Sidebar = () => (
  <aside className={`bg-gradient-to-b from-stone-800 to-stone-900 text-white flex flex-col h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden shadow-2xl border-r border-stone-700`}>
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="p-6 flex-shrink-0 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">Painel Admin</h2>
            <p className="text-stone-400 text-xs">Centro de Controle</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1 custom-scrollbar py-4">
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
          label="Dashboard"
          active={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />

        <NavSection title="Conteúdo" />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          label="Slides"
          active={activeView === 'slides'}
          onClick={() => setActiveView('slides')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          label="Conteúdo"
          active={activeView === 'conteudo'}
          onClick={() => setActiveView('conteudo')}
        />

        <NavSection title="Animais" />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Animais"
          active={activeView === 'animais'}
          onClick={() => setActiveView('animais')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          label="Animais Comunitários"
          active={activeView === 'animaisComunitarios'}
          onClick={() => setActiveView('animaisComunitarios')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          }
          label="Divulgações"
          active={activeView === 'divulgacoes'}
          onClick={() => setActiveView('divulgacoes')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          label="Adoções"
          active={activeView === 'adocoes'}
          onClick={() => setActiveView('adocoes')}
        />

        <NavSection title="Pessoas" />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          label="Voluntários"
          active={activeView === 'voluntarios'}
          onClick={() => setActiveView('voluntarios')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
          label="Membros"
          active={activeView === 'membros'}
          onClick={() => setActiveView('membros')}
        />

        <NavSection title="Financeiro" />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Doações"
          active={activeView === 'doacoes'}
          onClick={() => setActiveView('doacoes')}
        />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Relatórios"
          active={activeView === 'relatórios'}
          onClick={() => setActiveView('relatórios')}
        />
        

        <NavSection title="Sistema" />
        <NavItem 
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Configurações"
          active={activeView === 'configuracoes'}
          onClick={() => setActiveView('configuracoes')}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 flex-shrink-0 border-t border-stone-700">
        <Link href="/" className="flex items-center justify-center gap-3 text-center p-3 rounded-xl bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 transition-all duration-200 group shadow-lg">
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Voltar ao Site</span>
        </Link>
      </div>
    </div>
  </aside>
);

// Componente auxiliar para itens de navegação
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 text-left p-3 rounded-xl transition-all duration-200 whitespace-nowrap group ${
      active 
        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-r-2 border-amber-500 shadow-lg' 
        : 'text-stone-300 hover:bg-stone-700/50 hover:text-white hover:shadow-md'
    }`}
  >
    <div className={`transition-colors duration-200 ${active ? 'text-amber-400' : 'text-stone-400 group-hover:text-amber-300'}`}>
      {icon}
    </div>
    <span className="font-medium text-sm">{label}</span>
    {active && (
      <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
    )}
  </button>
);

// Componente auxiliar para seções
const NavSection = ({ title }: { title: string }) => (
  <div className="px-3 py-2">
    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{title}</span>
  </div>
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
    conteudo: 'Gestão de Conteúdo e Parceiros',
    relatórios: 'Relatórios',
    configuracoes: 'Configurações Gerais',
    animaisComunitarios: 'Gestão de Animais Comunitários'
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
          {loading && <p className="text-center text-gray-600">Carregando...</p>}
          {error && <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
          
          {!loading && !error && (
              <>
                  {activeView === 'dashboard' && <Dashboard user={user} setActiveView={setActiveView} />}
                  {activeView === 'slides' && <SlideManager initialSlides={slides} />}
                  {activeView === 'animais' && <AnimalManager animals={animais} setAnimals={setAnimais} />}
                  {activeView === 'animaisComunitarios' && <AnimalComunitarioManager animais={animaisComunitarios} onUpdate={fetchData} />}
                  {activeView === 'adocoes' && <AdoptionManager initialAdoptions={adocoes} onUpdate={(updated) => setAdocoes(adocoes.map(a => a.id === updated.id ? updated : a))} />}
                  {activeView === 'divulgacoes' && <DivulgacaoManager initialDivulgacoes={divulgacoes} onUpdate={fetchData} />}
                  {activeView === 'voluntarios' && <VolunteerManager initialVolunteers={voluntarios} />}
                  {activeView === 'membros' && <MemberManager initialUsers={usuarios} onUserUpdate={handleUserUpdate} />}
                  {activeView === 'doacoes' && <DonationManager initialDonations={doacoes} />}
                  {activeView === 'conteudo' && <ConteudoManager />}
                  {activeView === 'relatórios' && <ReportsManager />}
                  {activeView === 'configuracoes' && <ConfiguracaoManager />}
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
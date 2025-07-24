'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Seus componentes comuns
import Input from '../components/common/input';
import Button from '../components/common/button';

// Tipos
import { Doacao, Voluntario, Usuario, Adocao } from '../../types'; // Adocao importado
type ProfileView = 'overview' | 'edit_profile' | 'change_password' | 'meus_pedidos'; // 'meus_pedidos' adicionado

// --- ÍCONES DEFINIDOS LOCALMENTE ---
const Icon = ({ path, className = "h-6 w-6" }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  dashboard: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  user: <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  lock: <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  gift: <Icon className="h-8 w-8 text-blue-500" path="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
  heart: <Icon className="h-8 w-8" path="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />,
  camera: <Icon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
  clipboard: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
};

// COMPONENTE PARA MOSTRAR OS PEDIDOS DE ADOÇÃO (CORRIGIDO)
const MeusPedidosView = ({ pedidos }: { pedidos: Adocao[] }) => {
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'APROVADA': return 'bg-green-100 text-green-800';
            case 'RECUSADA': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Meus Pedidos de Adoção</h2>
            {pedidos.length === 0 ? (
                <p className="text-gray-600">Você ainda não fez nenhum pedido de adoção.</p>
            ) : (
                <div className="space-y-4">
                    {pedidos.map(pedido => (
                       
                        pedido.animal && (
                            <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <img 
                                        src={`${api.defaults.baseURL}${pedido.animal.animalImageUrl}`} 
                                        alt={pedido.animal.nome}
                                        className="w-16 h-16 object-cover rounded-md"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=Sem+Foto'; }}
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800">{pedido.animal.nome}</p>
                                        <p className="text-sm text-gray-500">Pedido em: {new Date(pedido.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(pedido.status)}`}>
                                    {pedido.status.replace('_', ' ')}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>('overview');

  const [donationCount, setDonationCount] = useState(0);
  const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pedidos, setPedidos] = useState<Adocao[]>([]); // Estado para os pedidos de adoção

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');

      const fetchAllData = async () => {
        try {
          const [donationsRes, volunteersRes, adocoesRes] = await Promise.all([
            api.get<Doacao[]>('/doacao'),
            api.get<Voluntario[]>('/voluntario'),
            api.get<Adocao[]>('/adocoes/meus-pedidos'),
          ]);

          const userDonations = donationsRes.data.filter(d => d.usuarioId === user.id);
          setDonationCount(userDonations.length);

          const userVolunteer = volunteersRes.data.find(v => v.usuarioId === user.id);
          setVolunteerStatus(userVolunteer ? userVolunteer.status : 'Não se candidatou');
          
          setPedidos(adocoesRes.data);

        } catch (error) {
          console.error("Erro ao buscar dados do perfil:", error);
          toast.error('Não foi possível carregar todos os dados do perfil.');
        }
      };
      fetchAllData();
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      const response = await api.patch('/usuario/me/profile', { nome, email, telefone });
      updateUser(response.data);
      toast.success('Perfil atualizado com sucesso!');
      setActiveView('overview');
    } catch {
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    try {
      await api.patch('/usuario/me/change-password', { senhaAtual, novaSenha });
      toast.success('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setActiveView('overview');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('A enviar a sua nova foto...');
    try {
      const response = await api.patch<Usuario>('/usuario/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data);
      toast.success('Foto de perfil atualizada!', { id: toastId });
    } catch {
      toast.error('Erro ao enviar a foto.', { id: toastId });
    }
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen" />;

  if (!isAuthenticated || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Acesso Negado</h2>
          <p className="text-slate-600">Por favor, faça login para aceder ao seu perfil.</p>
          <Link href="/login" className="block w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition">
              Ir para o Login
          </Link>
        </div>
      </main>
    );
  }

  const apiBaseUrl = api.defaults.baseURL;
  const avatarUrl = user.profileImageUrl
    ? `${apiBaseUrl}${user.profileImageUrl}?t=${new Date().getTime()}`
    : `https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}&background=0ea5e9&color=fff&size=128`;

  const getStatusClasses = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'aprovado': return 'text-green-600 bg-green-100 border-green-200';
      case 'pendente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'recusado': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <main className="bg-slate-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <img src={avatarUrl} alt="Foto de Perfil" className="w-32 h-32 rounded-full object-cover border-4 border-slate-50" />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Alterar foto de perfil"
              className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-all duration-300 group"
            >
              {ICONS.camera}
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-800">{user.nome}</h1>
            <p className="text-slate-500 mt-1">{user.email}</p>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />

        <div className="flex flex-col md:flex-row gap-8">
          
          <nav className="flex-shrink-0 w-full md:w-64">
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
              <button onClick={() => setActiveView('overview')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                {ICONS.dashboard}
                <span>Resumo</span>
              </button>
              <button onClick={() => setActiveView('edit_profile')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'edit_profile' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                {ICONS.user}
                <span>Editar Perfil</span>
              </button>
              <button onClick={() => setActiveView('change_password')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'change_password' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                {ICONS.lock}
                <span>Alterar Senha</span>
              </button>
              <button onClick={() => setActiveView('meus_pedidos')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'meus_pedidos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                {ICONS.clipboard}
                <span>Meus Pedidos</span>
              </button>
            </div>
          </nav>

          <div className="flex-1">
            {activeView === 'overview' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumo da sua Atividade</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border flex items-center gap-4">
                    {ICONS.gift}
                    <div>
                      <p className="text-sm font-medium text-slate-500">Doações Realizadas</p>
                      <p className="text-3xl font-bold text-blue-600">{donationCount}</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl border flex items-center gap-4 ${getStatusClasses(volunteerStatus)}`}>
                    <div className="text-current">{ICONS.heart}</div>
                    <div>
                      <p className="text-sm font-medium">Status de Voluntário</p>
                      <p className="text-2xl font-bold capitalize">{volunteerStatus || 'Não se candidatou'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'edit_profile' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Dados Pessoais</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-700">Nome Completo</label>
                    <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} disabled={isProfileLoading} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isProfileLoading} />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-700">Telefone</label>
                    <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} disabled={isProfileLoading} />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" onClick={() => setActiveView('overview')} className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" disabled={isProfileLoading}>Cancelar</Button>
                    <Button type="submit" isLoading={isProfileLoading}>Guardar Alterações</Button>
                  </div>
                </form>
              </div>
            )}

            {activeView === 'change_password' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Alterar Senha</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="senhaAtual" className="block mb-2 text-sm font-medium text-gray-700">Senha Atual</label>
                    <Input id="senhaAtual" type={showCurrentPassword ? 'text' : 'password'} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} icon={showCurrentPassword ? '👁️' : '👁️‍🗨️'} onIconClick={() => setShowCurrentPassword(!showCurrentPassword)} disabled={isPasswordLoading} />
                  </div>
                  <div>
                    <label htmlFor="novaSenha" className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
                    <Input id="novaSenha" type={showNewPassword ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} icon={showNewPassword ? '👁️' : '👁️‍🗨️'} onIconClick={() => setShowNewPassword(!showNewPassword)} disabled={isPasswordLoading} />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" onClick={() => setActiveView('overview')} className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" disabled={isPasswordLoading}>Cancelar</Button>
                    <Button type="submit" isLoading={isPasswordLoading}>Alterar Senha</Button>
                  </div>
                </form>
              </div>
            )}

            {activeView === 'meus_pedidos' && <MeusPedidosView pedidos={pedidos} />}
          </div>
        </div>
      </div>
    </main>
  );
}

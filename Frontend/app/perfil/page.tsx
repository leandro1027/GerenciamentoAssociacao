'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import { Doacao, Voluntario, Usuario } from '../../types';

// Tipo para controlar a vista ativa no perfil
type ProfileView = 'overview' | 'edit_profile' | 'change_password';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>('overview');

  // Estados para estatísticas
  const [donationCount, setDonationCount] = useState(0);
  const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);

  // Estados para o formulário de perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Estados para o formulário de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Referência para o input de ficheiro escondido
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');

      // Busca dados adicionais para as estatísticas
      const fetchStats = async () => {
        try {
          // Nota: Numa app maior, seria melhor ter endpoints dedicados para isto.
          const [donationsRes, volunteersRes] = await Promise.all([
            api.get<Doacao[]>('/doacao'),
            api.get<Voluntario[]>('/voluntario'),
          ]);
          
          const userDonations = donationsRes.data.filter(d => d.usuarioId === user.id);
          setDonationCount(userDonations.length);

          const userVolunteer = volunteersRes.data.find(v => v.usuarioId === user.id);
          setVolunteerStatus(userVolunteer ? userVolunteer.status : 'Não se candidatou');

        } catch (error) {
          console.error("Erro ao buscar estatísticas do perfil:", error);
        }
      };
      fetchStats();
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      const response = await api.patch('/usuario/me/profile', { nome, email, telefone });
      updateUser(response.data); // Atualiza o utilizador no contexto
      toast.success('Perfil atualizado com sucesso!');
      setActiveView('overview');
    } catch (error) {
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
      updateUser(response.data); // Atualiza o utilizador no contexto global
      toast.success('Foto de perfil atualizada!', { id: toastId });
    } catch (error) {
      toast.error('Erro ao enviar a foto.', { id: toastId });
    }
  };

  if (isAuthLoading) {
    return <main className="flex items-center justify-center min-h-screen">A carregar...</main>;
  }

  if (!isAuthenticated) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-xl space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Acesso Negado</h2>
                    <p className="mt-2 text-slate-600">
                        Esta página é protegida. Por favor, faça login para aceder ao seu perfil.
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-4 pt-4">
                    <Link href="/login" className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                        Ir para a página de Login
                    </Link>
                    <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline transition-colors">
                        Voltar à Página Inicial
                    </Link>
                </div>
            </div>
        </main>
    );
  }

  const apiBaseUrl = api.defaults.baseURL;

  return (
    <main className="bg-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho do Perfil */}
        <div className="md:flex md:items-center md:space-x-8 mb-10">
            <div className="relative w-32 h-32 rounded-full bg-slate-300 flex-shrink-0 mx-auto md:mx-0 group">
                {user?.profileImageUrl ? (
                    <img 
                        key={user.profileImageUrl} // Força a re-renderização da imagem quando o URL muda
                        src={`${apiBaseUrl}${user.profileImageUrl}`} 
                        alt="Foto de Perfil" 
                        className="w-full h-full rounded-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center"><span className="text-5xl">👤</span></div>
                )}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-all duration-300"
                >
                    <span className="text-white opacity-0 group-hover:opacity-100">Alterar Foto</span>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                </div>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-slate-900">{user?.nome}</h1>
                <div className="mt-4 flex justify-center md:justify-start space-x-4">
                    <button onClick={() => setActiveView('edit_profile')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">Editar Perfil</button>
                    <button onClick={() => setActiveView('change_password')} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-300">Alterar Senha</button>
                </div>
            </div>
        </div>

        {/* Conteúdo Dinâmico */}
        <div>
            {activeView === 'overview' && (
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumo da sua Atividade</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl">
                            <p className="text-sm font-medium text-slate-500">Doações Realizadas</p>
                            <p className="text-3xl font-bold text-blue-600">{donationCount}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl">
                            <p className="text-sm font-medium text-slate-500">Status de Voluntário</p>
                            <p className="text-3xl font-bold text-green-600 capitalize">{volunteerStatus}</p>
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
                      <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-700">Telefone</label>
                      <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                      <Button type="button" onClick={() => setActiveView('overview')} className="bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</Button>
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
                      <Input id="senhaAtual" type={showCurrentPassword ? 'text' : 'password'} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} icon={showCurrentPassword ? 'eye-open' : 'eye-closed'} onIconClick={() => setShowCurrentPassword(!showCurrentPassword)} />
                    </div>
                    <div>
                      <label htmlFor="novaSenha" className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
                      <Input id="novaSenha" type={showNewPassword ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} icon={showNewPassword ? 'eye-open' : 'eye-closed'} onIconClick={() => setShowNewPassword(!showNewPassword)} />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                      <Button type="button" onClick={() => setActiveView('overview')} className="bg-slate-200 text-slate-700 hover:bg-slate-300">Cancelar</Button>
                      <Button type="submit" isLoading={isPasswordLoading}>Alterar Senha</Button>
                    </div>
                  </form>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}

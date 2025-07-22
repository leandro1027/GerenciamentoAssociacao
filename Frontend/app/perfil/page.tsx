'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

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


  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      await api.patch('/usuario/me/profile', { nome, email, telefone });
      toast.success('Perfil atualizado com sucesso!');
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsPasswordLoading(false);
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
                    Por favor, faça login para acessar seu perfil.
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-4 pt-4">
                    <Link 
                        href="/login" 
                        className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Ir para a página de Login
                    </Link>
                    <Link 
                        href="/" 
                        className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                    >
                        Voltar à Página Inicial
                    </Link>
                </div>
            </div>
        </main>
    );
  }

  return (
    <main className="bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900">Meu Perfil</h1>
            <p className="mt-2 text-lg text-slate-600">Gestão das suas informações pessoais e de segurança.</p>
        </header>

        <div className="space-y-10">
            {/* Formulário de Dados Pessoais */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Dados Pessoais</h2>
              <p className="text-sm text-slate-500 mb-6">Atualize as suas informações de contato.</p>
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
                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={isProfileLoading}>Salvar Alterações</Button>
                </div>
              </form>
            </div>

            {/* Formulário de Alteração de Senha */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Alterar Senha</h2>
              <p className="text-sm text-slate-500 mb-6">Para a sua segurança, recomendamos que use uma senha forte.</p>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="senhaAtual" className="block mb-2 text-sm font-medium text-gray-700">Senha Atual</label>
                  <Input 
                    id="senhaAtual" 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    value={senhaAtual} 
                    onChange={e => setSenhaAtual(e.target.value)} 
                    icon={showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    onIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                </div>
                <div>
                  <label htmlFor="novaSenha" className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
                  <Input 
                    id="novaSenha" 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={novaSenha} 
                    onChange={e => setNovaSenha(e.target.value)} 
                    icon={showNewPassword ? '👁️' : '👁️‍🗨️'}
                    onIconClick={() => setShowNewPassword(!showNewPassword)}
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={isPasswordLoading}>Alterar Senha</Button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </main>
  );
}

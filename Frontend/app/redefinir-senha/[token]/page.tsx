'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/services/api';
import toast from 'react-hot-toast';
import Input from '@/app/components/common/input';
import Button from '@/app/components/common/button';

export default function ResetPasswordPage() {
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { senha });
      toast.success('Senha redefinida com sucesso! Pode fazer o login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ocorreu um erro.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-center text-gray-800">
                Crie uma nova senha
            </h1>
            <p className="mt-2 text-center text-gray-600">
                A sua nova senha deve ter no mínimo 6 caracteres.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
            <Input 
              id="password"
              type={showPassword ? 'text' : 'password'} 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Digite a nova senha" 
              required 
              minLength={6} 
              icon={showPassword ? '👁️' : '👁️‍🗨️'}
              onIconClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <Button type="submit" isLoading={isLoading}>
            Salvar Nova Senha
          </Button>
        </form>
      </div>
    </main>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/services/api';
import toast from 'react-hot-toast';
import Input from '@/app/components/common/input';
import Button from '@/app/components/common/button';

export default function ResetPasswordPage() {
  const [senha, setSenha] = useState('');
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
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Insira a sua Nova Senha</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="Nova senha" 
            required 
            minLength={6} 
          />
          <Button type="submit" isLoading={isLoading}>Redefinir Senha</Button>
        </form>
      </div>
    </main>
  );
}

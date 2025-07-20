'use client';

import { useState, FormEvent } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
    } catch (error) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Redefinir Senha</h1>
        <p className="text-center text-gray-600">Insira o seu e-mail e enviaremos um link para redefinir a sua senha.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O seu e-mail" required />
          <Button type="submit" isLoading={isLoading}>Enviar Link</Button>
        </form>
        <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Voltar para o Login</Link>
        </div>
      </div>
    </main>
  );
}

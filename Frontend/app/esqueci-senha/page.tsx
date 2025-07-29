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
    <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z"></path>
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-center text-slate-900">
            Esqueceu a sua senha?
          </h1>
          <p className="mt-2 text-center text-slate-600">
            Sem problemas. Insira o seu e-mail e enviaremos um link para redefinir a sua senha.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Endereço de e-mail</label>
            <Input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@exemplo.com" 
              required 
            />
          </div>
          <Button type="submit" isLoading={isLoading}>
            Enviar Link de Recuperação
          </Button>
        </form>
        <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-amber-600 hover:underline">
                Voltar para o Login
            </Link>
        </div>
      </div>
    </main>
  );
}

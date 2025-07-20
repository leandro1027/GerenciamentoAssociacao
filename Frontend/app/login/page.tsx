'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // O redirecionamento em caso de sucesso é tratado pelo AuthContext
    } catch (err: any) {
      toast.error(err.message || 'Falha no login. Verifique as suas credenciais.');
      setIsLoading(false); // Reativa o botão apenas em caso de erro
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Acesse sua Conta</h1>
          <p className="mt-2 text-gray-600">Bem-vindo de volta!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Senha</label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={showPassword ? '👁️' : '👁️‍🗨️'}
              onIconClick={() => setShowPassword(!showPassword)}
            />
          </div>
          
          <div className="text-right text-sm">
            <Link href="/esqueci-senha" className="font-medium text-blue-600 hover:underline">
              Esqueceu a sua senha?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>Entrar</Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="font-medium text-blue-600 hover:underline">Registe-se</Link>
        </div>
      </div>
    </main>
  );
}

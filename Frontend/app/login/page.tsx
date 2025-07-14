'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // A senha não é usada na lógica, mas é bom tê-la no formulário
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      // O redirecionamento é tratado dentro da função de login no AuthContext
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique as suas credenciais.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Acessar sua Conta
          </h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo de volta!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        {error && (
          <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="font-medium text-blue-600 hover:underline">
            Registe-se
          </Link>
        </div>
      </div>
    </main>
  );
}

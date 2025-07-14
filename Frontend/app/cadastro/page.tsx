'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Usuario } from '../../types';

export default function CadastroPage() {
  const router = useRouter();

  // Estados para controlar os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Estado para a senha
  const [telefone, setTelefone] = useState('');

  // Estados para feedback ao usuário
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post<Usuario>('/usuario', {
        nome,
        email,
        senha, // Envia a senha para a API
        telefone,
      });

      setSuccess(`Usuário "${response.data.nome}" cadastrado com sucesso! Redirecionando...`);
      
      setTimeout(() => {
        router.push('/login'); // Redireciona para a página de login
      }, 2000);

    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Ocorreu um erro ao cadastrar.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Crie sua Conta
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-600">
              Nome Completo
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
          {/* Campo de Senha Adicionado */}
          <div>
            <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-600">
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-600">
              Telefone (Opcional)
            </label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(99) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          
          <Button type="submit" isLoading={isLoading}>
            Cadastrar
          </Button>
        </form>

        {success && (
          <div className="p-4 text-center text-green-800 bg-green-100 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}

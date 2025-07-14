// app/cadastro/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // 1. Importe o useRouter
import api from '../services/api';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Usuario } from '../../types';

export default function CadastroPage() {
  const router = useRouter(); // 2. Inicialize o router

  // Estados para controlar os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
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
        telefone,
      });

      setSuccess(`Usuário "${response.data.nome}" cadastrado com sucesso! Redirecionando...`);
      
      // 3. Redireciona o usuário após 2 segundos
      setTimeout(() => {
        // Supondo que você crie uma página de boas-vindas ou painel
        // Se não, pode ser router.push('/voluntario'); ou router.push('/');
        router.push('/'); 
      }, 2000);

    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Ocorreu um erro ao cadastrar.';
      setError(errorMessage);
      setIsLoading(false); // Garante que o botão seja reativado em caso de erro
    }
    // Não defina setIsLoading(false) aqui no 'finally' para o sucesso,
    // pois queremos que o botão permaneça desativado até o redirecionamento.
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

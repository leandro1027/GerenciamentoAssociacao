'use client';
import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, PawPrint } from 'lucide-react';
import Image from 'next/image';

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
      const errorMessage =
        err.response?.data?.message ||
        'Falha no login. Verifique as suas credenciais.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50 items-center">
      {/* Coluna da Imagem - Lado Esquerdo */}
      <div className="hidden lg:flex lg:w-1/2 relative self-stretch">
        <Image
          src="/NossosValores.png"
          alt="Nossos Valores - Conectamos animais que precisam de um lar com pessoas dispostas a ajudar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <PawPrint className="w-24 h-24 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Encontre seu novo amigo</h2>
            <p className="text-xl opacity-90">
              Conectamos animais que precisam de um lar com pessoas dispostas a
              ajudar
            </p>
          </div>
        </div>
      </div>

      {/* Coluna do Formulário - Lado Direito */}
      <div className="w-full lg:w-1/2 flex justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Logótipo da Associação"
                  width={60}
                  height={60}
                  priority
                  className="transition-transform duration-300"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Faça seu login</h2>
            <p className="mt-2 text-gray-600">
              Para divulgar ou adotar um animalzinho, você precisa ter um
              cadastro
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Sua senha"
                  icon={
                    showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )
                  }
                  onIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="text-right text-sm">
                <Link
                  href="/esqueci-senha"
                  className="font-medium text-amber-600 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Entrar
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <div className="text-sm text-gray-600">
                <span>Não sou cadastrado</span>
                {' • '}
                <Link
                  href="/cadastro"
                  className="font-medium text-amber-600 hover:underline"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

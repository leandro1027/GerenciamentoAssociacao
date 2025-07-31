'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/services/api';
import toast from 'react-hot-toast';
import Input from '@/app/components/common/input';
import Button from '@/app/components/common/button';
import Link from 'next/link';

// --- COMPONENTE: Indicador de Força da Senha ---
const PasswordStrengthIndicator = ({ password = '' }: { password?: string }) => {
    const checks = [
        { label: '8+ caracteres', regex: /.{8,}/ },
        { label: 'Maiúscula', regex: /(?=.*[A-Z])/ },
        { label: 'Minúscula', regex: /(?=.*[a-z])/ },
        { label: 'Número', regex: /(?=.*\d)/ },
        { label: 'Símbolo', regex: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/ },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {checks.map((check, index) => {
                const isValid = check.regex.test(password);
                return (
                    <div key={index} className={`flex items-center text-xs transition-colors ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isValid ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                            )}
                        </svg>
                        <span>{check.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default function ResetPasswordPage() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { senha });
      toast.success('Senha redefinida com sucesso! Pode fazer o login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ocorreu um erro. O seu link pode ter expirado.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Coluna do Formulário */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Crie uma nova senha
            </h1>
            <p className="text-gray-600 mb-6">
              Escolha uma senha forte para proteger a sua conta.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">Nova Senha</label>
                <Input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
                  placeholder="Digite a nova senha" 
                  required 
                  icon={showPassword ? '👁️' : '👁️‍🗨️'}
                  onIconClick={() => setShowPassword(!showPassword)}
                />
                {senha.length > 0 && <PasswordStrengthIndicator password={senha} />}
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirmar Nova Senha</label>
                <Input 
                  id="confirm-password"
                  type="password" 
                  value={confirmarSenha} 
                  onChange={(e) => setConfirmarSenha(e.target.value)} 
                  placeholder="Confirme a nova senha" 
                  required 
                />
              </div>
              <Button type="submit" isLoading={isLoading} className="w-full">
                Salvar Nova Senha
              </Button>
            </form>
             <p className="text-center text-sm text-gray-600 mt-6">
                <Link href="/login" className="font-semibold text-amber-700 hover:underline">
                    Voltar para o Login
                </Link>
            </p>
          </div>
        </div>

        {/* Coluna da Imagem */}
        <div className="hidden md:block relative">
            <img 
                src="/SobreNossaCausa.avif"
                alt="Cão feliz"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-8 flex flex-col justify-end">
                <h2 className="text-3xl font-bold text-white leading-tight">Um Novo Começo Seguro.</h2>
                <p className="text-amber-100 mt-2">Garanta a segurança da sua conta para continuar a sua jornada connosco.</p>
            </div>
        </div>

      </div>
    </main>
  );
}

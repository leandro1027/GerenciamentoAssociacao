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
  const [isSubmitted, setIsSubmitted] = useState(false); // Novo estado para controlar a UI após o envio

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // A API deve retornar uma mensagem de sucesso genérica para não revelar se um e-mail existe ou não no sistema.
      await api.post('/auth/forgot-password', { email });
      toast.success("Se o e-mail estiver registado, receberá um link de recuperação.");
      setIsSubmitted(true); // Altera para o estado de sucesso
    } catch (error: any) {
      // Exibe uma mensagem genérica para não confirmar a existência de um e-mail.
      const errorMessage = "Se o e-mail estiver registado, receberá um link de recuperação.";
      toast.error(errorMessage);
      // Mesmo em caso de "erro" (e-mail não encontrado), mostramos a tela de sucesso por segurança.
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Coluna do Formulário */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="w-full">
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Verifique o seu E-mail</h1>
                <p className="mt-2 text-gray-600">
                  Se uma conta associada a <span className="font-semibold">{email}</span> existir, enviámos um e-mail com um link para redefinir a sua senha. Por favor, verifique a sua caixa de entrada e a pasta de spam.
                </p>
                <div className="mt-6">
                    <Link href="/login" className="font-semibold text-amber-700 hover:underline">
                        Voltar para o Login
                    </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Recuperar Senha
                </h1>
                <p className="text-gray-600 mb-6">
                  Sem problemas. Insira o seu e-mail e enviaremos as instruções.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="sr-only">Endereço de e-mail</label>
                    <Input 
                      id="email"
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="email@exemplo.com" 
                      required 
                    />
                  </div>
                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Enviar Link de Recuperação
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Lembrou-se da senha?{' '}
                  <Link href="/login" className="font-semibold text-amber-700 hover:underline">
                    Faça login aqui
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Coluna da Imagem */}
        <div className="hidden md:block relative">
            <img 
                src="\SobreNossaCausa.avif"
                alt="Gato a olhar para a câmara"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-8 flex flex-col justify-end">
                <h2 className="text-3xl font-bold text-white leading-tight">Estamos aqui para ajudar.</h2>
                <p className="text-amber-100 mt-2">Recupere o acesso à sua conta para continuar a fazer a diferença na vida dos nossos animais.</p>
            </div>
        </div>

      </div>
    </main>
  );
}

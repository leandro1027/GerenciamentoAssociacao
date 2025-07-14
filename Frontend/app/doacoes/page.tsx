// app/doacoes/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Input from '../components/common/input';
import { useAuth } from '../../context/AuthContext'; // Importa o hook de autenticação
import Link from 'next/link';
import QRCode from 'qrcode';

export default function DoacoesPage() {
  const { user, isAuthenticated } = useAuth(); // Pega o utilizador logado

  // Estados do formulário
  const [valor, setValor] = useState<string>('');

  // Estados de controlo do fluxo
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gera o QR Code
  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    if (!valor) {
      setSubmitError('Por favor, insira um valor.');
      return;
    }
    
    const pixKey = `00020126360014BR.GOV.BCB.PIX0114+5542999999999520400005303986540${parseFloat(valor).toFixed(2).replace('.', '')}5802BR5913NOME_DA_ASSOC6009SAO_PAULO62070503***6304ABCD`;

    QRCode.toDataURL(pixKey)
      .then(url => {
        setQrCodeDataURL(url);
        setSubmitError(null);
      })
      .catch(err => {
        setSubmitError('Erro ao gerar o QR Code.');
        console.error(err);
      });
  };

  // Confirma a doação e envia para o back-end
  const handleConfirmDonation = async () => {
    if (!user) {
        setSubmitError('Utilizador não autenticado.');
        return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      await api.post('/doacao', {
        usuarioId: user.id, // Usa o ID do utilizador logado
        valor: parseFloat(valor),
        tipo: 'pix',
      });

      setSuccess('Doação confirmada com sucesso! Muito obrigado pelo seu apoio.');
      setValor('');
      setQrCodeDataURL(null);
    } catch (err: any) { // <-- O ERRO ESTAVA AQUI
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao confirmar a doação.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se o utilizador não estiver logado, mostra uma mensagem
  if (!isAuthenticated) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Necessário</h2>
                <p className="text-gray-600 mb-6">Você precisa de estar logado para fazer uma doação.</p>
                <Link href="/login" className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Ir para a página de Login
                </Link>
            </div>
        </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
            Faça uma Doação
            </h1>
            <p className="mt-2 text-gray-600">
            A sua contribuição ajuda a manter a nossa causa viva.
            </p>
        </div>
        
        {!qrCodeDataURL ? (
          // Formulário para gerar o QR Code
          <form onSubmit={handleGenerateQRCode} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Doando como:
              </label>
              <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">{user?.nome}</p>
              </div>
            </div>
            <div>
              <label htmlFor="valor" className="block mb-2 text-sm font-medium text-gray-600">
                Valor da Doação (R$)
              </label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Gerar QR Code PIX</Button>
          </form>
        ) : (
          // Ecrã de confirmação com QR Code
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Escaneie para pagar</h2>
            <img src={qrCodeDataURL} alt="QR Code PIX" className="w-64 h-64 border-4 border-gray-300 rounded-lg" />
            <p className="text-lg font-bold">Valor: R$ {parseFloat(valor).toFixed(2)}</p>
            <Button onClick={handleConfirmDonation} isLoading={isLoading}>
              Já paguei, Confirmar Doação
            </Button>
            <button onClick={() => setQrCodeDataURL(null)} className="text-sm text-gray-500 hover:underline">
              Cancelar e voltar
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 mt-4 text-center text-green-800 bg-green-100 rounded-lg">
            {success}
          </div>
        )}
        {submitError && (
          <div className="p-4 mt-4 text-center text-red-800 bg-red-100 rounded-lg">
            {submitError}
          </div>
        )}

        <div className="text-center mt-4">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
                Voltar à Página Inicial
            </Link>
        </div>
      </div>
    </main>
  );
}

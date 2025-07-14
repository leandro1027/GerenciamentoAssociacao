'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Input from '../components/common/input';
import { Usuario } from '../../types';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function DoacoesPage() {
  // Estados do formulário
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [valor, setValor] = useState<string>('');

  // Estados de controlo do fluxo
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Busca os utilizadores ao carregar a página
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get<Usuario[]>('/usuario');
        setUsuarios(response.data);
      } catch (err) {
        setFetchError('Não foi possível carregar os utilizadores. Tente novamente mais tarde.');
      }
    };
    fetchUsuarios();
  }, []);

  // Gera o QR Code
  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUserId || !valor) {
      setSubmitError('Por favor, selecione um utilizador e insira um valor.');
      return;
    }
    
    // Simula uma chave PIX "copia e cola"
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
    setIsLoading(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      await api.post('/doacao', {
        usuarioId: parseInt(selectedUserId, 10),
        valor: parseFloat(valor),
        tipo: 'pix',
      });

      setSuccess('Doação confirmada com sucesso! Muito obrigado pelo seu apoio.');
      // Limpa o estado
      setSelectedUserId('');
      setValor('');
      setQrCodeDataURL(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao confirmar a doação.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
              <label htmlFor="usuario" className="block mb-2 text-sm font-medium text-gray-600">
                Selecione o seu nome
              </label>
              <select
                id="usuario"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              >
                <option value="" disabled>-- Escolha um utilizador --</option>
                {usuarios.map((user) => (
                  <option key={user.id} value={user.id}>{user.nome}</option>
                ))}
              </select>
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

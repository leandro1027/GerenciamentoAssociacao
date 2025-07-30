'use client';

import { useState, FormEvent, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Input from '../components/common/input';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Icon = ({ path, className = "w-12 h-12" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export default function DoacoesPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [valor, setValor] = useState<string>('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Após a verificação inicial de autenticação, se o utilizador não estiver logado, redireciona.
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Você precisa estar logado para fazer uma doação.');
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    const numericValue = parseFloat(valor);
    if (!valor || isNaN(numericValue) || numericValue <= 0) {
      toast.error('Por favor, insira um valor válido.');
      return;
    }

    const generatedPixKey = `00020126360014BR.GOV.BCB.PIX0114+5542999999999520400005303986540${numericValue.toFixed(2).replace('.', '')}5802BR5913NOME_DA_ASSOC6009SAO_PAULO62070503***6304ABCD`;
    setPixKey(generatedPixKey);

    QRCode.toDataURL(generatedPixKey)
      .then(url => {
        setQrCodeDataURL(url);
      })
      .catch(err => {
        toast.error('Erro ao gerar o QR Code.');
        console.error(err);
      });
  };

  const handleConfirmDonation = async () => {
    if (!user) {
      toast.error('Utilizador não autenticado.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/doacao', {
        usuarioId: user.id,
        valor: parseFloat(valor),
        tipo: 'pix',
      });

      toast.success('Doação confirmada com sucesso! Muito obrigado pelo seu apoio.');
      setValor('');
      setQrCodeDataURL(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao confirmar a doação.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave PIX copiada!');
  };

  // Mostra um ecrã de carregamento enquanto verifica a autenticação ou redireciona
  if (isAuthLoading || !isAuthenticated) {
    return (
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <p>A carregar...</p>
      </main>
    );
  }

  return (
    <main className="flex-grow min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 py-10 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:block">
          <img src="https://casadurvalpaiva.org.br/wp-content/uploads/2024/06/Por-que-doar.png" alt="Ilustração de doação" className="rounded-2xl shadow-2xl" />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Contribua com Amor</h1>
            <p className="text-gray-600">Sua doação nos ajuda a continuar impactando vidas.</p>
          </div>

          {!qrCodeDataURL ? (
            <form onSubmit={handleGenerateQRCode} className="space-y-6 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doando como:</label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-800">{user?.nome}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor da Doação (R$)</label>
                <div className="flex gap-2 mb-3">
                  {['10', '20', '50'].map(v => (
                    <button type="button" key={v} onClick={() => setValor(v)} className="px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition">
                      R$ {v}
                    </button>
                  ))}
                </div>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="1.00"
                  placeholder="Ou digite outro valor"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">
                Gerar QR Code PIX
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-4 pt-6">
              <h2 className="text-xl font-semibold text-gray-700">Escaneie para doar</h2>
              <img src={qrCodeDataURL} alt="QR Code PIX" className="w-64 h-64 border-4 border-gray-300 rounded-lg shadow-lg" />
              <p className="text-xl font-bold text-gray-800">R$ {parseFloat(valor).toFixed(2)}</p>
              <Button onClick={copyToClipboard} variant="outline" className="w-full">
                Copiar Chave PIX
              </Button>
              <Button onClick={handleConfirmDonation} isLoading={isLoading} className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500">
                Confirmar Doação
              </Button>
              <button onClick={() => setQrCodeDataURL(null)} className="text-sm text-gray-500 hover:underline mt-2">
                Cancelar e voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

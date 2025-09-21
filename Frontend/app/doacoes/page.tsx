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
import { Heart, ClipboardCopy, CheckCircle } from 'lucide-react'; // Biblioteca de ícones: npm install lucide-react

// O componente de ícone que você já tinha. Ótimo para ícones personalizados!
const Icon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
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
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Você precisa estar logado para fazer uma doação.');
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    const numericValue = parseFloat(valor);
    if (!valor || isNaN(numericValue) || numericValue <= 0) {
      toast.error('Por favor, insira um valor válido para a doação.');
      return;
    }

    const pixKeyCpf = "14112379943"; 
    const merchantName = "LEANDRO BALABAN"; 
    const merchantCity = "UNIAO DA VITORIA"; // 
    const txid = "***"; // ID da transação, pode ser estático para doações

    const formatField = (id: string, value: string) => {
        const length = value.length.toString().padStart(2, '0');
        return `${id}${length}${value}`;
    };

    // Montagem da chave PIX estática (BR Code)
    let payload = '000201'; // Payload Format Indicator

    // Merchant Account Information (ID 26) - Chave PIX
    const merchantAccountGui = '0014BR.GOV.BCB.PIX';
    const merchantAccountKey = formatField('01', pixKeyCpf);
    payload += formatField('26', merchantAccountGui + merchantAccountKey);

    payload += '52040000'; // Merchant Category Code
    payload += '5303986'; // Transaction Currency (BRL)

    // Transaction Amount (ID 54)
    payload += formatField('54', numericValue.toFixed(2));

    payload += '5802BR'; // Country Code
    payload += formatField('59', merchantName.substring(0, 25)); // Merchant Name (limitado a 25 caracteres)
    payload += formatField('60', merchantCity.substring(0, 15)); // Merchant City (limitado a 15 caracteres)

    // Additional Data Field (TXID) (ID 62)
    payload += formatField('62', formatField('05', txid));
    
    payload += '6304'; // CRC16 Prefix

    // Lógica de cálculo do CRC16 (padrão do PIX)
    const crc16 = (data: string) => {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
        return ('0000' + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
    };
    
    const generatedPixKey = payload + crc16(payload);
    setPixKey(generatedPixKey);

    QRCode.toDataURL(generatedPixKey, { width: 300, margin: 2 })
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
      toast.error('Usuário não autenticado.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/doacao', {
        usuarioId: user.id,
        valor: parseFloat(valor),
        tipo: 'pix',
      });
      toast.success('Doação registrada! Muito obrigado pelo seu apoio incondicional.');
      setValor('');
      setQrCodeDataURL(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar a doação.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave PIX copiada para a área de transferência!');
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 animate-pulse">Carregando informações...</p>
      </main>
    );
  }

  return (
    <main className="flex-grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Coluna da Imagem e Impacto */}
        <div className="space-y-8">
          <div className="relative">
            <img 
              src="\SobreNossaCausa.avif" 
              alt="Cachorro feliz sendo adotado" 
              className="rounded-3xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
            />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="text-amber-500" />
              Veja o impacto da sua ajuda
            </h3>
            <div className="space-y-3 text-slate-600">
                <p>Com <strong className="text-amber-700">R$ 25</strong>, você garante um vermífugo essencial.</p>
                <p>Com <strong className="text-amber-700">R$ 50</strong>, você ajuda a custear uma vacina importante.</p>
                <p>Com <strong className="text-amber-700">R$ 100</strong>, você alimenta um animal resgatado por um mês inteiro.</p>
            </div>
          </div>
        </div>

        {/* Coluna do Formulário de Doação */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-800">Faça a diferença hoje</h1>
            <p className="text-slate-600 max-w-md mx-auto">Cada real doado se transforma em ração, vacinas e um lar seguro para nossos amigos de quatro patas.</p>
          </div>

          {!qrCodeDataURL ? (
            <form onSubmit={handleGenerateQRCode} className="space-y-6 pt-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Você está doando como:</label>
                <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-800">{user?.nome}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-slate-700 mb-2">Escolha ou digite o valor (R$)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {['25', '50', '100'].map(v => (
                    <button type="button" key={v} onClick={() => setValor(v)} className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${valor === v ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                      R$ {v}
                    </button>
                  ))}
                </div>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="1.00"
                  placeholder="Outro valor"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full !py-3 text-base bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">
                Gerar QR Code para PIX
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-4 pt-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Quase lá!</h2>
              <p className="text-slate-600">1. Abra o app do seu banco e pague com o QR Code. <br/> 2. Depois, confirme sua doação abaixo.</p>
              <img src={qrCodeDataURL} alt="QR Code PIX" className="w-60 h-60 border-4 border-slate-300 rounded-lg shadow-lg" />
              <p className="text-3xl font-bold text-slate-800">R$ {parseFloat(valor).toFixed(2)}</p>
              
              <Button onClick={copyToClipboard} variant="outline" className="w-full flex items-center justify-center gap-2">
                <ClipboardCopy size={18} /> Copiar Chave PIX
              </Button>
              <Button onClick={handleConfirmDonation} isLoading={isLoading} className="w-full !py-3 text-base bg-green-600 hover:bg-green-700 focus:ring-green-500 flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Já fiz o pagamento!
              </Button>

              <button onClick={() => setQrCodeDataURL(null)} className="text-sm text-slate-500 hover:underline pt-2">
                Escolher outro valor
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


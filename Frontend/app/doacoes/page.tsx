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
import { Heart, ClipboardCopy, CheckCircle } from 'lucide-react';

export default function DoacoesPage() {
  const { user, isAuthenticated } = useAuth(); // Não precisamos mais do isAuthLoading
  const router = useRouter();
  const [valor, setValor] = useState<string>('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // O useEffect que forçava o login foi removido.

  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    const numericValue = parseFloat(valor);
    if (!valor || isNaN(numericValue) || numericValue <= 0) {
      toast.error('Por favor, insira um valor válido para a doação.');
      return;
    }

    // Lógica para gerar o PIX (usando as variáveis de ambiente)
    const pixKeyCpf = process.env.NEXT_PUBLIC_PIX_KEY;
    const merchantName = process.env.NEXT_PUBLIC_PIX_MERCHANT_NAME;
    const merchantCity = process.env.NEXT_PUBLIC_PIX_MERCHANT_CITY;

    if (!pixKeyCpf || !merchantName || !merchantCity) {
        toast.error('A configuração do PIX está incompleta. Por favor, contacte o suporte.');
        console.error("Erro: Variáveis de ambiente do PIX não foram encontradas.");
        return;
    }

    const txid = "***";

    const formatField = (id: string, value: string) => {
        const length = value.length.toString().padStart(2, '0');
        return `${id}${length}${value}`;
    };

    const ID_PAYLOAD_FORMAT_INDICATOR = '00';
    const ID_MERCHANT_ACCOUNT_INFORMATION = '26';
    const ID_MERCHANT_ACCOUNT_INFORMATION_GUI = '00';
    const ID_MERCHANT_ACCOUNT_INFORMATION_KEY = '01';
    const ID_MERCHANT_CATEGORY_CODE = '52';
    const ID_TRANSACTION_CURRENCY = '53';
    const ID_TRANSACTION_AMOUNT = '54';
    const ID_COUNTRY_CODE = '58';
    const ID_MERCHANT_NAME = '59';
    const ID_MERCHANT_CITY = '60';
    const ID_ADDITIONAL_DATA_FIELD_TEMPLATE = '62';
    const ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID = '05';
    const ID_CRC16 = '63';

    const merchantAccountInfoValue = 
        formatField(ID_MERCHANT_ACCOUNT_INFORMATION_GUI, 'BR.GOV.BCB.PIX') +
        formatField(ID_MERCHANT_ACCOUNT_INFORMATION_KEY, pixKeyCpf);

    const additionalDataValue = formatField(ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID, txid);

    let payload = [
        formatField(ID_PAYLOAD_FORMAT_INDICATOR, '01'),
        formatField(ID_MERCHANT_ACCOUNT_INFORMATION, merchantAccountInfoValue),
        formatField(ID_MERCHANT_CATEGORY_CODE, '0000'),
        formatField(ID_TRANSACTION_CURRENCY, '986'),
        formatField(ID_TRANSACTION_AMOUNT, numericValue.toFixed(2)),
        formatField(ID_COUNTRY_CODE, 'BR'),
        formatField(ID_MERCHANT_NAME, merchantName),
        formatField(ID_MERCHANT_CITY, merchantCity),
        formatField(ID_ADDITIONAL_DATA_FIELD_TEMPLATE, additionalDataValue),
        ID_CRC16 + '04'
    ].join('');
    
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
    setIsLoading(true);
    try {
      // Cria o objeto de doação base
      const donationData: { valor: number; tipo: string; usuarioId?: number } = {
        valor: parseFloat(valor),
        tipo: 'pix',
      };

      // Se o usuário estiver logado, adiciona o ID dele à doação
      if (isAuthenticated && user) {
        donationData.usuarioId = user.id;
      }

      await api.post('/doacao', donationData);
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

  return (
    <main className="flex-grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-8">
          <div className="relative">
            <img 
              src="/SobreNossaCausa.avif" 
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

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-800">Faça a diferença hoje</h1>
            <p className="text-slate-600 max-w-md mx-auto">Cada real doado se transforma em ração, vacinas e um lar seguro para nossos amigos de quatro patas.</p>
          </div>

          {!qrCodeDataURL ? (
            <form onSubmit={handleGenerateQRCode} className="space-y-6 pt-8">
              {/* --- Seção de Identificação Condicional --- */}
              {isAuthenticated && user && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Você está doando como:</label>
                  <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg">
                    <p className="font-semibold text-slate-800">{user.nome}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
              )}

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


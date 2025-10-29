'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Input from '../components/common/input';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Heart, ClipboardCopy, CheckCircle, ArrowLeft, Shield, Zap, Users, PawPrint, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoacoesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [valor, setValor] = useState<string>('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comprovante, setComprovante] = useState<File | null>(null);

  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    const numericValue = parseFloat(valor);
    if (!valor || isNaN(numericValue) || numericValue <= 0) {
      toast.error('Por favor, insira um valor válido para a doação.');
      return;
    }

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

    QRCode.toDataURL(generatedPixKey, { width: 280, margin: 1 })
      .then(url => {
        setQrCodeDataURL(url);
      })
      .catch(err => {
        toast.error('Erro ao gerar o QR Code.');
        console.error(err);
      });
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setComprovante(event.target.files[0]);
    }
  };

  const handleConfirmDonation = async () => {
    if (!comprovante) {
      toast.error('Por favor, anexe o comprovante de pagamento para continuar.');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('valor', valor);
    formData.append('tipo', 'pix');
    formData.append('comprovante', comprovante);

    if (isAuthenticated && user) {
      formData.append('usuarioId', String(user.id));
    }

    try {
      await api.post('/doacao', formData);
      toast.success('Doação enviada para análise! Muito obrigado pelo seu apoio.');
      setValor('');
      setQrCodeDataURL(null);
      setComprovante(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar a doação.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success('Chave PIX copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const impactCards = [
    { icon: <PawPrint className="w-5 h-5" />, amount: "R$ 25", title: "Vermifugação", description: "Protege um animal contra parasitas" },
    { icon: <Shield className="w-5 h-5" />, amount: "R$ 50", title: "Vacinação", description: "Custea uma vacina essencial" },
    { icon: <Heart className="w-5 h-5" />, amount: "R$ 100", title: "Alimentação", description: "Alimenta um animal por um mês" },
    { icon: <Users className="w-5 h-5" />, amount: "R$ 200", title: "Castração", description: "Ajuda no custo de cirurgia" }
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Seção Esquerda - Informações */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <img 
                src="/SobreNossaCausa.avif" 
                alt="Cachorro feliz sendo cuidado" 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {impactCards.map((card, index) => (
                <motion.div
                  key={card.amount}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      {card.icon}
                    </div>
                    <span className="text-lg font-semibold text-gray-800">{card.amount}</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Seção Direita - Doação */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="bg-amber-600 p-6 text-white">
              <h2 className="text-2xl font-semibold mb-1">Faça uma Doação</h2>
              <p className="text-amber-100">Sua contribuição faz a diferença</p>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {!qrCodeDataURL ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleGenerateQRCode}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Valor da doação
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {['25', '50', '100', '200'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setValor(v)}
                            className={`p-3 rounded-lg font-medium transition-colors border ${
                              valor === v 
                                ? 'bg-amber-600 text-white border-amber-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                            }`}
                          >
                            R$ {v}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">R$</span>
                        </div>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="1.00"
                          placeholder="0,00"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          required
                          className="pl-10 py-3 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full py-3 font-medium bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Gerar QR Code PIX
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                      <Shield className="w-4 h-4" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="qrcode"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Pagamento via PIX</h3>
                      <p className="text-gray-600 text-sm">Escaneie o QR Code ou copie a chave</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                      <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
                      <p className="text-2xl font-semibold text-gray-800">R$ {parseFloat(valor).toFixed(2)}</p>
                    </div>

                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <img src={qrCodeDataURL} alt="QR Code PIX" className="w-56 h-56" />
                      </div>
                    </div>

                    {/* Upload do comprovante */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label htmlFor="comprovante-upload" className="block text-sm font-medium text-gray-700 mb-2">
                        Comprovante de pagamento
                      </label>
                      <input
                        id="comprovante-upload"
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                      />
                      {comprovante && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ {comprovante.name}
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-3">
                      <Button 
                        onClick={copyToClipboard}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                      >
                        <ClipboardCopy size={16} />
                        {copied ? 'Copiado!' : 'Copiar Chave PIX'}
                      </Button>

                      <Button 
                        onClick={handleConfirmDonation} 
                        isLoading={isLoading}
                        disabled={!comprovante || isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Confirmar Doação
                      </Button>
                    </div>

                    <button 
                      onClick={() => setQrCodeDataURL(null)}
                      className="w-full text-center text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={14} />
                      Alterar valor
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Informações de Transparência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Transparência e Confiança</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-medium text-gray-700 mb-1">100% dos recursos</h4>
              <p>Direcionados aos animais</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-medium text-gray-700 mb-1">Relatórios mensais</h4>
              <p>Prestação de contas transparente</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-medium text-gray-700 mb-1">CNPJ regular</h4>
              <p>Associação legalmente constituída</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
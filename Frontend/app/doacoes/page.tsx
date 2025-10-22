'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import api from '../services/api';
import Button from '../components/common/button';
import Input from '../components/common/input';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
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

  //armazenar o arquivo do comprovante selecionado
  const [comprovante, setComprovante] = useState<File | null>(null);

  const handleGenerateQRCode = (event: FormEvent) => {
    event.preventDefault();
    const numericValue = parseFloat(valor);
    if (!valor || isNaN(numericValue) || numericValue <= 0) {
      toast.error('Por favor, insira um valor válido para a doação.');
      return;
    }

    // Lógica para gerar o PIX (sem alterações)
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
  
  //lidar com a seleção de arquivo
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setComprovante(event.target.files[0]);
    }
  };


  //enviar a doação com o comprovante
  const handleConfirmDonation = async () => {
    if (!comprovante) {
      toast.error('Por favor, anexe o comprovante de pagamento para continuar.');
      return;
    }

    setIsLoading(true);
    
    // FormData para enviar dados e arquivo juntos
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
    { icon: <PawPrint className="w-6 h-6" />, amount: "R$ 25", title: "Vermifugação", description: "Protege um animal contra parasitas" },
    { icon: <Shield className="w-6 h-6" />, amount: "R$ 50", title: "Vacinação", description: "Custea uma vacina essencial para a saúde" },
    { icon: <Heart className="w-6 h-6" />, amount: "R$ 100", title: "Alimentação Mensal", description: "Alimenta um animal resgatado por um mês" },
    { icon: <Users className="w-6 h-6" />, amount: "R$ 200", title: "Castração", description: "Ajuda no custo de uma cirurgia de castração" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Seção Esquerda */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
             <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl transform group-hover:scale-105 transition-transform duration-500"></div>
               <img 
                 src="/SobreNossaCausa.avif" 
                 alt="Cachorro feliz sendo cuidado" 
                 className="rounded-3xl shadow-2xl w-full h-auto object-cover aspect-[4/3] transform group-hover:scale-[1.02] transition-transform duration-500"
               />
             </div>
             <div className="grid sm:grid-cols-2 gap-4">
               {impactCards.map((card, index) => (
                 <motion.div
                   key={card.amount}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   whileHover={{ scale: 1.05, y: -5 }}
                   className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 group"
                 >
                   <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 bg-amber-100 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                       {card.icon}
                     </div>
                     <span className="text-2xl font-bold text-amber-700">{card.amount}</span>
                   </div>
                   <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
                   <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
                 </motion.div>
               ))}
             </div>
          </motion.div>

          {/* Seção Direita - Doação */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Doe Agora</h2>
              <p className="text-amber-100 opacity-90">Transforme vidas com um gesto simples</p>
            </div>

            <div className="p-8">
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
                   {isAuthenticated && user && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                    >
                    </motion.div>
                   )}
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-4">
                       Escolha o valor da sua doação
                     </label>
                     <div className="grid grid-cols-2 gap-3 mb-4">
                       {['25', '50', '100', '200'].map(v => (
                         <motion.button
                           key={v}
                           type="button"
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setValor(v)}
                           className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                             valor === v 
                               ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-transparent' 
                               : 'bg-white text-gray-700 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                           }`}
                         >
                           R$ {v}
                         </motion.button>
                       ))}
                     </div>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <span className="text-gray-500 font-semibold">R$</span>
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
                         className="pl-12 text-lg font-semibold py-4 border-2 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                       />
                     </div>
                   </div>
                   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                     <Button 
                       type="submit" 
                       className="w-full !py-4 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
                     >
                       <Zap className="w-5 h-5 mr-2" />
                       Gerar QR Code PIX
                     </Button>
                   </motion.div>
                   <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
                     <Shield className="w-4 h-4" />
                     <span>Pagamento 100% seguro via PIX</span>
                   </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="qrcode"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center space-y-6 text-center"
                  >
                    <div className="text-center mb-2">
                       <h3 className="text-2xl font-bold text-gray-800 mb-2">Pagamento via PIX</h3>
                       <p className="text-gray-600">Após o pagamento, anexe o comprovante abaixo.</p>
                     </div>
                     <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                       <p className="text-sm text-gray-600 mb-1">Valor da doação</p>
                       <p className="text-4xl font-bold text-amber-700">R$ {parseFloat(valor).toFixed(2)}</p>
                     </div>
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ type: "spring", stiffness: 200 }}
                       className="p-4 bg-white rounded-2xl shadow-lg border-2 border-amber-100"
                     >
                       <img src={qrCodeDataURL} alt="QR Code PIX" className="w-64 h-64" />
                     </motion.div>

                    {/*Input para upload do comprovante */}
                    <div className="w-full bg-amber-50 rounded-xl p-4 border-2 border-dashed border-amber-300 text-center">
                        <UploadCloud className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                        <label htmlFor="comprovante-upload" className="block text-sm font-semibold text-amber-800 mb-2">
                          Anexe seu Comprovante
                        </label>
                        <input
                          id="comprovante-upload"
                          type="file"
                          accept="image/png, image/jpeg, application/pdf"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500
                                    file:mx-auto file:cursor-pointer
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-amber-100 file:text-amber-700
                                    hover:file:bg-amber-200"
                        />
                        {comprovante && (
                            <p className="text-xs text-green-700 mt-2 font-semibold">
                              Arquivo selecionado: {comprovante.name}
                            </p>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="w-full space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={copyToClipboard}
                          variant="outline"
                          className="w-full !py-3 border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 flex items-center justify-center gap-2"
                        >
                          <ClipboardCopy size={18} />
                          {copied ? 'Copiado!' : 'Copiar Chave PIX'}
                        </Button>
                      </motion.div>

                      {/*para confirmar e enviar o comprovante */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={handleConfirmDonation} 
                          isLoading={isLoading}
                          disabled={!comprovante || isLoading} // Desabilitado se não houver comprovante
                          className="w-full !py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={20} />
                          Enviar Comprovante
                        </Button>
                      </motion.div>
                    </div>

                    {/* Voltar */}
                    <motion.button 
                      onClick={() => setQrCodeDataURL(null)}
                      className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2 transition-colors"
                      whileHover={{ x: -5 }}
                    >
                      <ArrowLeft size={16} />
                      Alterar valor
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer Informativo ) */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="text-center mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-100"
         >
           <h3 className="text-2xl font-bold text-gray-800 mb-4">Transparência Total</h3>
           <div className="grid md:grid-cols-3 gap-6 text-gray-600 max-w-4xl mx-auto">
             <div>
               <h4 className="font-semibold text-amber-700 mb-2">100% dos recursos</h4>
               <p className="text-sm">São direcionados para o cuidado dos animais</p>
             </div>
             <div>
               <h4 className="font-semibold text-amber-700 mb-2">Relatórios mensais</h4>
               <p className="text-sm">Prestação de contas transparente</p>
             </div>
             <div>
               <h4 className="font-semibold text-amber-700 mb-2">CNPJ regular</h4>
               <p className="text-sm">Associação legalmente constituída</p>
             </div>
           </div>
         </motion.div>
      </div>
    </main>
  );
}
'use client';

import { useState, FormEvent, ChangeEvent, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, MapPin, Heart, PawPrint, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Componente de Botão de Rádio com novo estilo
const RadioPill = ({ label, name, value, checked, onChange, icon }: { label: string, name: string, value: string, checked: boolean, onChange: (value: string) => void, icon?: React.ReactNode }) => (
  <motion.label 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`cursor-pointer px-6 py-4 rounded-2xl text-base font-semibold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
      checked 
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg' 
        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="sr-only"
    />
    {icon}
    {label}
  </motion.label>
);

// Componente de Card Informativo
const InfoCard = ({ icon, title, description, type = 'info' }: { icon: React.ReactNode, title: string, description: string, type?: 'info' | 'warning' | 'success' }) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-green-50 border-green-200 text-green-700'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border-2 ${typeStyles[type]} flex items-start gap-3`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </motion.div>
  );
};

export default function DivulgarAnimalPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    localizacao: '',
    raca: '',
    descricao: '',
  });
  const [castrado, setCastrado] = useState('false');
  const [resgate, setResgate] = useState('false');
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Efeito para verificar autenticação e redirecionar se necessário
  useEffect(() => {
    if (isAuthenticated === false) {
        toast.error("Você precisa estar logado para divulgar um animal.");
        router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processFile = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 10MB.");
            return;
        }
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
        toast.success("Imagem carregada com sucesso!");
    } else {
        toast.error("Por favor, selecione um arquivo de imagem válido (PNG, JPG, GIF).");
        setFile(null);
        setPreviewImage(null);
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0] || null);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>, action: 'enter' | 'leave' | 'over') => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'enter' || action === 'over') {
        setIsDragging(true);
    } else if (action === 'leave') {
        setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, adicione uma foto do animal.');
      return;
    }
    setIsLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append('castrado', castrado);
    data.append('resgate', resgate);
    data.append('file', file);

    try {
      await api.post('/divulgacao', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(
        <div className="text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-semibold">Divulgação enviada com sucesso!</div>
          <div className="text-sm">Nossa equipe irá analisar em breve</div>
        </div>,
        { duration: 5000 }
      );
      router.push('/');
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar a sua divulgação. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto o status de autenticação é verificado, ou durante o redirecionamento,
  // exibimos um loader para evitar que o formulário apareça rapidamente.
  if (!isAuthenticated) {
    return (
        <main className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4 min-h-screen">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-gray-600 bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-lg font-semibold">Verificando sua autenticação...</p>
            </motion.div>
        </main>
    );
  }

  return (
    <main className="flex-grow bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Melhorado */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          

        
        </motion.header>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-amber-200">
            <div className="flex items-center gap-8">
              {[
                { number: 1, label: 'Detalhes', active: currentStep >= 1 },
                { number: 2, label: 'Foto', active: currentStep >= 2 },
                { number: 3, label: 'História', active: currentStep >= 3 }
              ].map((step, index) => (
                <div key={step.number} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-semibold transition-all duration-300 ${
                    step.active 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.active ? '✓' : step.number}
                  </div>
                  <span className={`font-semibold ${step.active ? 'text-amber-700' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-12 h-1 rounded-full ${step.active ? 'bg-amber-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl space-y-12 border border-amber-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Coluna da Esquerda: Detalhes */}
            <motion.div 
              className="space-y-8"
              onFocus={() => setCurrentStep(1)}
            >
              <fieldset>
                <legend className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <PawPrint className="w-6 h-6" />
                  Detalhes do Animal
                </legend>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="localizacao" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Localização onde foi encontrado
                    </label>
                    <Input 
                      name="localizacao" 
                      value={formData.localizacao} 
                      onChange={handleInputChange} 
                      placeholder="Ex: Porto União, Centro, Rua das Flores" 
                      required 
                      className="text-lg py-3 border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="raca" className="block text-sm font-semibold text-gray-800 mb-3">
                      Raça ou Aparência
                    </label>
                    <Input 
                      name="raca" 
                      value={formData.raca} 
                      onChange={handleInputChange} 
                      placeholder="Ex: Sem Raça Definida (SRD), Vira-lata Caramelo" 
                      required 
                      className="text-lg py-3 border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      O animal é castrado?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <RadioPill 
                        label="Sim" 
                        name="castrado" 
                        value="true" 
                        checked={castrado === 'true'} 
                        onChange={setCastrado}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      />
                      <RadioPill 
                        label="Não / Não sei" 
                        name="castrado" 
                        value="false" 
                        checked={castrado === 'false'} 
                        onChange={setCastrado}
                        icon={<AlertCircle className="w-4 h-4" />}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Situação do Animal
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <RadioPill 
                        label="Foi Resgatado" 
                        name="resgate" 
                        value="true" 
                        checked={resgate === 'true'} 
                        onChange={setResgate}
                        icon={<Heart className="w-4 h-4" />}
                      />
                      <RadioPill 
                        label="É Particular" 
                        name="resgate" 
                        value="false" 
                        checked={resgate === 'false'} 
                        onChange={setResgate}
                        icon={<Info className="w-4 h-4" />}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Cards Informativos */}
              <div className="space-y-3">
                <InfoCard
                  icon={<Info className="w-5 h-5" />}
                  title="Por que essas informações são importantes?"
                  description="Detalhes precisos ajudam a encontrar o lar ideal mais rapidamente."
                  type="info"
                />
              </div>
            </motion.div>

            {/* Coluna da Direita: Upload de Imagem */}
            <motion.div 
              className="space-y-8"
              onFocus={() => setCurrentStep(2)}
            >
              <fieldset>
                <legend className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  <Camera className="w-6 h-6" />
                  Foto do Animal
                </legend>
                
                <motion.div 
                  className={`relative flex flex-col justify-center items-center p-8 border-3 border-dashed rounded-3xl transition-all duration-300 h-full min-h-[350px] ${
                    isDragging 
                      ? 'border-amber-500 bg-amber-50 scale-[1.02] shadow-lg' 
                      : previewImage 
                        ? 'border-amber-200 bg-amber-25' 
                        : 'border-gray-200 hover:border-amber-300'
                  }`}
                  onDragEnter={(e) => handleDragEvents(e, 'enter')}
                  onDragLeave={(e) => handleDragEvents(e, 'leave')}
                  onDragOver={(e) => handleDragEvents(e, 'over')}
                  onDrop={handleDrop}
                  whileHover={{ scale: previewImage ? 1 : 1.02 }}
                >
                  <AnimatePresence mode="wait">
                    {previewImage ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-4 rounded-2xl overflow-hidden"
                      >
                        <img 
                          src={previewImage} 
                          alt="Pré-visualização" 
                          className="w-full h-full object-cover rounded-2xl" 
                        />
                        <motion.div 
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label htmlFor="file" className="cursor-pointer">
                            <Button 
                              variant="outline" 
                              className="bg-white/90 backdrop-blur-sm border-amber-300 text-amber-700 hover:bg-white"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Trocar Imagem
                            </Button>
                            <input id="file" name="file" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                          </label>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-6"
                      >
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        </motion.div>
                        <p className="text-lg text-gray-600 mb-2">
                          <label htmlFor="file-upload" className="font-semibold text-amber-700 hover:text-amber-600 cursor-pointer">
                            Clique para escolher uma foto
                          </label>
                        </p>
                        <p className="text-gray-500 mb-4">ou arraste e solte aqui</p>
                        <p className="text-sm text-gray-400">PNG, JPG, GIF até 10MB</p>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required/>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </fieldset>

              {/* Dicas para a Foto */}
              <InfoCard
                icon={<Camera className="w-5 h-5" />}
                title="Dica para uma boa foto"
                description="Use boa iluminação, mostre o animal inteiro e capture sua personalidade. Fotos claras aumentam as chances de adoção!"
                type="warning"
              />
            </motion.div>
          </div>

          {/* Seção de História */}
          <motion.fieldset 
            onFocus={() => setCurrentStep(3)}
            className="border-t border-amber-100 pt-8"
          >
            <legend className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6" />
              História e Comportamento
            </legend>
            
            <div className="space-y-4">
              <label htmlFor="descricao" className="block text-sm font-semibold text-gray-800">
                Conte a história do animal e descreva seu temperamento
              </label>
              <textarea 
                name="descricao" 
                value={formData.descricao} 
                onChange={handleInputChange} 
                rows={6} 
                className="block w-full rounded-2xl border-2 border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 placeholder:text-gray-400 text-gray-900 text-lg p-4 resize-none transition-colors"
                placeholder="Ex: Este é o Thor, foi encontrado na rua muito assustado mas é extremamente carinhoso. Adora brincar, convive bem com outros cães e crianças. Está à procura de um lar paciente que o ajude a ganhar confiança..."
              ></textarea>
              
              <InfoCard
                icon={<Info className="w-5 h-5" />}
                title="O que incluir na descrição"
                description="Temperamento, comportamento com outros animais e pessoas, hábitos, necessidades especiais e qualquer informação que ajude a encontrar a família perfeita."
                type="success"
              />
            </div>
          </motion.fieldset>

          {/* Botão de Envio */}
          <motion.div 
            className="pt-8 flex justify-end border-t border-amber-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-lg px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
              disabled={!file}
            >
              {isLoading ? (
                <>Enviando...</>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Enviar Divulgação para Análise
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Footer Informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200"
        >
          <p className="text-gray-600">
            <strong className="text-amber-700">Importante:</strong> Todas as divulgações passam por análise da nossa equipe para garantir a veracidade das informações e o bem-estar dos animais.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
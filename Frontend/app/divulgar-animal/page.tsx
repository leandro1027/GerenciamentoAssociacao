'use client';

import { useState, FormEvent, ChangeEvent, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Componente de Ícone para UI
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Componente de Botão de Rádio com novo estilo
const RadioPill = ({ label, name, value, checked, onChange }: { label: string, name: string, value: string, checked: boolean, onChange: (value: string) => void }) => (
  <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 w-full text-center ${checked ? 'bg-amber-800 text-white border-amber-800 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-700'}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="sr-only"
    />
    {label}
  </label>
);

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

  // Efeito para verificar autenticação e redirecionar se necessário
  useEffect(() => {
    // O hook useAuth pode levar um momento para determinar o status.
    // Verificamos explicitamente por `false` para agir apenas quando a verificação terminar e o utilizador não estiver logado.
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
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        toast.error("Por favor, selecione um ficheiro de imagem válido.");
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
      toast.success('Divulgação enviada com sucesso! A nossa equipa irá analisar. Obrigado pela sua ajuda.');
      router.push('/');
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar a sua divulgação.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto o status de autenticação é verificado, ou durante o redirecionamento,
  // exibimos um loader para evitar que o formulário apareça rapidamente.
  if (!isAuthenticated) {
    return (
        <main className="flex-grow flex items-center justify-center bg-gray-50 p-4 min-h-screen">
            <div className="text-center text-gray-600">
                <p>A verificar autenticação...</p>
            </div>
        </main>
    );
  }

  return (
    <main className="flex-grow bg-gray-50 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Ajude um Animal a Encontrar um Lar</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Cada divulgação é um passo crucial para mudar uma vida. Preencha o formulário abaixo com o máximo de detalhes possível.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Coluna da Esquerda: Detalhes */}
            <div className="space-y-8">
                <fieldset>
                    <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Detalhes do Animal</legend>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="localizacao" className="block text-sm font-medium text-gray-800 mb-1">Cidade e Bairro onde foi encontrado</label>
                            <Input name="localizacao" value={formData.localizacao} onChange={handleInputChange} placeholder="Ex: Porto União, Centro" required />
                        </div>
                        <div>
                            <label htmlFor="raca" className="block text-sm font-medium text-gray-800 mb-1">Raça (ou similar)</label>
                            <Input name="raca" value={formData.raca} onChange={handleInputChange} placeholder="Ex: Sem Raça Definida (SRD)" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">O animal é castrado?</label>
                            <div className="flex gap-4">
                                <RadioPill label="Sim" name="castrado" value="true" checked={castrado === 'true'} onChange={setCastrado} />
                                <RadioPill label="Não / Não sei" name="castrado" value="false" checked={castrado === 'false'} onChange={setCastrado} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">Este animal foi resgatado da rua?</label>
                            <div className="flex gap-4">
                                <RadioPill label="Sim, foi resgatado" name="resgate" value="true" checked={resgate === 'true'} onChange={setResgate} />
                                <RadioPill label="Não, é particular" name="resgate" value="false" checked={resgate === 'false'} onChange={setResgate} />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            {/* Coluna da Direita: Upload de Imagem */}
            <div className="space-y-8">
                <fieldset>
                    <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Foto</legend>
                    <div 
                      className={`relative flex flex-col justify-center items-center p-6 border-2 border-dashed rounded-xl transition-colors h-full min-h-[300px] ${isDragging ? 'border-amber-600 bg-amber-50' : 'border-gray-300'}`}
                      onDragEnter={(e) => handleDragEvents(e, 'enter')}
                      onDragLeave={(e) => handleDragEvents(e, 'leave')}
                      onDragOver={(e) => handleDragEvents(e, 'over')}
                      onDrop={handleDrop}
                    >
                      {previewImage ? (
                        <>
                          <img src={previewImage} alt="Pré-visualização" className="absolute inset-0 w-full h-full rounded-xl object-cover" />
                          <div className="relative z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg">
                            <label htmlFor="file" className="cursor-pointer font-semibold text-amber-700 hover:text-amber-600">
                                Trocar imagem
                                <input id="file" name="file" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            <label htmlFor="file-upload" className="font-semibold text-amber-700 hover:text-amber-600 cursor-pointer">
                                Clique para escolher
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required/>
                            </label>
                            <span> ou arraste e solte</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF até 10MB</p>
                        </div>
                      )}
                    </div>
                </fieldset>
            </div>
          </div>

          <fieldset>
            <legend className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. História e Comportamento</legend>
            <div>
                <label htmlFor="descricao" className="sr-only">Descreva o animal e a sua história</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows={5} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 placeholder:text-gray-400 text-gray-900" placeholder="Conte-nos sobre o temperamento, a história, se é dócil, se convive bem com outros animais, etc."></textarea>
            </div>
          </fieldset>

          <div className="pt-6 flex justify-end border-t">
            <Button type="submit" isLoading={isLoading} className="bg-amber-800 hover:bg-amber-900 focus:ring-amber-500 text-lg px-8 py-3">
              Enviar Divulgação para Análise
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

// app/divulgar-animal/page.tsx

'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewImage(null);
    }
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
      router.push('/'); // Redireciona para a página inicial
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar a sua divulgação.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Proteção da página
  if (!isAuthenticated) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p className="mt-2 text-gray-700">Você precisa de estar logado para divulgar um animal.</p>
                <Link href="/login" className="mt-6 inline-block bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-900 transition-colors">
                    Ir para o Login
                </Link>
            </div>
        </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl">
          <header className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">Divulgar um Animal Encontrado</h1>
            <p className="mt-3 text-gray-600">Preencha os detalhes abaixo. A sua ajuda é fundamental!</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna da Esquerda: Inputs de Texto */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="localizacao" className="block text-sm font-medium text-gray-800 mb-1">Cidade e Bairro</label>
                  <Input name="localizacao" value={formData.localizacao} onChange={handleInputChange} placeholder="Ex: Porto União, Centro" required />
                </div>
                <div>
                  <label htmlFor="raca" className="block text-sm font-medium text-gray-800 mb-1">Raça do Animal</label>
                  <Input name="raca" value={formData.raca} onChange={handleInputChange} placeholder="Ex: Sem Raça Definida (SRD)" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">O animal é castrado?</label>
                  <div className="mt-2 flex space-x-3">
                    <RadioPill label="Sim" name="castrado" value="true" checked={castrado === 'true'} onChange={setCastrado} />
                    <RadioPill label="Não / Não sei" name="castrado" value="false" checked={castrado === 'false'} onChange={setCastrado} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">Este animal foi resgatado da rua?</label>
                  <div className="mt-2 flex space-x-3">
                    <RadioPill label="Sim, foi resgatado" name="resgate" value="true" checked={resgate === 'true'} onChange={setResgate} />
                    <RadioPill label="Não" name="resgate" value="false" checked={resgate === 'false'} onChange={setResgate} />
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Upload de Imagem */}
              <div className="flex flex-col">
                <label htmlFor="file" className="block text-sm font-medium text-gray-800 mb-1">Foto do Animal</label>
                <div className="mt-1 flex-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {previewImage ? (
                      <img src={previewImage} alt="Pré-visualização" className="mx-auto h-48 w-auto rounded-md object-cover" />
                    ) : (
                      <>
                        <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">Arraste e solte ou</p>
                      </>
                    )}
                    <div className="text-sm text-gray-600">
                      <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-700 hover:text-amber-600 focus-within:outline-none">
                        <span>{previewImage ? 'Trocar imagem' : 'Escolher arquivo'}</span>
                        <input id="file" name="file" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required/>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-800 mb-1">Descreva o animal e a sua história</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900 placeholder:text-gray-400" placeholder="Conte-nos sobre o temperamento, a história, se é dócil, se convive bem com outros animais, etc."></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">
                Enviar Divulgação
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

// Componente auxiliar para os botões de rádio estilizados
const RadioPill = ({ label, name, value, checked, onChange }: { label: string, name: string, value: string, checked: boolean, onChange: (value: string) => void }) => (
  <label className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${checked ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
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

// app/divulgar-animal/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/common/input';
import Button from '../components/common/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Proteção da página: se o utilizador não estiver logado, mostra uma mensagem de acesso negado.
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
    <main className="bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Divulgar um Animal</h1>
            <p className="mt-2 text-gray-600">Ajude-nos a encontrar um novo lar para um animal que você está a abrigar.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <hr className="my-6" />
            <div>
              <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">Cidade e Bairro</label>
              <Input name="localizacao" value={formData.localizacao} onChange={handleInputChange} placeholder="Ex: Porto União, Centro" required />
            </div>
            <div>
              <label htmlFor="raca" className="block text-sm font-medium text-gray-700">Raça do Animal</label>
              <Input name="raca" value={formData.raca} onChange={handleInputChange} placeholder="Ex: Sem Raça Definida (SRD)" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">O animal é castrado?</label>
                <div className="mt-2 flex space-x-4">
                  <label className="flex items-center"><input type="radio" name="castrado" value="true" checked={castrado === 'true'} onChange={e => setCastrado(e.target.value)} className="focus:ring-amber-800 h-4 w-4 text-amber-800 border-gray-300" /> <span className="ml-2">Sim</span></label>
                  <label className="flex items-center"><input type="radio" name="castrado" value="false" checked={castrado === 'false'} onChange={e => setCastrado(e.target.value)} className="focus:ring-amber-800 h-4 w-4 text-amber-800 border-gray-300" /> <span className="ml-2">Não / Não sei</span></label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Este animal foi resgatado?</label>
                <div className="mt-2 flex space-x-4">
                  <label className="flex items-center"><input type="radio" name="resgate" value="true" checked={resgate === 'true'} onChange={e => setResgate(e.target.value)} className="focus:ring-amber-800 h-4 w-4 text-amber-800 border-gray-300" /> <span className="ml-2">Sim</span></label>
                  <label className="flex items-center"><input type="radio" name="resgate" value="false" checked={resgate === 'false'} onChange={e => setResgate(e.target.value)} className="focus:ring-amber-800 h-4 w-4 text-amber-800 border-gray-300" /> <span className="ml-2">Não</span></label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descreva o animal e a sua história</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800" placeholder="Conte-nos sobre o temperamento, a história, etc."></textarea>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Foto do Animal</label>
              <input id="file" type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"/>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="bg-amber-800 hover:bg-amber-900">
                Enviar Divulgação
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

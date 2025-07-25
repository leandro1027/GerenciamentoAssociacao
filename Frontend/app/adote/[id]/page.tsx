'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/services/api';
import { Animal, StatusAnimal } from '@/types';
import Button from '@/app/components/common/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// Ícones para os detalhes
const PawIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V8a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5z" /><path d="M9.5 11.5a1.5 1.5 0 013 0V12a1 1 0 001 1h.5a1.5 1.5 0 010 3H13a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V16a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H8a1 1 0 001-1v-.5zM6.5 7a1.5 1.5 0 00-3 0V6.5a1 1 0 011-1h.5a1.5 1.5 0 000-3H4a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0V4a1 1 0 011-1h.5a1.5 1.5 0 000-3H1.5a1.5 1.5 0 000 3H2a1 1 0 011 1v.5a1.5 1.5 0 003 0V8a1 1 0 01-1-1h-.5z" /></svg>;
const RulerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm3.293 1.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L6 6.414l.293.293a1 1 0 001.414-1.414l-2-2zM10 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm3.293 1.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L13 6.414l.293.293a1 1 0 001.414-1.414l-2-2z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;

// Componente para o Modal do Questionário
const AdoptionModal = ({ animal, onClose, onSubmit }: { animal: Animal, onClose: () => void, onSubmit: (data: any) => Promise<void> }) => {
  const [formData, setFormData] = useState({
    tipoMoradia: '',
    outrosAnimais: '',
    tempoDisponivel: '',
    motivoAdocao: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit({ animalId: animal.id, ...formData });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Questionário de Adoção para {animal.nome}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Qual o seu tipo de moradia?</label>
            <select value={formData.tipoMoradia} onChange={e => setFormData({...formData, tipoMoradia: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Selecione...</option>
              <option value="Casa com pátio fechado">Casa com pátio fechado</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Chácara/Sítio">Chácara/Sítio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Você possui outros animais?</label>
            <select value={formData.outrosAnimais} onChange={e => setFormData({...formData, outrosAnimais: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Selecione...</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quanto tempo você terá disponível para o animal?</label>
            <select value={formData.tempoDisponivel} onChange={e => setFormData({...formData, tempoDisponivel: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">Selecione...</option>
              <option value="Manhãs e noites">Manhãs e noites</option>
              <option value="Apenas noites">Apenas noites</option>
              <option value="Tempo integral">Tempo integral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Porque você gostaria de adotar o {animal.nome}?</label>
            <textarea value={formData.motivoAdocao} onChange={e => setFormData({...formData, motivoAdocao: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Cancelar</Button>
            <Button type="submit" isLoading={isLoading}>Enviar Pedido</Button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchAnimal = async () => {
        setLoading(true);
        try {
          const response = await api.get<Animal>(`/animais/${id}`);
          setAnimal(response.data);
        } catch (err) {
          setError('Não foi possível encontrar este animal.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnimal();
    }
  }, [id]);

  const handleOpenAdoptionModal = () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para solicitar uma adoção.');
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleAdoptionSubmit = async (formData: any) => {
    try {
      await api.post('/adocoes', formData);
      toast.success('Pedido de adoção enviado com sucesso! Entraremos em contacto.');
      setIsModalOpen(false);
      if (animal) {
        setAnimal({ ...animal, status: StatusAnimal.EM_PROCESSO_ADOCAO });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Não foi possível enviar o pedido.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>A carregar...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  if (!animal) return null;

  const imageUrl = animal.animalImageUrl
    ? `${api.defaults.baseURL}${animal.animalImageUrl}`
    : 'https://placehold.co/600x600/e2e8f0/cbd5e0?text=Sem+Foto';

  return (
    <>
      {isModalOpen && (
        <AdoptionModal 
          animal={animal} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAdoptionSubmit}
        />
      )}
      <main className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2 md:gap-x-8">
            <div className="relative h-80 md:h-full">
              <img src={imageUrl} alt={`Foto de ${animal.nome}`} className="w-full h-full object-cover" />
            </div>
            <div className="p-8">
              <h1 className="text-4xl font-extrabold text-gray-900">{animal.nome}</h1>
              <p className="mt-2 text-lg text-gray-600">{animal.raca}</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center"><PawIcon /><span className="text-gray-700"><strong className="font-semibold">Sexo:</strong> {animal.sexo}</span></div>
                <div className="flex items-center"><RulerIcon /><span className="text-gray-700"><strong className="font-semibold">Porte:</strong> {animal.porte}</span></div>
                <div className="flex items-center"><CalendarIcon /><span className="text-gray-700"><strong className="font-semibold">Idade:</strong> {animal.idade}</span></div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800">Sobre o {animal.nome}</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">{animal.descricao}</p>
              </div>

              <div className="mt-10">
                <Button 
                  onClick={handleOpenAdoptionModal}
                  className="w-full text-lg"
                  disabled={animal.status !== 'DISPONIVEL'}
                >
                  {animal.status === 'DISPONIVEL' ? `Quero Adotar o ${animal.nome}` : 'Adoção em Processo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

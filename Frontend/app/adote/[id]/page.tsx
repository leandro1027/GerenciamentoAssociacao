'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/services/api';
import { Animal, StatusAnimal, Sexo } from '@/types';
import Button from '@/app/components/common/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// --- Componentes Auxiliares ---

const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const AnimalFeature = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-4 p-4 bg-amber-50/70 rounded-xl">
    <div className="p-3 bg-white rounded-full shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-lg font-bold text-gray-900 capitalize">{value}</p>
    </div>
  </div>
);

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

  const selectOptions = {
    tipoMoradia: ['Casa com pátio fechado', 'Apartamento', 'Chácara/Sítio'],
    outrosAnimais: ['Sim', 'Não'],
    tempoDisponivel: ['Manhãs e noites', 'Apenas noites', 'Tempo integral'],
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Questionário de Adoção</h2>
          <p className="text-gray-600 mt-1">Interessado em adotar <span className="font-semibold text-amber-800">{animal.nome}</span>?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Qual o seu tipo de moradia?</label>
            <select value={formData.tipoMoradia} onChange={e => setFormData({...formData, tipoMoradia: e.target.value})} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
              <option value="" disabled>Selecione uma opção</option>
              {selectOptions.tipoMoradia.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Você possui outros animais?</label>
            <select value={formData.outrosAnimais} onChange={e => setFormData({...formData, outrosAnimais: e.target.value})} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
              <option value="" disabled>Selecione uma opção</option>
              {selectOptions.outrosAnimais.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quanto tempo você terá disponível para o animal?</label>
            <select value={formData.tempoDisponivel} onChange={e => setFormData({...formData, tempoDisponivel: e.target.value})} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
              <option value="" disabled>Selecione uma opção</option>
              {selectOptions.tempoDisponivel.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Por que deseja adotar {animal.nome}?</label>
            <textarea value={formData.motivoAdocao} onChange={e => setFormData({...formData, motivoAdocao: e.target.value})} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 placeholder:text-gray-400 text-gray-900" placeholder="Conte-nos um pouco..."></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline">Cancelar</Button>
            <Button type="submit" isLoading={isLoading} className="bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">Enviar Pedido</Button>
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
  const [hasPendingAdoption, setHasPendingAdoption] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchAnimalData = async () => {
        setLoading(true);
        setError(null);
        try {
          // 1. Buscar os dados principais do animal
          const animalResponse = await api.get<Animal>(`/animais/${id}`);
          setAnimal(animalResponse.data);

          // 2. Se o utilizador estiver autenticado, verificar o status da adoção
          // Esta chamada é feita em separado para não impedir a exibição do animal em caso de falha
          if (isAuthenticated) {
            try {
              const adoptionCheckResponse = await api.get<{ hasPending: boolean }>(`/adocoes/verificar/${id}`);
              if (adoptionCheckResponse.data.hasPending) {
                setHasPendingAdoption(true);
              }
            } catch (adoptionError) {
              console.error("Falha ao verificar adoção pendente:", adoptionError);
              // Não definimos um erro principal aqui para não bloquear a UI
            }
          }
        } catch (err) {
          setError('Não foi possível carregar os dados deste animal.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnimalData();
    }
  }, [id, isAuthenticated]);

  const handleOpenAdoptionModal = () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para solicitar uma adoção.');
      router.push('/login');
      return;
    }
    if (hasPendingAdoption) {
        toast.error('Você já possui um pedido de adoção em andamento para este animal.');
        return;
    }
    setIsModalOpen(true);
  };

  const handleAdoptionSubmit = async (formData: any) => {
    try {
      await api.post('/adocoes', formData);
      toast.success('Pedido de adoção enviado com sucesso! Entraremos em contacto.');
      setIsModalOpen(false);
      setHasPendingAdoption(true);
      if (animal) {
        setAnimal({ ...animal, status: StatusAnimal.EM_PROCESSO_ADOCAO });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Não foi possível enviar o pedido.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>A carregar perfil...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
  if (!animal) return null;

  const imageUrl = animal.animalImageUrl
    ? `${api.defaults.baseURL}${animal.animalImageUrl}`
    : 'https://placehold.co/600x600/e2e8f0/cbd5e0?text=Sem+Foto';

  const statusInfo = {
    DISPONIVEL: { text: 'Disponível para Adoção', color: 'bg-green-100 text-green-800' },
    EM_PROCESSO_ADOCAO: { text: 'Em Processo de Adoção', color: 'bg-yellow-100 text-yellow-800' },
    ADOTADO: { text: 'Já encontrou um lar!', color: 'bg-blue-100 text-blue-800' },
  };
  
  const getButtonState = () => {
      if(hasPendingAdoption) {
          return { text: 'Pedido já enviado', disabled: true };
      }
      if(animal.status !== 'DISPONIVEL') {
          return { text: 'Adoção em Processo', disabled: true };
      }
      return { text: `Quero Adotar o ${animal.nome}`, disabled: false };
  }
  
  const buttonState = getButtonState();

  return (
    <>
      {isModalOpen && (
        <AdoptionModal 
          animal={animal} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAdoptionSubmit}
        />
      )}
      <main className="bg-gray-50 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/adote" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-semibold transition-colors">
              <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" className="w-5 h-5" />
              Voltar para a lista
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-3">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg sticky top-8">
                <img src={imageUrl} alt={`Foto de ${animal.nome}`} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-col space-y-6">
                <div>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusInfo[animal.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusInfo[animal.status]?.text || 'Status Indefinido'}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">{animal.nome}</h1>
                  <p className="text-lg text-gray-500">{animal.raca}</p>
                </div>

                <div className="border-t pt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Características</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimalFeature 
                            icon={<Icon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" className="w-6 h-6 text-amber-700" />} 
                            label="Sexo" 
                            value={animal.sexo} 
                        />
                        <AnimalFeature 
                            icon={<Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" className="w-6 h-6 text-amber-700" />} 
                            label="Idade" 
                            value={animal.idade} 
                        />
                        <AnimalFeature 
                            icon={<Icon path="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" className="w-6 h-6 text-amber-700" />} 
                            label="Porte" 
                            value={animal.porte} 
                        />
                    </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-800">Minha História</h2>
                  <p className="mt-2 leading-relaxed text-gray-700 text-justify">{animal.descricao}</p>
                </div>

                <div className="border-t pt-6">
                    <p className="text-center text-gray-600 mb-4">Acha que {animal.nome} é o companheiro ideal para si?</p>
                    <Button 
                        onClick={handleOpenAdoptionModal}
                        className="w-full text-lg py-3 bg-amber-800 hover:bg-amber-900 focus:ring-amber-500"
                        disabled={buttonState.disabled}
                    >
                        {buttonState.text}
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

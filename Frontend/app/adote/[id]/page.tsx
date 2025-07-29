// app/adote/[id]/page.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/services/api';
import { Animal, StatusAnimal } from '@/types';
import Button from '@/app/components/common/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const AnimalFeature = ({ iconPath, label, value }: { iconPath: string, label: string, value: string }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
    <div className="p-3 bg-amber-100 rounded-full mb-2">
      <Icon path={iconPath} className="w-6 h-6 text-amber-800" />
    </div>
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
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

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Questionário de Adoção</h2>
          <p className="text-gray-600 mt-1">Interessado em adotar <span className="font-semibold text-amber-800">{animal.nome}</span>?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['tipoMoradia', 'outrosAnimais', 'tempoDisponivel'].map((field, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <select value={(formData as any)[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} required className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 ${!(formData as any)[field] ? 'text-gray-400' : 'text-gray-900'}`}>
                <option value="" disabled>Selecione uma opção</option>
                {field === 'tipoMoradia' && ['Casa com pátio fechado', 'Apartamento', 'Chácara/Sítio'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                {field === 'outrosAnimais' && ['Sim', 'Não'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                {field === 'tempoDisponivel' && ['Manhãs e noites', 'Apenas noites', 'Tempo integral'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
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

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
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
      <main className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden md:grid md:grid-cols-2">
            <div className="relative min-h-[400px] md:min-h-full">
              <img src={imageUrl} alt={`Foto de ${animal.nome}`} className="absolute w-full h-full object-cover rounded-l-3xl" />
            </div>
            <div className="p-8 flex flex-col">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{animal.nome}</h1>
              <p className="text-lg text-gray-600 mb-4 italic">{animal.raca}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <AnimalFeature iconPath="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" label="Sexo" value={animal.sexo} />
                <AnimalFeature iconPath="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" label="Idade" value={animal.idade} />
                <AnimalFeature iconPath="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" label="Porte" value={animal.porte} />
              </div>

              <div className="space-y-4 text-gray-700 flex-1">
                <h2 className="text-xl font-semibold text-gray-800">Sobre {animal.nome}</h2>
                <p className="leading-relaxed text-justify">{animal.descricao}</p>
              </div>

              <div className="mt-10">
                <Button 
                  onClick={handleOpenAdoptionModal}
                  className="w-full text-lg bg-amber-800 hover:bg-amber-900 focus:ring-amber-500"
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal } from '../types';

// --- COMPONENTE PARA O CARD DO ANIMAL (COM DEBUG) ---
const AnimalCard = ({ animal }: { animal: Animal }) => {
  const apiBaseUrl = api.defaults.baseURL;

  const imageUrl = animal.animalImageUrl
    ? `${apiBaseUrl}${animal.animalImageUrl}`
    : 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';

  // --- INÍCIO DO CÓDIGO DE DEPURAÇÃO ---
  console.log(`[AnimalCard] Renderizando animal: ${animal.nome}`);
  console.log(`[AnimalCard] Objeto animal recebido:`, animal);
  console.log(`[AnimalCard] URL final da imagem construída: ${imageUrl}`);
  // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`[AnimalCard] FALHA AO CARREGAR IMAGEM: ${e.currentTarget.src}`);
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  };

  return (
    <Link href={`/adote/${animal.id}`} className="group block bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-56 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={`Foto de ${animal.nome}`} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{animal.nome}</h3>
        <p className="text-sm text-gray-600 mt-1">Porto União, Santa Catarina</p>
      </div>
    </Link>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA INICIAL ---
export default function HomePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimais = async () => {
      try {
        const response = await api.get<Animal[]>('/animais?disponivel=true');
        setAnimais(response.data);
      } catch (err) {
        console.error("Erro ao buscar animais:", err);
        setError('Não foi possível carregar os animais. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimais();
  }, []);

  return (
    <>
      <Carousel />
      <main className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-10 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                Animais para Adoção
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Encontre um amigo para a vida toda. Adote com amor e responsabilidade!
              </p>
            </header>

            {loading && <p className="text-center text-gray-600">A carregar animais...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {animais.map(animal => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))}
              </div>
            )}
        </div>
      </main>
    </>
  );
}

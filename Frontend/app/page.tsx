'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Link importado novamente
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal } from '../types';

// --- COMPONENTE PARA O CARD DO ANIMAL (COM LINK APENAS NO TEXTO) ---
const AnimalCard = ({ animal }: { animal: Animal }) => {
  // Se o animal ou a URL da imagem não existirem, não renderiza o card para evitar erros.
  if (!animal || !animal.animalImageUrl) {
    return null; 
  }

  const apiBaseUrl = api.defaults.baseURL;
  const imageUrl = `${apiBaseUrl}${animal.animalImageUrl}`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  };

  // O <Link> agora envolve apenas a secção de texto.
  return (
    // EFEITO DE HOVER ADICIONADO AQUI
    <div className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-56 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={`Foto de ${animal.nome}`} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      <Link href={`/adote/${animal.id}`} className="block p-4 hover:bg-gray-50 transition-colors duration-200">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{animal.nome}</h3>
        <p className="text-sm text-gray-600 mt-1">Porto União, Santa Catarina</p>
      </Link>
    </div>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel'; // Re-importado
import api from './services/api';
import { Animal } from '../types';

// --- COMPONENTE PARA O CARD DO ANIMAL ---
// Este componente deve idealmente estar no seu próprio ficheiro, como fizemos antes.
const AnimalCard = ({ animal }: { animal: Animal }) => {
  if (!animal || !animal.animalImageUrl) {
    return null; 
  }
  const apiBaseUrl = api.defaults.baseURL;
  const imageUrl = `${apiBaseUrl}${animal.animalImageUrl}`;
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  };
  return (
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
        setAnimais(response.data.slice(0, 8)); // Limita a 8 animais
      } catch (err) {
        console.error("Erro ao buscar animais:", err);
        setError('Não foi possível carregar os animais.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimais();
  }, []);

  return (
    <>
      <Carousel />
      <main className="bg-white">
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Grelha de duas colunas para as imagens e botões */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div>
                    <div className="mt-4">
                        <Link href="/adote" className="w-full block text-center bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-900 transition-colors">
                            Quero Adotar
                        </Link>
                    </div>
                </div>
                {/* Coluna Direita */}
                <div>
                    <div className="mt-4">
                        <button 
                          onClick={() => alert('Funcionalidade em desenvolvimento!')} 
                          className="w-full block text-center bg-white text-amber-800 border border-amber-800 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-50 transition-colors"
                        >
                            Quero divulgar um animal
                        </button>
                    </div>
                </div>
            </div>

            {/* Bloco de texto abaixo da grelha */}
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-800">Adote um animalzinho!</h2>
                <p className="mt-2 text-gray-600">O nosso site está cheio de cãezinhos e gatinhos ansiosos por uma família. Vem ver!</p>
            </div>
        </section>
      </main>

      {/* Secção de Pré-visualização dos Animais */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-gray-800">
                Conheça alguns deles
              </h2>
            </header>

            {loading && <p className="text-center text-gray-600">A carregar animais...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {animais.map(animal => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/adote" className="inline-block bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        Ver Mais
                    </Link>
                </div>
              </>
            )}
        </div>
      </div>
    </>
  );
}

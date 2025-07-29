'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal } from '../types';

// --- Interface para o conteúdo da Home ---
interface ConteudoHome {
  titulo: string;
  subtitulo: string;
  itens: string; // Virá como uma string JSON
  imagemUrl: string;
}

// --- COMPONENTES AUXILIARES PARA A UI ---

const Icon = ({ path, className = "w-12 h-12" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Componente para o Card do Animal
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
    <Link href={`/adote/${animal.id}`} className="group block bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden h-56">
        <img 
          src={imageUrl} 
          alt={`Foto de ${animal.nome}`} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white">{animal.nome}</h3>
          <p className="text-sm text-gray-200">{animal.raca}</p>
        </div>
      </div>
      <div className="p-4 bg-white">
        <span className="inline-block w-full bg-amber-800 text-white text-center font-semibold px-4 py-2 rounded-lg group-hover:bg-amber-900 transition-colors">
          Quero Adotar
        </span>
      </div>
    </Link>
  );
};

// --- COMPONENTE: SEÇÃO SOBRE NÓS (AGORA DINÂMICO) ---
const AboutSection = ({ conteudo }: { conteudo: ConteudoHome | null }) => {
  if (!conteudo) return null; // Não renderiza nada se o conteúdo não for carregado

  const itensList = JSON.parse(conteudo.itens || '[]');

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Coluna de Texto */}
          <div className="text-gray-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-tight">
              {conteudo.titulo}
            </h2>
            <p className="mt-4 text-lg">
              {conteudo.subtitulo}
            </p>
            <ul className="mt-6 space-y-3 list-disc list-inside">
              {itensList.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/quem-somos" className="inline-block bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-900 transition-colors">
                Saiba Mais
              </Link>
            </div>
          </div>
          {/* Coluna da Imagem/Vídeo */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <img 
              src={`${api.defaults.baseURL}${conteudo.imagemUrl}`} 
              alt="Imagem sobre a associação"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button className="bg-white/30 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/50 transition-colors">
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA INICIAL ---
export default function HomePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [conteudoHome, setConteudoHome] = useState<ConteudoHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [animaisRes, conteudoRes] = await Promise.all([
          api.get<Animal[]>('/animais?disponivel=true'),
          api.get<ConteudoHome>('/conteudo-home'),
        ]);
        setAnimais(animaisRes.data.slice(0, 8));
        setConteudoHome(conteudoRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados da página inicial:", err);
        setError('Não foi possível carregar a página.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <>
      <Carousel />
      
      <main className="bg-white">
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Grelha de duas colunas para os botões de ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Link href="/adote" className="w-full block text-center bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-900 transition-colors">
                Quero Adotar
              </Link>
            </div>
            <div>
              <Link href="/divulgar-animal" className="w-full block text-center bg-white text-amber-800 border border-amber-800 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-50 transition-colors">
                Quero divulgar um animal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Secção de Pré-visualização dos Animais */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            {loading && <p className="text-center text-gray-600">A carregar...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {animais.map(animal => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/adote" className="inline-block bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-amber-900 transition-colors">
                        Ver todos os animais
                    </Link>
                </div>
              </>
            )}
        </div>
      </div>

      {/* SEÇÃO SOBRE NÓS DINÂMICA */}
      <AboutSection conteudo={conteudoHome} />
    </>
  );
}

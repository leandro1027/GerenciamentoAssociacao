'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal, Parceiro } from '../types';

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

// --- COMPONENTE: SEÇÃO SOBRE NÓS (DINÂMICO) ---
const AboutSection = ({ conteudo }: { conteudo: ConteudoHome | null }) => {
  if (!conteudo) return null;

  const itensList = JSON.parse(conteudo.itens || '[]');

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <img 
              src={`${api.defaults.baseURL}${conteudo.imagemUrl}`} 
              alt="Imagem sobre a associação"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button className="bg-white/30 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/50 transition-colors">
                 <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" className="w-10 h-10" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE: Secção de Chamada para Ação com Parallax ---
const ParallaxCtaSection = () => (
  <section 
    className="relative bg-cover bg-center bg-fixed" 
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')" }}
  >
    <div className="absolute inset-0 bg-amber-900/70"></div>
    <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
        <span className="block">Junte-se a nós e faça parte desta história.</span>
      </h2>
      <p className="mt-4 text-lg leading-6 text-amber-100">
        A sua ajuda, seja através de doações, voluntariado ou adoção, é o que nos permite continuar.
      </p>
      <Link href="/quero-ajudar" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-amber-800 bg-white hover:bg-amber-50 sm:w-auto">
        Quero Ajudar
      </Link>
    </div>
  </section>
);

// --- COMPONENTE: Secção de Parceiros com Carrossel Infinito (ATUALIZADO) ---
const PartnersSection = ({ partners }: { partners: Parceiro[] }) => {
    if (partners.length === 0) return null;

    // Duplica a lista para o efeito de scroll contínuo
    const extendedPartners = [...partners, ...partners];

    return (
        <section id="parceiros" className="bg-gray-50 py-16 sm:py-20">
            <style>
                {`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .scrolling-wrapper {
                        animation: scroll 30s linear infinite;
                    }
                    .scrolling-container:hover .scrolling-wrapper {
                        animation-play-state: paused;
                    }
                `}
            </style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl tracking-tight">
                        Nossos Parceiros
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Agradecemos a todos que nos ajudam a continuar o nosso trabalho.
                    </p>
                </div>
                <div className="w-full overflow-hidden relative scrolling-container">
                    <div className="flex w-max scrolling-wrapper">
                        {extendedPartners.map((partner, index) => (
                            <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center">
                                <img 
                                    src={`${api.defaults.baseURL}${partner.logoUrl}`} 
                                    alt={partner.nome}
                                    // Classes atualizadas para arredondar a logo
                                    className="w-32 h-32 object-contain rounded-full bg-white p-2 shadow-md"
                                />
                            </div>
                        ))}
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
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [animaisRes, conteudoRes, parceirosRes] = await Promise.all([
          api.get<Animal[]>('/animais?disponivel=true'),
          api.get<ConteudoHome>('/conteudo-home'),
          api.get<Parceiro[]>('/parceiros'),
        ]);
        setAnimais(animaisRes.data.slice(0, 8));
        setConteudoHome(conteudoRes.data);
        setParceiros(parceirosRes.data);
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

      <AboutSection conteudo={conteudoHome} />
      <ParallaxCtaSection />
      <PartnersSection partners={parceiros} />
    </>
  );
}

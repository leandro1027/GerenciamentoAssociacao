'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal, Parceiro, Sexo } from '../types';

console.log("URL da API lida pela Vercel:", process.env.NEXT_PUBLIC_API_URL);
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

// NOVO Componente para as Tags de características do animal
const AnimalFeatureTag = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
        {icon}
        <span>{text}</span>
    </div>
);

// ATUALIZADO Componente para o Card do Animal
const AnimalCard = ({ animal }: { animal: Animal }) => {
  if (!animal || !animal.animalImageUrl) {
    return null; 
  }
  const apiBaseUrl = api.defaults.baseURL;
  const imageUrl = `${apiBaseUrl}${animal.animalImageUrl}`;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  };

  const genderIcon = animal.sexo === Sexo.MACHO ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.034a5.95 5.95 0 013.377 1.35l.866-.5a1 1 0 111 1.732l-.866.5A5.95 5.95 0 0117 10h1.034a1 1 0 110 2H17a5.95 5.95 0 01-1.35 3.377l.5.866a1 1 0 11-1.732 1l-.5-.866A5.95 5.95 0 0110 17v1.034a1 1 0 11-2 0V17a5.95 5.95 0 01-3.377-1.35l-.866.5a1 1 0 11-1-1.732l.866-.5A5.95 5.95 0 013 12H1.966a1 1 0 110-2H3a5.95 5.95 0 011.35-3.377l-.5-.866a1 1 0 111.732-1l.5.866A5.95 5.95 0 018 3.034V2a1 1 0 012 0zm0 4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="group flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative overflow-hidden h-56">
        <img 
          src={imageUrl} 
          alt={`Foto de ${animal.nome}`} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
          onError={handleImageError}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-800">{animal.nome}</h3>
        <div className="flex flex-wrap gap-2 my-3">
            <AnimalFeatureTag icon={genderIcon} text={animal.sexo} />
            <AnimalFeatureTag icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            } text={animal.porte} />
             <AnimalFeatureTag icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3,2.05C10.52,2.4,9.53,3.33,9.13,4.23c-0.23,0.52-0.23,1.1,0,1.62c0.4,0.9,1.39,1.83,2.17,2.17c0.52,0.23,1.1,0.23,1.62,0c0.9-0.4,1.83-1.39,2.17-2.17c0.23-0.52,0.23-1.1,0-1.62C16.67,3.33,15.7,2.4,14.8,2.05C14.28,1.82,13.7,1.7,13.11,1.7C12.52,1.7,11.82,1.82,11.3,2.05z M4.23,9.13C3.33,9.53,2.4,10.52,2.05,11.3c-0.23,0.52-0.35,1.1-0.35,1.69c0,0.59,0.12,1.17,0.35,1.69c0.35,0.78,1.28,1.77,2.18,2.17c0.52,0.23,1.1,0.35,1.69,0.35s1.17-0.12,1.69-0.35c0.9-0.4,1.83-1.39,2.17-2.17c0.23-0.52,0.35-1.1,0.35-1.69c0-0.59-0.12-1.17-0.35-1.69C9.53,9.93,8.6,9,7.7,8.65C7.18,8.42,6.6,8.3,6.01,8.3C5.42,8.3,4.75,8.42,4.23,9.13z M9.13,14.8c-0.4-0.9-1.39-1.83-2.17-2.17c-0.52-0.23-1.1-0.23-1.62,0c-0.9,0.4-1.83,1.39-2.17,2.17c-0.23,0.52-0.23,1.1,0,1.62c0.4,0.9,1.39,1.83,2.17,2.17c0.52,0.23,1.1,0.23,1.62,0c0.9-0.4,1.83-1.39,2.17-2.17C9.36,15.9,9.36,15.32,9.13,14.8z" clipRule="evenodd" />
                </svg>
            } text={animal.raca} />
        </div>
        <div className="mt-auto pt-4">
            <Link href={`/adote/${animal.id}`} className="block w-full text-center bg-amber-800 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-amber-900 transition-colors duration-300">
                Quero Adotar
            </Link>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE: SEÇÃO SOBRE NÓS
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
      <Link href="/voluntario" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-amber-800 bg-white hover:bg-amber-50 sm:w-auto">
        Quero Ajudar
      </Link>
    </div>
  </section>
);


const PartnersSection = ({ partners }: { partners: Parceiro[] }) => {
    if (partners.length === 0) return null;

    // Duplicamos a lista de parceiros para criar o efeito de loop contínuo na animação CSS.
    
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
                                    // arredondar a logo
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

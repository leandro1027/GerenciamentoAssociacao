'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link';
import Carousel from './components/layout/carousel';
import api from './services/api';
import { Animal, Parceiro, Sexo } from '../types';

// --- FUNÇÃO PARA CONSTRUIR URLS DO R2 ---
const buildImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  }
  
  // Se já for uma URL completa do R2, retorna como está
  if (imagePath.includes('r2.dev')) {
    return imagePath;
  }
  
  // Se for uma URL do backend (localhost ou render), extrai o nome do arquivo
  if (imagePath.includes('localhost') || imagePath.includes('render.com')) {
    const fileName = imagePath.split('/').pop(); // pega o nome do arquivo
    if (fileName) {
      const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
      return r2Domain ? `${r2Domain}/${fileName}` : `https://placehold.co/400x400/e2e8f0/cbd5e0?text=Erro+R2`;
    }
  }
  
  // Se for apenas um nome de arquivo (UUID.jpg), constrói URL do R2
  if (/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(imagePath)) {
    const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
    if (r2Domain) {
      return `${r2Domain}/${imagePath}`;
    } else {
      console.error('NEXT_PUBLIC_R2_PUBLIC_DOMAIN não está definido');
      return 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Erro+Config';
    }
  }
  
  // Fallback: retorna como está
  return imagePath;
};

// --- Interface para o conteúdo da Home ---
interface ConteudoHome {
  titulo: string;
  subtitulo: string;
  itens: string; 
  imagemUrl: string;
}

// --- COMPONENTES AUXILIARES ---

const Icon = ({ path, className = "w-12 h-12" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const AnimalFeatureTag = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
    {icon}
    <span>{text}</span>
  </div>
);

// --- CARD DE ANIMAL ---
const AnimalCard = ({ animal }: { animal: Animal }) => {
  if (!animal || !animal.animalImageUrl) return null;

  // CORREÇÃO: Usar buildImageUrl em vez da URL da API
  const imageUrl = buildImageUrl(animal.animalImageUrl);

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
    <div className="group flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
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
          <AnimalFeatureTag icon={<span>🐶</span>} text={animal.porte} />
          <AnimalFeatureTag icon={<span>📍</span>} text={animal.raca} />
        </div>
        <div className="mt-auto pt-4">
          <Link 
            href={`/adote/${animal.id}`} 
            className="block w-full text-center bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-4 py-2.5 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Quero Adotar
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- SEÇÃO SOBRE NÓS ---
const AboutSection = ({ conteudo }: { conteudo: ConteudoHome | null }) => {
  if (!conteudo) return null;
  
  // Corrigido: Verificação segura para parsing do JSON
  let itensList: string[] = [];
  try {
    itensList = JSON.parse(conteudo.itens || '[]');
  } catch (error) {
    console.error('Erro ao fazer parse dos itens:', error);
    itensList = [];
  }

  // CORREÇÃO: Usar buildImageUrl para a imagem do conteúdo
  const imageUrl = buildImageUrl(conteudo.imagemUrl);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-gray-700">
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-tight relative">
            {conteudo.titulo}
            <span className="block w-16 h-1 bg-amber-800 mt-3"></span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed">{conteudo.subtitulo}</p>
          <ul className="mt-6 space-y-3 list-disc list-inside text-gray-600">
            {itensList.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/quem-somos" className="inline-block bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 transition-all">
              Saiba Mais
            </Link>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <img 
            src={imageUrl} 
            alt="Imagem sobre a associação"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=Sem+Imagem';
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button className="bg-white/30 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/50 transition-colors">
              <Icon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" className="w-10 h-10" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- SEÇÃO CTA COM PARALLAX ---
const ParallaxCtaSection = () => (
  <section 
    className="relative bg-cover bg-center bg-fixed" 
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')" }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-black/70"></div>
    <div className="relative max-w-4xl mx-auto text-center py-24 px-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
        Junte-se a nós e faça parte desta história.
      </h2>
      <p className="mt-4 text-lg leading-7 text-amber-100">
        A sua ajuda, seja através de doações, voluntariado ou adoção, é o que nos permite continuar.
      </p>
      <Link href="/voluntario" className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-lg text-amber-800 bg-white font-semibold shadow-md hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all">
        Quero Ajudar
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </section>
);

// --- PARCEIROS ---
const PartnersSection = ({ partners }: { partners: Parceiro[] }) => {
  if (!partners || partners.length === 0) return null;
  const extendedPartners = [...partners, ...partners];

  return (
    <section id="parceiros" className="bg-gray-50 py-20">
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Parceiros que confiam em nós</h2>
          <p className="mt-4 text-lg text-gray-600">Agradecemos a todos que nos ajudam a continuar o nosso trabalho.</p>
        </div>
        <div className="w-full overflow-hidden relative scrolling-container">
          <div className="flex w-max scrolling-wrapper">
            {extendedPartners.map((partner, index) => (
              <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center">
                {/* CORREÇÃO: Usar buildImageUrl para logos dos parceiros */}
                <img 
                  src={buildImageUrl(partner.logoUrl)} 
                  alt={partner.nome}
                  className="w-32 h-32 object-contain rounded-full bg-white p-2 shadow-md filter grayscale hover:grayscale-0 transition"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/128x128/e2e8f0/cbd5e0?text=Logo';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- PRINCIPAL ---
export default function HomePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [conteudoHome, setConteudoHome] = useState<ConteudoHome | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [animaisRes, conteudoRes, parceirosRes] = await Promise.all([
          api.get<Animal[]>('/animais'),
          api.get<ConteudoHome>('/conteudo-home'),
          api.get<Parceiro[]>('/parceiros'),
        ]);

        // CORREÇÃO: Garantir que animais seja sempre um array
        const animaisData = Array.isArray(animaisRes.data) ? animaisRes.data : [];
        setAnimais(animaisData.slice(0, 8));
        
        setConteudoHome(conteudoRes.data);
        
        // CORREÇÃO: Garantir que parceiros seja sempre um array
        const parceirosData = Array.isArray(parceirosRes.data) ? parceirosRes.data : [];
        setParceiros(parceirosData);
        
      } catch (err) {
        console.error("Erro ao buscar dados da página inicial:", err);
        setError('Não foi possível carregar a página.');
        // Garantir que os estados sejam arrays vazios em caso de erro
        setAnimais([]);
        setParceiros([]);
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
        <section className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/adote" className="block text-center bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-8 py-4 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 hover:scale-[1.02] active:scale-95 transition-all">
            Quero Adotar
          </Link>
          <Link href="/divulgar-animal" className="block text-center bg-white border border-amber-800 text-amber-800 font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all">
            Quero divulgar um animal
          </Link>
        </section>
      </main>

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-20 px-6">
          {loading && <p className="text-center text-gray-600">A carregar...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!loading && !error && (
            <>
              {/* CORREÇÃO: Verificação adicional para garantir que animais é um array */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.isArray(animais) && animais.map(animal => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href="/adote" className="inline-block bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 hover:scale-[1.02] active:scale-95 transition-all">
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
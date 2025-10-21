'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from './components/layout/carousel'; // Verifique se o caminho está correto
import api from './services/api'; // Verifique se o caminho está correto
import { Animal, Parceiro, Sexo, ConteudoHome } from '../types'; // Importe ConteudoHome de 'types'

// --- VARIÁVEL DE AMBIENTE E FALLBACKs ---
const R2_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '';
const FALLBACK_IMAGE_URL = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
const FALLBACK_LOGO_URL = 'https://placehold.co/128x128/e2e8f0/cbd5e0?text=Logo';
const FALLBACK_ABOUT_URL = 'https://placehold.co/600x400/e2e8f0/cbd5e0?text=Sem+Imagem';

// --- FUNÇÃO HELPER PARA CONSTRUIR URLS DO R2 ---
const buildImageUrl = (imagePath: string | null | undefined, fallback: string = FALLBACK_IMAGE_URL): string => {
  if (imagePath && R2_PUBLIC_DOMAIN) {
    // Remove qualquer prefixo '/uploads/' que possa ter ficado no DB
    const cleanPath = imagePath.replace(/^uploads\//, '');
    // Garante que o domínio não termine com '/' e o caminho não comece com '/'
    const domain = R2_PUBLIC_DOMAIN.replace(/\/$/, '');
    const path = cleanPath.replace(/^\//, '');
    return `${domain}/${path}`;
  }
  // Se não houver R2_PUBLIC_DOMAIN configurado, loga um aviso no console (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development' && !R2_PUBLIC_DOMAIN && imagePath) {
    console.warn(`[buildImageUrl] Variável de ambiente NEXT_PUBLIC_R2_PUBLIC_DOMAIN não definida para a imagem: ${imagePath}`);
  }
  return fallback; // Retorna placeholder
};

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
  if (!animal) return null;

  const imageUrl = buildImageUrl(animal.animalImageUrl); // Usa a função helper

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  };

  const genderIcon = animal.sexo === Sexo.MACHO ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.034a5.95 5.95 0 013.377 1.35l.866-.5a1 1 0 111 1.732l-.866.5A5.95 5.95 0 0117 10h1.034a1 1 0 110 2H17a5.95 5.95 0 01-1.35 3.377l.5.866a1 1 0 11-1.732 1l-.5-.866A5.95 5.95 0 0110 17v1.034a1 1 0 11-2 0V17a5.95 5.95 0 01-3.377-1.35l-.866.5a1 1 0 11-1-1.732l.866-.5A5.95 5.95 0 013 12H1.966a1 1 0 110-2H3a5.95 5.95 0 011.35-3.377l-.5-.866a1 1 0 111.732-1l.5.866A5.95 5.95 0 018 3.034V2a1 1 0 012 0zm0 4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" /></svg>
  );

  return (
    <div className="group flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden bg-gray-100"> {/* Fundo placeholder */}
        <img
          src={imageUrl}
          alt={`Foto de ${animal.nome}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy" // Adiciona lazy loading
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-800 truncate">{animal.nome}</h3> {/* Adicionado truncate */}
        <div className="flex flex-wrap gap-2 my-3">
          <AnimalFeatureTag icon={genderIcon} text={animal.sexo} />
          <AnimalFeatureTag icon={<span>🐾</span>} text={animal.porte} />
          <AnimalFeatureTag icon={<span>🧬</span>} text={animal.raca} />
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
  if (!conteudo) return null; // Retorna nulo se não houver conteúdo

  let itensList: string[] = [];
  try {
    // Tenta parsear, mas define como array vazio se falhar ou for nulo
    itensList = JSON.parse(conteudo.itens || '[]');
    if (!Array.isArray(itensList)) itensList = []; // Garante que seja um array
  } catch (error) { console.error('Erro ao fazer parse dos itens:', error); }

  const imageUrl = buildImageUrl(conteudo.imagemUrl, FALLBACK_ABOUT_URL); // Usa a função helper

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-gray-700">
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 tracking-tight relative mb-4">
            {conteudo.titulo || 'Nossa Missão'}
            <span className="block w-16 h-1 bg-amber-800 mt-2"></span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed">{conteudo.subtitulo || 'Descrição padrão sobre a associação.'}</p>
          {itensList.length > 0 && (
            <ul className="mt-6 space-y-3 list-disc list-inside text-gray-600">
              {itensList.map((item: string, index: number) => ( <li key={index}>{item}</li> ))}
            </ul>
          )}
          <div className="mt-8">
            <Link href="/quem-somos" className="inline-block bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 transition-all">
              Saiba Mais
            </Link>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-w-16 aspect-h-10 md:aspect-h-11 bg-gray-100"> {/* Fundo placeholder */}
          <img
            src={imageUrl}
            alt="Imagem sobre a associação"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK_ABOUT_URL; }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

// --- SEÇÃO CTA COM PARALLAX ---
const ParallaxCtaSection = () => (
    <section
        className="relative bg-cover bg-center bg-fixed py-20 sm:py-24"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')" }} // Imagem de exemplo
    >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-black/70"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Junte-se a nós e faça parte desta história.
            </h2>
            <p className="mt-4 text-lg leading-7 text-amber-100 mb-8">
                A sua ajuda, seja através de doações, voluntariado ou adoção, é o que nos permite continuar.
            </p>
            <Link href="/voluntario" className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-lg text-amber-800 bg-white font-semibold shadow-md hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all">
                Quero Ajudar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
        </div>
    </section>
);

// --- PARCEIROS ---
const PartnersSection = ({ partners }: { partners: Parceiro[] }) => {
  if (!Array.isArray(partners) || partners.length === 0) return null;
  const extendedPartners = partners.length > 0 ? [...partners, ...partners] : [];

  return (
    <section id="parceiros" className="bg-gray-50 py-16 sm:py-20">
      <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .scrolling-wrapper { animation: scroll 40s linear infinite; } .scrolling-container:hover .scrolling-wrapper { animation-play-state: paused; }`}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Parceiros que confiam em nós</h2>
          <p className="mt-4 text-lg text-gray-600">Agradecemos a todos que nos ajudam a continuar o nosso trabalho.</p>
        </div>
        <div className="w-full overflow-hidden relative scrolling-container group">
          <div className="flex w-max scrolling-wrapper">
            {extendedPartners.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="flex-shrink-0 mx-6 sm:mx-8 flex items-center justify-center py-4">
                <img
                  src={buildImageUrl(partner.logoUrl, FALLBACK_LOGO_URL)} // Usa a função helper
                  alt={partner.nome}
                  title={partner.nome} // Tooltip
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full bg-white p-2 shadow-md filter grayscale group-hover:grayscale-0 transition duration-300 hover:!grayscale-0 hover:scale-105"
                  onError={(e) => { e.currentTarget.src = FALLBACK_LOGO_URL; }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function HomePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [conteudoHome, setConteudoHome] = useState<ConteudoHome | null>(null);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get('/animais'),
          api.get('/conteudo-home'),
          api.get('/parceiros'),
        ]);

        const animaisData = results[0].status === 'fulfilled' && Array.isArray(results[0].value.data) ? results[0].value.data : [];
        setAnimais(animaisData.slice(0, 8));

        const conteudoData = results[1].status === 'fulfilled' ? results[1].value.data : null;
        setConteudoHome(conteudoData);

        const parceirosData = results[2].status === 'fulfilled' && Array.isArray(results[2].value.data) ? results[2].value.data : [];
        setParceiros(parceirosData);

        if (results.some(r => r.status === 'rejected')) {
          console.error("Uma ou mais chamadas falharam:", results.filter(r => r.status === 'rejected'));
          // Mantém um erro genérico, mas poderia ser mais específico se necessário
          setError('Alguns dados não puderam ser carregados. A página pode estar incompleta.');
        }

      } catch (err) {
        console.error("Erro inesperado ao buscar dados da página inicial:", err);
        setError('Ocorreu um erro inesperado. Tente recarregar a página.');
        setAnimais([]);
        setParceiros([]);
        setConteudoHome(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []); // Executa apenas na montagem

  return (
    <>
      <Carousel />

      <main className="bg-white">
        <section className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Link href="/adote" className="block text-center bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-6 py-4 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 hover:scale-[1.02] active:scale-95 transition-all">
            Quero Adotar
          </Link>
          <Link href="/divulgar-animal" className="block text-center bg-white border-2 border-amber-800 text-amber-800 font-semibold px-6 py-4 rounded-lg shadow-md hover:bg-amber-50 hover:scale-[1.02] active:scale-95 transition-all">
            Quero divulgar um animal
          </Link>
        </section>
      </main>

      {/* Seção de Animais para Adoção */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
            Anjinhos esperando por um lar
          </h2>
          
          {loading && (
             <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em]" role="status"></div>
                <p className="mt-2 text-gray-600">A carregar animais...</p>
             </div>
          )}
          
          {/* Mostra erro apenas se não estiver carregando */}
          {error && !loading && <p className="text-center text-red-600 font-semibold py-10">{error}</p>}
          
          {!loading && !error && (
            <>
              {Array.isArray(animais) && animais.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {animais.map(animal => (
                    <AnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>
              ) : (
                 <p className="text-center text-gray-500 py-10">Nenhum animal disponível para adoção no momento.</p>
              )}
              
              {/* Mostra o botão "Ver todos" apenas se houver animais */}
              {Array.isArray(animais) && animais.length > 0 && (
                <div className="mt-12 text-center">
                  <Link href="/adote" className="inline-block bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:from-amber-800 hover:to-amber-950 hover:scale-[1.02] active:scale-95 transition-all">
                    Ver todos os animais
                  </Link>
                </div>
              )}
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
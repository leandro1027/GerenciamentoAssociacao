'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import api from '../services/api'; 
import { AnimalComunitario } from '../../types'; 
import { useDebounce } from 'use-debounce';

// --- Ícone ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Card de Animal ---
const AnimalCardComunitario = ({ animal }: { animal: AnimalComunitario }) => (
  <div className="group block bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="block relative overflow-hidden">
      <img
        src={`${api.defaults.baseURL}${animal.imageUrl}`}
        alt={`Foto de ${animal.nomeTemporario}`}
        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white drop-shadow">{animal.nomeTemporario}</h3>
      </div>
    </div>
    <div className="p-4">
      <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Localização</p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {animal.enderecoCompleto || 'Localização não informada'}
          </p>
      </div>
    </div>
  </div>
);

export default function ComunitariosPage() {
  const [animais, setAnimais] = useState<AnimalComunitario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState('');
  const [debouncedLocalizacao] = useDebounce(localizacao, 500);

  // --- NOVO: Estado para controlar a visualização (lista ou mapa) ---
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');

  // --- NOVO: Importação dinâmica do mapa ---
  const MapaGeralComunitarios = useMemo(() => dynamic(
    () => import('../components/common/MapaGeralComunitarios'),
    {
      ssr: false,
      loading: () => <div className="h-[600px] w-full flex justify-center items-center bg-gray-100 rounded-lg"><p className="text-gray-500">A carregar mapa...</p></div>
    }
  ), []);

  const fetchAnimais = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedLocalizacao) {
        params.append('search', debouncedLocalizacao);
      }
      
      // Usa a rota geral que retorna todos os dados
      const res = await api.get<AnimalComunitario[]>(`/animais-comunitarios?${params.toString()}`);
      setAnimais(res.data);
    } catch (err) {
      console.error("Erro ao buscar animais comunitários:", err);
      setError('Não foi possível carregar os animais.');
    } finally {
      setLoading(false);
    }
  }, [debouncedLocalizacao]);

  useEffect(() => {
    fetchAnimais();
  }, [fetchAnimais]);

  const handleResetFilters = () => {
    setLocalizacao('');
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="relative h-[40vh] sm:h-[50vh] bg-center bg-cover" style={{ backgroundImage: "url('/FacaParte.avif')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
            Nossos Animais Comunitários
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-2xl">
            Eles vivem em nossas ruas e praças, e também precisam do nosso cuidado. Conheça os peludos que fazem parte da nossa comunidade.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 rounded-lg shadow-md mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* --- ATUALIZADO: Campo de pesquisa e botões de visualização --- */}
            <div className="flex-grow">
              <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar por localização
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5" />
                </span>
                <input
                  id="localizacao" type="text" value={localizacao}
                  onChange={e => setLocalizacao(e.target.value)}
                  placeholder="Digite um endereço ou ponto de referência..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            
            {/* --- NOVO: Botões para alternar a visualização --- */}
            <div className="flex-shrink-0 flex items-end h-full pt-6 md:pt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${viewMode === 'lista' ? 'bg-amber-600 text-white border-amber-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('mapa')}
                  className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${viewMode === 'mapa' ? 'bg-amber-600 text-white border-amber-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- ATUALIZADO: Renderização condicional da lista ou mapa --- */}
        {loading && <p className="text-center text-gray-500">A carregar animais...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        
        {!loading && !error && (
          animais.length > 0 ? (
            <>
              {viewMode === 'lista' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
                  {animais.map(animal => (
                    <AnimalCardComunitario key={animal.id} animal={animal} />
                  ))}
                </div>
              )}
              {viewMode === 'mapa' && (
                <div className="bg-white rounded-xl shadow-lg p-2 border animate-fade-in-up">
                  <MapaGeralComunitarios animais={animais} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-100">
              <p className="mt-4 text-gray-700 font-semibold">Nenhum animal comunitário encontrado.</p>
              <p className="text-gray-500">Tente ajustar a sua pesquisa ou volte mais tarde.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
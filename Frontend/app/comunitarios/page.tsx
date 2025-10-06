'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AnimalComunitario } from '../../types'; // ATUALIZADO para o tipo correto
import { useDebounce } from 'use-debounce';
import Link from 'next/link';

// --- Ícone (sem alterações) ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Card de Animal Comunitário (CORRIGIDO) ---
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
        {/* CORRIGIDO: usa 'nomeTemporario' */}
        <h3 className="text-xl font-bold text-white drop-shadow">{animal.nomeTemporario}</h3>
      </div>
    </div>
    <div className="p-4">
      <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Localização</p>
          {/* CORRIGIDO: usa 'rua' e 'cidade' */}
          <p className="text-sm font-semibold text-gray-800">{animal.rua}, {animal.cidade}</p>
      </div>
    </div>
  </div>
);

export default function ComunitariosPage() {
  const [animais, setAnimais] = useState<AnimalComunitario[]>([]); // ATUALIZADO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [localizacao, setLocalizacao] = useState('');
  const [debouncedLocalizacao] = useDebounce(localizacao, 500);

  const fetchAnimais = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      // ATUALIZADO: o filtro agora deve procurar em 'cidade' ou 'rua'
      // O backend precisará ser ajustado para suportar essa busca
      if (debouncedLocalizacao) {
        params.append('search', debouncedLocalizacao);
      }

      // CORRIGIDO: Chama a rota correta que criamos no backend
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
      {/* --- HERO BANNER --- */}
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

      {/* --- CONTEÚDO --- */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Barra de filtros simplificada */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-grow">
              <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisar por localização
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5" />
                </span>
                <input
                  id="localizacao"
                  type="text"
                  value={localizacao}
                  onChange={e => setLocalizacao(e.target.value)}
                  placeholder="Digite uma cidade, rua ou bairro..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:ring-blue-800 focus:border-blue-800 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <button 
              onClick={handleResetFilters} 
              className="text-sm font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Limpar filtro
            </button>
          </div>
        </div>

        {/* lista de animais */}
        {loading && <p className="text-center text-gray-500">A carregar animais...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          animais.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {animais.map(animal => (
                <AnimalCardComunitario key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-100">
              <Icon path="M15.182 16.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-700 font-semibold">Nenhum animal comunitário encontrado.</p>
              <p className="text-gray-500">Tente ajustar a sua pesquisa ou volte mais tarde.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Animal, Especie, Sexo, Porte } from '../../types';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { buildImageUrl } from '@/utils/helpers'; // <-- 1. IMPORTADO AQUI

// --- Ícone ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Pílula de filtro ---
const FilterPill = ({ label, value, activeValue, onClick }: { label: string, value: string, activeValue: string, onClick: (value: string) => void }) => {
  const isActive = activeValue === value;
  return (
    <button
      onClick={() => onClick(isActive ? '' : value)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200
        ${isActive
          ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
        }`}
    >
      {label}
    </button>
  );
};

// --- Card de animal ---
const AnimalCard = ({ animal }: { animal: Animal }) => (
  <Link href={`/adote/${animal.id}`} className="group block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
    <div className="relative overflow-hidden">
      <img
        src={buildImageUrl(animal.animalImageUrl)}
        alt={`Foto de ${animal.nome}`}
        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
           e.currentTarget.src = 'https://via.placeholder.com/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
           e.currentTarget.alt = 'Imagem indisponível';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white drop-shadow">{animal.nome}</h3>
        <p className="text-sm text-gray-200">{animal.raca}</p>
      </div>
    </div>
    <div className="p-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center bg-amber-50 text-amber-800 px-2 py-1 rounded-full font-medium">
          {animal.sexo}
        </span>
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
          {animal.porte}
        </span>
      </div>
      <div className="mt-4">
        <span className="inline-block w-full text-center bg-amber-800 text-white font-semibold px-4 py-2 rounded-lg group-hover:bg-amber-900 transition-colors">
          Ver Detalhes
        </span>
      </div>
    </div>
  </Link>
);

export default function AdotePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  const [debouncedNome] = useDebounce(nome, 500);

  const fetchAnimais = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedNome) params.append('nome', debouncedNome);
      if (especie) params.append('especie', especie);
      if (sexo) params.append('sexo', sexo);
      if (porte) params.append('porte', porte);

      const res = await api.get<Animal[]>(`/animais?${params.toString()}`);
      setAnimais(res.data);
      setError(null); // Limpa o erro em caso de sucesso
    } catch (err) {
      console.error("Erro ao buscar animais:", err);
      setError('Não foi possível carregar os animais.');
    } finally {
      setLoading(false);
    }
  }, [debouncedNome, especie, sexo, porte]);

  useEffect(() => {
    fetchAnimais();
  }, [fetchAnimais]);

  const handleResetFilters = () => {
    setNome('');
    setEspecie('');
    setSexo('');
    setPorte('');
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* --- HERO BANNER --- */}
      <section className="relative h-[40vh] sm:h-[50vh] bg-center bg-cover" style={{ backgroundImage: "url('/Adote.png')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
            Adote, mude uma vida
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-2xl">
            Cada adoção é uma nova chance de amor. Conheça nossos amigos que esperam por você.
          </p>
        </div>
      </section>

      {/* --- CONTEÚDO --- */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Barra de filtros */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            {/* busca */}
            <div>
              <label htmlFor="search-animal" className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                  <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5" />
                </span>
                <input
                  id="search-animal"
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome do animal..."
                  className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-amber-800 focus:border-amber-800 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* especie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
              <div className="flex gap-2">
                <FilterPill label="Cão" value={Especie.CAO} activeValue={especie} onClick={setEspecie} />
                <FilterPill label="Gato" value={Especie.GATO} activeValue={especie} onClick={setEspecie} />
              </div>
            </div>

            {/* sexo + porte */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <div className="flex gap-2">
                     <FilterPill label="Macho" value={Sexo.MACHO} activeValue={sexo} onClick={setSexo} />
                     <FilterPill label="Fêmea" value={Sexo.FEMEA} activeValue={sexo} onClick={setSexo} />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                  <div className="flex gap-2">
                     <FilterPill label="P" value={Porte.PEQUENO} activeValue={porte} onClick={setPorte} />
                     <FilterPill label="M" value={Porte.MEDIO} activeValue={porte} onClick={setPorte} />
                     <FilterPill label="G" value={Porte.GRANDE} activeValue={porte} onClick={setPorte} />
                  </div>
               </div>
            </div>

          </div>

          <div className="flex justify-end mt-4">
            <button onClick={handleResetFilters} className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline transition-colors">
              Limpar filtros
            </button>
          </div>
        </div>

        {/* lista de animais */}
        {loading && <p className="text-center py-16 text-gray-500 font-medium">Carregando...</p>}
        {error && <p className="text-center py-16 text-red-600 font-medium">{error}</p>}
        {!loading && !error && (
          animais.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {animais.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-100">
              <Icon path="M15.182 16.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-700 font-semibold text-lg">Nenhum animal encontrado.</p>
              <p className="text-gray-500 mt-1">Tente ajustar sua pesquisa ou limpar os filtros.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
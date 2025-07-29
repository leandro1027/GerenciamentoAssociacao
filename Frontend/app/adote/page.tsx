// app/adote/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Animal, Especie, Sexo, Porte } from '../../types';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';

// --- COMPONENTES AUXILIARES PARA A UI ---

// Componente de Ícone
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Componente para os botões de filtro
const FilterPill = ({ label, value, activeValue, onClick }: { label: string, value: string, activeValue: string, onClick: (value: string) => void }) => {
  const isActive = activeValue === value;
  return (
    <button
      onClick={() => onClick(isActive ? '' : value)}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
        isActive 
          ? 'bg-amber-800 text-white border-amber-800' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
};

// Componente para o Card de cada Animal
const AnimalCard = ({ animal }: { animal: Animal }) => (
  <Link href={`/adote/${animal.id}`} className="group block bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
    <div className="relative">
      <img 
        src={`${api.defaults.baseURL}${animal.animalImageUrl}`} 
        alt={`Foto de ${animal.nome}`} 
        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white">{animal.nome}</h3>
        <p className="text-sm text-gray-200">{animal.raca}</p>
      </div>
    </div>
    <div className="p-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          <Icon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" className="w-4 h-4 mr-1.5" />
          {animal.sexo}
        </span>
        <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          <Icon path="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" className="w-4 h-4 mr-1.5" />
          {animal.porte}
        </span>
      </div>
      <div className="mt-4 text-center">
        <span className="inline-block w-full bg-amber-800 text-white font-semibold px-4 py-2 rounded-lg group-hover:bg-amber-900 transition-colors">
          Ver Detalhes
        </span>
      </div>
    </div>
  </Link>
);


// --- COMPONENTE PRINCIPAL DA PÁGINA DE ADOÇÃO ---
export default function AdotePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os filtros
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [sexo, setSexo] = useState('');
  const [porte, setPorte] = useState('');
  
  // Debounce para a pesquisa por nome
  const [debouncedNome] = useDebounce(nome, 500);

  // Função para buscar os animais com filtros
  const fetchAnimais = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedNome) params.append('nome', debouncedNome);
      if (especie) params.append('especie', especie);
      if (sexo) params.append('sexo', sexo);
      if (porte) params.append('porte', porte);

      const response = await api.get<Animal[]>(`/animais?${params.toString()}`);
      setAnimais(response.data);
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
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
            Encontre o seu Novo Amigo
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore os perfis dos nossos animais e ajude-nos a dar-lhes um lar amoroso e para sempre.
          </p>
        </header>

        {/* Secção de Filtros Redesenhada */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <label htmlFor="search-nome" className="block text-sm font-medium text-gray-800 mb-2">Pesquisar por nome</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" id="search-nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite o nome do animal..." className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 pl-10 placeholder:text-gray-400 text-gray-900" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Espécie</label>
                  <div className="flex space-x-2">
                    <FilterPill label="Cão" value={Especie.CAO} activeValue={especie} onClick={setEspecie} />
                    <FilterPill label="Gato" value={Especie.GATO} activeValue={especie} onClick={setEspecie} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Sexo</label>
                  <div className="flex space-x-2">
                    <FilterPill label="Macho" value={Sexo.MACHO} activeValue={sexo} onClick={setSexo} />
                    <FilterPill label="Fêmea" value={Sexo.FEMEA} activeValue={sexo} onClick={setSexo} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Porte</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill label="P" value={Porte.PEQUENO} activeValue={porte} onClick={setPorte} />
                    <FilterPill label="M" value={Porte.MEDIO} activeValue={porte} onClick={setPorte} />
                    <FilterPill label="G" value={Porte.GRANDE} activeValue={porte} onClick={setPorte} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleResetFilters} className="text-sm font-medium text-amber-800 hover:text-amber-900">Limpar filtros</button>
          </div>
        </div>

        {/* Grelha de Animais */}
        {loading && <p className="text-center text-gray-600">A procurar animais...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          animais.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {animais.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <Icon path="M15.182 16.182A4.5 4.5 0 0112 16.5h-1.5a4.5 4.5 0 01-4.5-4.5v-1.5a4.5 4.5 0 014.5-4.5H12a4.5 4.5 0 014.5 4.5v1.5m1.5-4.5l-1.5-1.5m0 0l-1.5 1.5m1.5-1.5V5.625m-4.5 15.75l-1.5 1.5m0 0l-1.5-1.5m1.5 1.5V18.375" className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-700 font-semibold">Nenhum animal encontrado com estes filtros.</p>
              <p className="text-gray-500 mt-2">Tente ajustar a sua pesquisa ou limpar os filtros.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

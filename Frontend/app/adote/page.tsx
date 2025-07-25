// app/adote/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Animal, Especie, Sexo, Porte } from '../../types';
import { useDebounce } from 'use-debounce';
import AnimalCard from '../components/layout/animalcard';// Importa o componente reutilizável

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
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Encontre o seu Novo Amigo
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Explore os perfis dos nossos animais e ajude-nos a dar-lhes um lar.
          </p>
        </header>

        {/* Secção de Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Pesquisa por Nome */}
                <div className="md:col-span-2">
                    <label htmlFor="search-nome" className="block text-sm font-medium text-gray-700">Pesquisar por nome</label>
                    <input type="text" id="search-nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite o nome do animal..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 placeholder:text-gray-500 text-gray-900" />
                </div>
                {/* Filtro de Espécie */}
                <div>
                    <label htmlFor="filter-especie" className="block text-sm font-medium text-gray-700">Espécie</label>
                    <select id="filter-especie" value={especie} onChange={e => setEspecie(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 ${!especie ? 'text-gray-500' : 'text-gray-900'}`}>
                        <option value="">Todas</option>
                        <option value={Especie.CAO}>Cão</option>
                        <option value={Especie.GATO}>Gato</option>
                    </select>
                </div>
                {/* Filtro de Sexo */}
                <div>
                    <label htmlFor="filter-sexo" className="block text-sm font-medium text-gray-700">Sexo</label>
                    <select id="filter-sexo" value={sexo} onChange={e => setSexo(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 ${!sexo ? 'text-gray-500' : 'text-gray-900'}`}>
                        <option value="">Todos</option>
                        <option value={Sexo.MACHO}>Macho</option>
                        <option value={Sexo.FEMEA}>Fêmea</option>
                    </select>
                </div>
                {/* Filtro de Porte */}
                <div>
                    <label htmlFor="filter-porte" className="block text-sm font-medium text-gray-700">Porte</label>
                    <select id="filter-porte" value={porte} onChange={e => setPorte(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 ${!porte ? 'text-gray-500' : 'text-gray-900'}`}>
                        <option value="">Todos</option>
                        <option value={Porte.PEQUENO}>Pequeno</option>
                        <option value={Porte.MEDIO}>Médio</option>
                        <option value={Porte.GRANDE}>Grande</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={handleResetFilters} className="text-sm font-medium text-amber-800 hover:text-amber-900">Limpar filtros</button>
            </div>
        </div>

        {/* Grelha de Animais */}
        {loading && <p className="text-center text-gray-600">A procurar animais...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          animais.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {animais.map(animal => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 font-semibold">Nenhum animal encontrado com estes filtros.</p>
              <p className="text-gray-500 mt-2">Tente ajustar a sua pesquisa.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

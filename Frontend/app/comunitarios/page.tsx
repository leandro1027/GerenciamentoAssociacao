'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import api from '../services/api';
import { AnimalComunitario } from '@/types';
import { useDebounce } from 'use-debounce';
import { buildImageUrl } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

// --- Sub-componente: Ícone ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Sub-componente: Card de Animal ---
const AnimalCardComunitario = ({
  animal,
  onCardClick,
  isAdmin
}: {
  animal: AnimalComunitario,
  onCardClick: (animal: AnimalComunitario) => void,
  isAdmin: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`group block bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isAdmin ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`}
    onClick={() => {
      if (isAdmin) onCardClick(animal);
    }}
  >
    <div className="block relative overflow-hidden">
      <img
        src={buildImageUrl(animal.imageUrl)}
        alt={`Foto de ${animal.nomeTemporario}`}
        className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x224?text=Sem+Foto'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
        <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow">{animal.nomeTemporario}</h3>
      </div>
    </div>

    {/* Mostra localização APENAS se for admin */}
    {isAdmin && (
      <div className="p-3 sm:p-4">
        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Localização</p>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2">
            {animal.enderecoCompleto || 'Localização não informada'}
          </p>
        </div>
      </div>
    )}

    {/* Placeholder para manter altura consistente para usuários comuns */}
    {!isAdmin && (
       <div className="p-3 sm:p-4 invisible">
         <div className="p-2 sm:p-3">
           <p className="text-xs font-bold uppercase mb-1">&nbsp;</p>
           <p className="text-sm font-semibold line-clamp-2">&nbsp;</p>
         </div>
       </div>
    )}
  </motion.div>
);

// --- Componente Principal da Página ---
export default function ComunitariosPage() {
  const [animais, setAnimais] = useState<AnimalComunitario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [localizacao, setLocalizacao] = useState('');
  const [debouncedLocalizacao] = useDebounce(localizacao, 500);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalComunitario | null>(null);

  // --- Atualiza isAdmin quando auth mudar ---
  useEffect(() => {
    if (!isAuthLoading && user) {
      setIsAdmin(user.role === 'ADMIN');
    } else if (!isAuthLoading && !user) {
      setIsAdmin(false);
    }
  }, [user, isAuthLoading]);

  // --- Importações Dinâmicas (Apenas para Admin) ---
  const MapaGeralComunitarios = useMemo(() => {
    if (!isAdmin) return () => null;

    return dynamic(
      () => import('../components/common/MapaGeralComunitarios'),
      {
        ssr: false,
        loading: () => (
          <div className="h-full w-full flex justify-center items-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">A carregar mapa...</p>
          </div>
        )
      }
    )
  }, [isAdmin]);

  const AnimalDetailModal = useMemo(() => {
    if (!isAdmin) return () => null;

    return dynamic(
      () => import('../components/common/AnimalDetailModal'),
      {
        ssr: false,
        loading: () => (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6">
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        )
      }
    )
  }, [isAdmin]);

  // --- Função para buscar animais ---
  const fetchAnimais = useCallback(async () => {
    if (isAuthLoading) {
      console.log('Auth ainda carregando...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isUserAdmin = user?.role === 'ADMIN';
      
      // Define endpoint baseado no tipo de usuário
      let endpoint = '/animais/comunitarios';
      
      if (isUserAdmin) {
        endpoint = '/animais/comunitarios/admin';
        
        // Adiciona parâmetro de busca apenas se houver valor
        if (debouncedLocalizacao && debouncedLocalizacao.trim() !== '') {
          endpoint += `?search=${encodeURIComponent(debouncedLocalizacao.trim())}`;
        }
      }

      console.log('🔄 Fazendo requisição para:', endpoint);

      const res = await api.get<AnimalComunitario[]>(endpoint);
      setAnimais(res.data);
      
    } catch (err: any) {
      console.error("❌ Erro detalhado ao buscar animais comunitários:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // Mensagens de erro específicas
      if (err.response?.status === 400) {
        setError('Parâmetros de pesquisa inválidos. Tente limpar o filtro.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Você não tem permissão para acessar esta funcionalidade.');
      } else if (err.response?.status === 404) {
        setError('Recurso não encontrado. Verifique a configuração do servidor.');
      } else {
        setError('Não foi possível carregar os animais. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedLocalizacao, user, isAuthLoading]);

  // --- Efeito para buscar animais ---
  useEffect(() => {
    fetchAnimais();
  }, [fetchAnimais]);

  // --- Reset de filtros ---
  const handleResetFilters = () => {
    setLocalizacao('');
  };

  const isLoading = loading || isAuthLoading;

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] bg-center bg-cover" style={{ backgroundImage: "url('/FacaParte.avif')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-2 sm:mb-4">
            Nossos Animais Comunitários
          </h1>
          <p className="text-sm sm:text-lg md:text-xl max-w-2xl px-2">
            Eles vivem em nossas ruas e praças. Conheça os peludos que fazem parte da nossa comunidade.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 md:py-10 px-3 sm:px-4 lg:px-8">

        {/* Barra de Filtros (Apenas Admin) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="flex-grow">
                <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700 mb-1">
                  Pesquisar por localização (Admin)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <input
                    id="localizacao"
                    type="text"
                    value={localizacao}
                    onChange={e => setLocalizacao(e.target.value)}
                    placeholder="Digite um endereço ou ponto de referência..."
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-md border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                onClick={handleResetFilters}
                disabled={isLoading}
                className="text-sm font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap px-3 sm:px-4 py-2 rounded-md hover:bg-amber-50 transition-colors border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpar filtro
              </button>
            </div>
          </motion.div>
        )}

        {/* Botão para Abrir o Mapa Geral (Apenas Admin) */}
        {isAdmin && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 sm:mb-8 flex justify-center"
          >
            <button
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform hover:scale-105 w-full sm:w-auto justify-center"
            >
                <Icon path="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3" />
                <span className="text-center">Visualizar mapeamento (Admin)</span>
            </button>
          </motion.div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && (
           <div className="text-center py-8 sm:py-10">
             <div className="inline-flex items-center gap-3 text-gray-500">
               <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent"></div>
               <p className="text-sm sm:text-base">Carregando animais...</p>
             </div>
           </div>
        )}

        {/* Estado de Erro */}
        {error && !isLoading && (
           <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg mx-2 sm:mx-0">
             <p className="font-medium">{error}</p>
             <button
               onClick={fetchAnimais}
               className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
             >
               Tentar novamente
             </button>
           </div>
        )}

        {/* Lista de Animais */}
        {!isLoading && !error && (
          animais.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
              {animais.map(animal => (
                <AnimalCardComunitario
                  key={animal.id}
                  animal={animal}
                  onCardClick={setSelectedAnimal}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-md border mx-2 sm:mx-0">
               <div className="max-w-md mx-auto">
                 <Icon
                   path="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
                   className="w-16 h-16 text-gray-400 mx-auto mb-4"
                 />
                 <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum animal comunitário encontrado!</p>
                 <p className="text-gray-500 text-sm sm:text-base">
                   {debouncedLocalizacao && isAdmin
                     ? "Tente ajustar os termos da sua pesquisa."
                     : "Volte mais tarde para conhecer nossos animais comunitários."
                   }
                 </p>
                 {debouncedLocalizacao && isAdmin && (
                   <button
                     onClick={handleResetFilters}
                     className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm"
                   >
                     Limpar pesquisa
                   </button>
                 )}
               </div>
             </div>
          )
        )}
      </div>

      {/* Modais (Apenas Admin) */}
      {isAdmin && isMapModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4 animate-fade-in"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-6xl h-[85vh] sm:h-[90vh] p-3 sm:p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 pr-2">
                Mapeamento de Animais Comunitários
              </h2>
              <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="p-1 sm:p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors flex-shrink-0"
              >
                  <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="flex-grow h-full min-h-0">
                <MapaGeralComunitarios animais={animais} />
            </div>
          </div>
        </div>
      )}

      {isAdmin && selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </main>
  );
}
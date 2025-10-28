'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import api from '../services/api';
import { AnimalComunitario } from '@/types';
import { useDebounce } from 'use-debounce';
import { buildImageUrl } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3 }}
    className={`group relative bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg border border-amber-100 ${
      isAdmin ? 'cursor-pointer' : 'cursor-default'
    }`}
    onClick={() => {
      if (isAdmin) onCardClick(animal);
    }}
  >
    <div className="relative overflow-hidden">
      <img
        src={buildImageUrl(animal.imageUrl)}
        alt={`Foto de ${animal.nomeTemporario}`}
        className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x224?text=Sem+Foto'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-amber-900/10 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white drop-shadow-md">{animal.nomeTemporario}</h3>
      </div>
      {isAdmin && (
        <div className="absolute top-3 right-3">
          <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Admin
          </span>
        </div>
      )}
    </div>

    {isAdmin && (
      <div className="p-4">
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800 uppercase mb-1">Localização</p>
              <p className="text-sm text-amber-900 line-clamp-2">
                {animal.enderecoCompleto || 'Localização não informada'}
              </p>
            </div>
          </div>
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
          <div className="h-full w-full flex justify-center items-center bg-amber-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
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
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent mx-auto"></div>
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
      
      let endpoint = '/animais-comunitarios';
      
      if (isUserAdmin) {
        endpoint = '/animais/comunitarios/admin';
        
        if (debouncedLocalizacao && debouncedLocalizacao.trim() !== '') {
          endpoint += `?search=${encodeURIComponent(debouncedLocalizacao.trim())}`;
        }
      }

      console.log('🔄 Fazendo requisição para:', endpoint);

      const res = await api.get<AnimalComunitario[]>(endpoint);
      setAnimais(res.data);
      
    } catch (err: any) {
      console.error("❌ Erro detalhado ao buscar animais comunitários:", err);
      
      if (err.response?.status === 400) {
        setError('Parâmetros de pesquisa inválidos. Tente limpar o filtro.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Você não tem permissão para acessar esta funcionalidade.');
      } else if (err.response?.status === 404) {
        setError('Recurso não encontrado.');
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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-25">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-amber-700 py-16 sm:py-20">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Animais Comunitários
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl text-amber-100 max-w-3xl mx-auto"
          >
            Conheça os peludos que fazem parte da nossa comunidade
          </motion.p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Barra de Filtros (Apenas Admin) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-grow">
                <label htmlFor="localizacao" className="block text-sm font-semibold text-amber-900 mb-2">
                  Pesquisar por localização
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-amber-500">
                    <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="w-5 h-5" />
                  </span>
                  <input
                    id="localizacao"
                    type="text"
                    value={localizacao}
                    onChange={e => setLocalizacao(e.target.value)}
                    placeholder="Digite um endereço ou ponto de referência..."
                    className="w-full pl-10 pr-4 py-3 text-base rounded-xl border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-amber-900 placeholder-amber-400 bg-amber-50/50"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                onClick={handleResetFilters}
                disabled={isLoading || !localizacao}
                className="px-6 py-3 rounded-xl font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-100 transition-colors border border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Limpar
              </button>
            </div>
          </motion.div>
        )}

        {/* Botão para Abrir o Mapa Geral (Apenas Admin) */}
        {isAdmin && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Icon path="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3" className="w-5 h-5" />
              Visualizar Mapa Geral
            </button>
          </motion.div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-amber-600 border-t-transparent"></div>
              <p className="text-amber-700 font-medium">Carregando animais comunitários...</p>
            </div>
          </div>
        )}

        {/* Estado de Erro */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto"
          >
            <Icon
              path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              className="w-12 h-12 text-red-500 mx-auto mb-4"
            />
            <p className="text-red-700 font-semibold text-lg mb-2">{error}</p>
            <button
              onClick={fetchAnimais}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Tentar novamente
            </button>
          </motion.div>
        )}

        {/* Lista de Animais */}
        {!isLoading && !error && (
          animais.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {animais.map((animal, index) => (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimalCardComunitario
                    animal={animal}
                    onCardClick={setSelectedAnimal}
                    isAdmin={isAdmin}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white rounded-2xl shadow-sm border border-amber-200 py-16 px-8"
            >
              <Icon
                path="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
                className="w-16 h-16 text-amber-400 mx-auto mb-4"
              />
              <h3 className="text-amber-800 font-bold text-xl mb-2">
                Nenhum animal encontrado
              </h3>
              <p className="text-amber-600 mb-4">
                {debouncedLocalizacao && isAdmin
                  ? "Tente ajustar os termos da sua pesquisa."
                  : "Volte mais tarde para conhecer nossos animais comunitários."
                }
              </p>
              {debouncedLocalizacao && isAdmin && (
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                  Limpar pesquisa
                </button>
              )}
            </motion.div>
          )
        )}
      </div>

      {/* Modal do Mapa (Apenas Admin) */}
      <AnimatePresence>
        {isAdmin && isMapModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={() => setIsMapModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-amber-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-amber-900">
                  Mapa de Animais Comunitários
                </h2>
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="p-2 rounded-full text-amber-500 hover:bg-amber-100 transition-colors"
                >
                  <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow h-full min-h-0 p-2">
                {MapaGeralComunitarios && <MapaGeralComunitarios animais={animais} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Animal (Apenas Admin) */}
      <AnimatePresence>
        {isAdmin && selectedAnimal && (
          <AnimalDetailModal
            animal={selectedAnimal}
            onClose={() => setSelectedAnimal(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
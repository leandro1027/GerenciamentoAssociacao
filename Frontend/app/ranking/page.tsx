'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Usuario, UsuarioConquista, Conquista } from '../../types';
import { Trophy, X, Star, Calendar, CheckCircle } from 'lucide-react';

// CORREÇÃO: Definir RankingUser com id como string
type RankingUser = {
  id: string;
  nome: string;
  pontos: number;
  profileImageUrl?: string;
};

type Configuracao = {
  gamificacaoAtiva: boolean;
};

type UsuarioConquistaComDetalhes = UsuarioConquista & {
  conquista: Conquista;
};

// MODAL DE CONQUISTAS
function ConquistasModal({ 
  isOpen, 
  onClose, 
  userId,
  userName 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  userId: string;
  userName: string;
}) {
  const [conquistas, setConquistas] = useState<UsuarioConquistaComDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConquistas = useCallback(async () => {
    if (!isOpen || !userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<UsuarioConquistaComDetalhes[]>(`/gamificacao/usuario/${userId}/conquistas`);
      setConquistas(response.data);
    } catch (err) {
      console.error("Erro ao buscar conquistas:", err);
      setError("Não foi possível carregar as conquistas deste usuário.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchConquistas();
    }
  }, [fetchConquistas, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Conquistas de {userName}</h2>
                  <p className="text-amber-100 mt-1">Medalhas e reconhecimentos conquistados</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando conquistas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
                  <button 
                    onClick={fetchConquistas}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : conquistas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conquistas.map((userConquista, index) => (
                    <motion.div
                      key={userConquista.conquista.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Medalha */}
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto flex items-center justify-center">
                          <img 
                            src={`/icones-recompensas/${userConquista.conquista.icone}`} 
                            alt={userConquista.conquista.nome}
                            className="w-16 h-16 object-contain filter drop-shadow-lg"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/64/4a5568/ffffff?text=${userConquista.conquista.nome.charAt(0)}`;
                            }}
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg border-2 border-white">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Informações */}
                      <h3 className="font-bold text-gray-800 text-lg mb-2">
                        {userConquista.conquista.nome}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {userConquista.conquista.descricao}
                      </p>

                      {/* Data */}
                      <div className="flex items-center justify-center gap-2 text-amber-700 bg-white/80 px-3 py-2 rounded-lg border border-amber-200">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {new Date(userConquista.dataDeGanho).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhuma conquista ainda
                  </h3>
                  <p className="text-gray-500">
                    {userName} ainda não desbloqueou nenhuma conquista.
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="border-t border-amber-200 p-4 bg-amber-50">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">
                  {conquistas.length} conquistas desbloqueadas
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente para a posição no ranking com cores diferenciadas
function RankPosition({ index }: { index: number }) {
  const getRankStyle = () => {
    switch (index) {
      case 0: // Primeiro lugar
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
          text: 'text-white',
          shadow: 'shadow-lg shadow-amber-200'
        };
      case 1: // Segundo lugar
        return {
          bg: 'bg-gradient-to-br from-amber-300 to-amber-500',
          text: 'text-white',
          shadow: 'shadow-lg shadow-amber-200'
        };
      case 2: // Terceiro lugar
        return {
          bg: 'bg-gradient-to-br from-amber-200 to-amber-400',
          text: 'text-amber-900',
          shadow: 'shadow-lg shadow-amber-200'
        };
      default:
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          shadow: 'shadow-sm'
        };
    }
  };

  const style = getRankStyle();

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${style.bg} ${style.text} ${style.shadow} transition-all duration-300`}>
      {index + 1}º
    </div>
  );
}

// Componente para o avatar do usuário
function UserAvatar({ src, name, index }: { src: string; name: string; index: number }) {
  const getBorderStyle = () => {
    switch (index) {
      case 0: return 'border-2 border-amber-400 shadow-lg shadow-amber-200';
      case 1: return 'border-2 border-amber-300 shadow-lg shadow-amber-200';
      case 2: return 'border-2 border-amber-200 shadow-lg shadow-amber-200';
      default: return 'border-2 border-amber-100 shadow-sm';
    }
  };

  return (
    <motion.img
      whileHover={{ scale: 1.05 }}
      src={src}
      alt={`Foto de ${name}`}
      className={`w-14 h-14 rounded-full object-cover bg-amber-100 transition-all duration-300 ${getBorderStyle()}`}
      onError={(e) => {
        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff&bold=true&size=128`;
      }}
    />
  );
}

// Componente para o card de ranking ATUALIZADO
function RankingCard({ 
  user, 
  index, 
  onUserClick 
}: { 
  user: RankingUser; 
  index: number;
  onUserClick: (userId: string, userName: string) => void;
}) {
  const avatarSrc = user.profileImageUrl
    ? `${api.defaults.baseURL}${user.profileImageUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=f59e0b&color=fff&bold=true`;

  const getCardStyle = () => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-amber-50/80 to-amber-100/60 border-l-4 border-l-amber-400 shadow-lg cursor-pointer';
      case 1:
        return 'bg-gradient-to-r from-amber-50/80 to-amber-100/60 border-l-4 border-l-amber-300 shadow-md cursor-pointer';
      case 2:
        return 'bg-gradient-to-r from-amber-50/80 to-amber-100/60 border-l-4 border-l-amber-200 shadow-md cursor-pointer';
      default:
        return 'bg-white hover:bg-amber-50/80 border-l-4 border-l-transparent cursor-pointer';
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: index < 3 ? 1.02 : 1.01,
        transition: { duration: 0.2 }
      }}
      className={`p-6 flex items-center justify-between transition-all duration-300 rounded-xl mb-3 ${getCardStyle()}`}
      onClick={() => onUserClick(user.id, user.nome)}
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <RankPosition index={index} />
        <UserAvatar src={avatarSrc} name={user.nome} index={index} />
        <div className="flex-1 min-w-0">
          <motion.p 
            className="text-xl font-bold text-gray-900 truncate"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {user.nome}
          </motion.p>
          {index < 3 && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="text-sm font-semibold text-amber-600"
            >
              {index === 0 ? '🏆 Campeão' : index === 1 ? '🥈 Vice-campeão' : '🥉 Terceiro lugar'}
            </motion.span>
          )}
        </div>
      </div>
      <motion.div 
        className="flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
          {user.pontos} pts
        </span>
        {/* Ícone de troféu para indicar que é clicável */}
        <motion.div
          whileHover={{ rotate: 15 }}
          className="text-amber-500 opacity-60 hover:opacity-100 transition-opacity"
        >
          <Trophy className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </motion.li>
  );
}

// Componente Skeleton para loading
function RankingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-200">
      {[...Array(7)].map((_, index) => (
        <div key={index} className="p-6 flex items-center justify-between border-b border-amber-200 last:border-b-0">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-12 h-12 rounded-full bg-amber-200 animate-pulse"></div>
            <div className="w-10 h-10 rounded-full bg-amber-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-amber-200 rounded animate-pulse w-3/4"></div>
              {index < 3 && <div className="h-4 bg-amber-200 rounded animate-pulse w-1/3"></div>}
            </div>
          </div>
          <div className="w-20 h-8 bg-amber-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

// Componente para as estatísticas
function StatisticsCards({ ranking }: { ranking: RankingUser[] }) {
  const stats = {
    totalContributors: ranking.length,
    totalPoints: ranking.reduce((total, user) => total + user.pontos, 0),
    topScore: ranking[0]?.pontos || 0,
    averagePoints: ranking.length > 0 ? Math.round(ranking.reduce((total, user) => total + user.pontos, 0) / ranking.length) : 0
  };

  const statCards = [
    {
      title: 'Total de Contribuidores',
      value: stats.totalContributors,
      icon: '👥',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Pontos Totais',
      value: stats.totalPoints.toLocaleString(),
      icon: '⭐',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Maior Pontuação',
      value: stats.topScore.toLocaleString(),
      icon: '🏆',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Média de Pontos',
      value: stats.averagePoints.toLocaleString(),
      icon: '📊',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border ${stat.borderColor} backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-amber-700 text-sm mt-2 font-medium">{stat.title}</p>
            </div>
            <motion.div 
              className="text-4xl"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {stat.icon}
            </motion.div>
          </div>
          <motion.div 
            className={`h-1 mt-4 bg-gradient-to-r ${stat.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function RankingPage() {
  const [isGamificationActive, setIsGamificationActive] = useState(false);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o modal de conquistas
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const fetchRankingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timestamp = new Date().getTime();
      
      const configRes = await api.get<Configuracao>(`/configuracao?t=${timestamp}`);
      setIsGamificationActive(configRes.data.gamificacaoAtiva);
      
      if (configRes.data.gamificacaoAtiva) {
        const rankingRes = await api.get<RankingUser[]>(`/usuario/ranking?t=${timestamp}`);
        // CORREÇÃO: Garantir que os IDs sejam strings
        const rankingData = rankingRes.data.map(user => ({
          ...user,
          id: user.id.toString() // Converter para string
        }));
        setRanking(rankingData);
      } else {
        setRanking([]);
      }
      
    } catch (err) {
      console.error("Erro ao buscar dados do ranking:", err);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUserClick = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);


  if (isLoading) {
    return (
      <main className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent mb-4">
              🏆 Ranking de Contribuidores
            </h1>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto">
              Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.
            </p>
          </motion.div>
          <RankingSkeleton />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent mb-4">
              🏆 Ranking de Contribuidores
            </h1>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-amber-200 p-12 text-center"
          >
            <div className="text-8xl mb-6">❌</div>
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Erro ao Carregar</h2>
            <p className="text-amber-700 text-lg mb-8 max-w-md mx-auto">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRankingData}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🔄 Tentar Novamente
            </motion.button>
          </motion.div>
        </div>
      </main>
    );
  }

  if (!isGamificationActive) {
    return (
      <main className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent mb-4">
              🏆 Ranking de Contribuidores
            </h1>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-amber-200 p-12 text-center"
          >
            <motion.div 
              className="text-8xl mb-6"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔒
            </motion.div>
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Gamificação Desativada</h2>
            <p className="text-amber-700 text-lg mb-8 max-w-md mx-auto">
              O sistema de ranking está temporariamente desativado. 
              Entre em contato com o administrador para mais informações.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRankingData}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🔍 Verificar Status
            </motion.button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent mb-4">
              🏆 Ranking de Contribuidores
            </h1>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto leading-relaxed">
              Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.
            </p>
            <p className="text-amber-600 mt-2 text-sm">
              Clique em um usuário para ver suas conquistas
            </p>
          </motion.div>

          {/* Estatísticas */}
          <StatisticsCards ranking={ranking} />

          {/* Ranking */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden"
          >
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-800">Top Contribuidores</h2>
                <motion.div 
                  className="flex items-center gap-2 text-sm text-amber-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
                    {ranking.length} participantes
                  </span>
                </motion.div>
              </div>
              
              <AnimatePresence mode="popLayout">
                {ranking.length > 0 ? (
                  <ul className="space-y-4">
                    {ranking.map((user, index) => (
                      <RankingCard 
                        key={user.id} 
                        user={user} 
                        index={index} 
                        onUserClick={handleUserClick}
                      />
                    ))}
                  </ul>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-amber-700 mb-2">Ranking Vazio</h3>
                    <p className="text-amber-600 max-w-md mx-auto">
                      Ainda não há pontuações para exibir. Seja o primeiro a contribuir e entre para o hall da fama!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12 text-amber-600"
          >
          </motion.div>
        </div>
      </main>

      {/* Modal de Conquistas */}
      <ConquistasModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        userId={selectedUser?.id || ''}
        userName={selectedUser?.name || ''}
      />
    </>
  );
}
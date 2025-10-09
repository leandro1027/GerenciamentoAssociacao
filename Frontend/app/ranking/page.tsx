// Ficheiro: /app/ranking/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Importamos o 'api' para usar a baseURL
import { Usuario } from '../../types';   

type RankingUser = Pick<Usuario, 'id' | 'nome' | 'pontos' | 'profileImageUrl'>;

type Configuracao = {
  gamificacaoAtiva: boolean;
};

// Componente MedalIcon (mantido para referência futura)
// function MedalIcon({ rank }: { rank: number }) {
//   if (rank === 1) return <span className="text-2xl">🥇</span>;
//   if (rank === 2) return <span className="text-2xl">🥈</span>;
//   if (rank === 3) return <span className="text-2xl">🥉</span>;
//   return null;
// }

export default function RankingPage() {
  const [isGamificationActive, setIsGamificationActive] = useState(false);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timestamp = new Date().getTime();
      
      // Primeiro busca a configuração
      const configRes = await api.get<Configuracao>(`/configuracao?t=${timestamp}`);
      
      setIsGamificationActive(configRes.data.gamificacaoAtiva);
      
      // 🔥 SOLUÇÃO: Só busca o ranking se a gamificação estiver ativa
      if (configRes.data.gamificacaoAtiva) {
        const rankingRes = await api.get<RankingUser[]>(`/usuario/ranking?t=${timestamp}`);
        setRanking(rankingRes.data);
      } else {
        setRanking([]); // Limpa o ranking se gamificação estiver desativada
      }
      
    } catch (err) {
      console.error("Erro ao buscar dados do ranking:", err);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  // Loading state
  if (isLoading) {
    return (
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">🏆 Ranking de Contribuidores 🏆</h1>
            <p className="mt-2 text-gray-600">Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border p-8 text-center">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">🏆 Ranking de Contribuidores 🏆</h1>
            <p className="mt-2 text-gray-600">Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao Carregar</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchRankingData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 🔥 Gamificação desativada state
  if (!isGamificationActive) {
    return (
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">🏆 Ranking de Contribuidores 🏆</h1>
            <p className="mt-2 text-gray-600">Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border p-8 text-center">
            <div className="text-yellow-500 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gamificação Desativada</h2>
            <p className="text-gray-600 mb-4">
              O sistema de ranking está temporariamente desativado. 
              Entre em contato com o administrador para mais informações.
            </p>
            <button
              onClick={fetchRankingData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Verificar Status
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Normal state - Ranking ativo
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">🏆 Ranking de Contribuidores 🏆</h1>
          <p className="mt-2 text-gray-600">Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
          <ul role="list" className="divide-y divide-gray-200">
            {ranking.map((user, index) => {
              const avatarSrc = user.profileImageUrl
                ? `${api.defaults.baseURL}${user.profileImageUrl}`
                : `https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}&background=0284c7&color=fff`;

              return (
                <li key={user.id} className={`p-4 flex items-center justify-between transition-colors ${index < 3 ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-400 w-8 text-center">{index + 1}º</span>
                    <img
                      src={avatarSrc}
                      alt={`Foto de ${user.nome}`}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover bg-gray-100"
                      onError={(e) => {
                        // Fallback para caso a imagem não carregue
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}&background=0284c7&color=fff`;
                      }}
                    />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{user.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {/* <MedalIcon rank={index + 1} /> */}
                     <p className="text-xl font-bold text-amber-600">{user.pontos} pts</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        {ranking.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Ainda não há pontuações para exibir. Seja o primeiro a contribuir!</p>
        )}
      </div>
    </main>
  );
}
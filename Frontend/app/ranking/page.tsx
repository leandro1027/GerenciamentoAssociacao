// Ficheiro: /app/ranking/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Importamos o 'api' para usar a baseURL
import { Usuario } from '../../types';   

type RankingUser = Pick<Usuario, 'id' | 'nome' | 'pontos' | 'profileImageUrl'>;

type Configuracao = {
  gamificacaoAtiva: boolean;
};

// ... (Componente MedalIcon sem alterações)

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
      const [configRes, rankingRes] = await Promise.all([
        api.get<Configuracao>(`/configuracao?t=${timestamp}`),
        api.get<RankingUser[]>(`/usuario/ranking?t=${timestamp}`),
      ]);
      
      setIsGamificationActive(configRes.data.gamificacaoAtiva);
      setRanking(rankingRes.data);
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

  // ... (JSX para isLoading, !isGamificationActive, e error sem alterações)

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
              // --- LÓGICA DA IMAGEM ATUALIZADA AQUI ---
              const avatarSrc = user.profileImageUrl
                ? `${api.defaults.baseURL}${user.profileImageUrl}` // Junta o endereço do backend com o caminho da imagem
                : `https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}&background=0284c7&color=fff`; // Fallback

              return (
                <li key={user.id} className={`p-4 flex items-center justify-between transition-colors ${index < 3 ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-400 w-8 text-center">{index + 1}º</span>
                    <img
                      src={avatarSrc} // --- USA A VARIÁVEL CORRIGIDA ---
                      alt={`Foto de ${user.nome}`}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover bg-gray-100"
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
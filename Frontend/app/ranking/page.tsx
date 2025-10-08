// Ficheiro: /app/ranking/page.tsx

import api from '../services/api';// Ajuste o caminho para o seu ficheiro de API
import { Usuario } from '../../types';   // Ajuste o caminho para o seu ficheiro de tipos

// --- Tipos de Dados para a Página ---
type RankingUser = Pick<Usuario, 'id' | 'nome' | 'pontos'> & {
  profileImageUrl?: string; 
};

type Configuracao = {
  gamificacaoAtiva: boolean;
};


// --- Função para Buscar os Dados no Servidor ---
async function getRankingData() {
  try {
    // --- ATUALIZADO: Adicionados headers para evitar cache ---
    const cacheBustingHeaders = {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    // Fazemos as duas chamadas à API em paralelo, agora com os headers
    const [configRes, rankingRes] = await Promise.all([
      api.get<Configuracao>('/configuracao', { headers: cacheBustingHeaders }),
      api.get<RankingUser[]>('/usuarios/ranking', { headers: cacheBustingHeaders }),
    ]);

    return {
      isGamificationActive: configRes.data.gamificacaoAtiva,
      ranking: rankingRes.data,
      error: null,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do ranking:", error);
    return {
      isGamificationActive: false,
      ranking: [],
      error: "Não foi possível carregar os dados do ranking. Tente novamente mais tarde.",
    };
  }
}

// --- Componente para o Ícone de Medalha ---
const MedalIcon = ({ rank }: { rank: number }) => {
  const colors: Record<number, string> = {
    1: 'text-yellow-400', // Ouro
    2: 'text-gray-400',  // Prata
    3: 'text-orange-400' // Bronze
  };

  if (!colors[rank]) return null;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 ${colors[rank]}`}>
      <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 01-1.062 0L10 1.063.75 10.313a.75.75 0 01-1.062-1.062l10-10a.75.75 0 011.062 0l5.562 5.562zM8.562 6.563a.75.75 0 011.062 0l5.25 5.25a.75.75 0 11-1.062 1.062L10 8.687l-3.75 3.75a.75.75 0 01-1.062-1.062l4.313-4.313z" clipRule="evenodd" />
    </svg>
  );
};


// --- Componente Principal da Página (Server Component) ---
export default async function RankingPage() {
  const { isGamificationActive, ranking, error } = await getRankingData();

  // 1. Renderização condicional: Se a gamificação estiver DESATIVADA
  if (!isGamificationActive) {
    return (
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto py-10 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Ranking de Contribuidores</h1>
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
            <p className="text-yellow-800 font-semibold">
              O sistema de gamificação está desativado no momento.
            </p>
            <p className="text-yellow-700 mt-1">Esta página só fica disponível quando a funcionalidade está ativa no painel de administração.</p>
          </div>
        </div>
      </main>
    );
  }

  // 2. Renderização condicional: Se ocorrer um erro na busca de dados
  if (error) {
    return (
        <main className="max-w-4xl mx-auto py-10 px-4 text-center">
            <p className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</p>
        </main>
    );
  }

  // 3. Renderização principal: A página de ranking
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in-down">
          <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">🏆 Ranking de Contribuidores 🏆</h1>
          <p className="mt-2 text-gray-600">Obrigado a todos que ajudam a nossa causa! Estes são os nossos maiores heróis.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border animate-fade-in-up">
          <ul role="list" className="divide-y divide-gray-200">
            {ranking.map((user: RankingUser, index: number) => (
              <li key={user.id} className={`p-4 flex items-center justify-between transition-colors ${index < 3 ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-400 w-8 text-center">{index + 1}º</span>
                  {/* Se você tiver avatares, pode usar uma lógica parecida com esta: */}
                  {/* <img className="h-12 w-12 rounded-full object-cover" src={user.profileImageUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profileImageUrl}` : `https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}`} alt={`Foto de ${user.nome}`} /> */}
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{user.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <MedalIcon rank={index + 1} />
                   <p className="text-xl font-bold text-amber-600">{user.pontos} pts</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {ranking.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Ainda não há pontuações para exibir. Seja o primeiro a contribuir!</p>
        )}
      </div>
    </main>
  );
}
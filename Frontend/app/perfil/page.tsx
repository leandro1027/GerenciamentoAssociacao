'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Doacao, Voluntario, Usuario, Adocao, Conquista, UsuarioConquista, StatusAdocao } from '../../types'; // Adicionado StatusAdocao
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Camera, Clock, ChevronDown, Star, Trophy, Gift, Heart, Clipboard, User, Lock, Home, Calendar, CheckCircle, XCircle, HelpCircle } from 'lucide-react'; // Adicionado HelpCircle
import axios from 'axios';

type ProfileView = 'overview' | 'edit_profile' | 'change_password' | 'meus_pedidos' | 'gamification' | 'login_history';

// TIPO PARA CONQUISTAS COM DETALHES
type UsuarioConquistaComDetalhes = UsuarioConquista & {
  conquista: Conquista;
};

// TIPO PARA O HISTÓRICO DE LOGIN
type LoginHistoryItem = {
  data: Date;
  status: 'completed' | 'missed';
};

// --- FUNÇÃO AUXILIAR PARA CONSTRUIR URLS DE IMAGEM --- CORRIGIDA ---
const buildImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/150/4a5568/ffffff?text=Sem+Imagem';
  }

  // Se já for uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove a barra inicial se existir
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // Constrói a URL usando o domínio público do R2
  const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

  if (!r2Domain) {
    console.warn('NEXT_PUBLIC_R2_PUBLIC_DOMAIN não está definido');
    return 'https://via.placeholder.com/150/4a5568/ffffff?text=Erro+Config';
  }

  // Garante que a URL seja construída corretamente
  return `${r2Domain.replace(/\/$/, '')}/${cleanPath}`;
};
// --- ÍCONES PERSONALIZADOS ---
const CustomIcon = ({ icon: Icon, className = "h-6 w-6" }: { icon: any; className?: string }) => (
  <Icon className={className} />
);

const ICONS = {
  dashboard: <CustomIcon icon={Home} />,
  user: <CustomIcon icon={User} />,
  lock: <CustomIcon icon={Lock} />,
  gift: <CustomIcon icon={Gift} className="h-8 w-8 text-amber-600" />,
  heart: <CustomIcon icon={Heart} className="h-8 w-8 text-amber-600" />,
  camera: <CustomIcon icon={Camera} className="h-5 w-5" />,
  clipboard: <CustomIcon icon={Clipboard} />,
  star: <CustomIcon icon={Star} className="h-8 w-8 text-amber-500" />,
  trophy: <CustomIcon icon={Trophy} className="h-6 w-6" />,
  calendar: <CustomIcon icon={Calendar} className="h-6 w-6" />,
};

// --- HOOK PARA DADOS DO PERFIL ---
const useProfileData = (user: Usuario | null) => {
  const [profileData, setProfileData] = useState({
    donationCount: 0,
    volunteerStatus: null as string | null,
    pedidos: [] as Adocao[], // Pedidos agora incluem o animal com isFromDivulgacao
    conquistas: [] as UsuarioConquistaComDetalhes[],
    isGamificationActive: false,
    isLoading: true
  });

  useEffect(() => {
    if (!user) {
      setProfileData(prev => ({ ...prev, isLoading: false })); // Para loading se não houver usuário
      return;
    }

    const fetchProfileData = async () => {
      setProfileData(prev => ({ ...prev, isLoading: true })); // Inicia loading
      try {
        const configRes = await api.get<{ gamificacaoAtiva: boolean }>('/configuracao');
        const gamificacaoAtiva = configRes.data.gamificacaoAtiva;

        // Fetch other data in parallel
        const [donationsRes, volunteerRes, adocoesRes] = await Promise.all([
          api.get<Doacao[]>('/doacao'), // Assuming this fetches ALL donations, filter later
          api.get<Voluntario | null>('/voluntario/meu-status'),
          api.get<Adocao[]>('/adocoes/meus-pedidos'), // This endpoint should return adoptions WITH animal details including isFromDivulgacao
        ]);

        let conquistasData: UsuarioConquistaComDetalhes[] = [];
        if (gamificacaoAtiva) {
          try {
            const conquistasRes = await api.get<UsuarioConquistaComDetalhes[]>('/gamificacao/minhas-conquistas');
            conquistasData = conquistasRes.data;
          } catch (gamificationError) {
            console.error("ERRO CRÍTICO ao buscar dados de gamificação:", gamificationError);
            toast.error('Não foi possível carregar suas conquistas e pontuação.');
          }
        }

        const userDonations = donationsRes.data.filter(d => d.usuarioId === user.id);

        setProfileData({
          donationCount: userDonations.length,
          volunteerStatus: volunteerRes.data?.status || null,
          pedidos: adocoesRes.data, // Assume adocoesRes.data includes animal with isFromDivulgacao
          conquistas: conquistasData,
          isGamificationActive: gamificacaoAtiva,
          isLoading: false
        });

      } catch (error: any) {
        console.error("Erro crítico ao buscar dados do perfil:", error);
        if (error.response?.status !== 403 && error.response?.status !== 401) { // Avoid redundant toasts on auth errors
          toast.error('Não foi possível carregar os dados do perfil.');
        }
        setProfileData(prev => ({ ...prev, isLoading: false, isGamificationActive: false })); // Stop loading on error
      }
    };

    fetchProfileData();
  }, [user]); // Re-fetch when user changes

  return profileData;
};


// --- HOOK PARA VALIDAÇÃO ---
const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProfile = (data: { nome: string; email: string; telefone: string }) => {
    const newErrors: Record<string, string> = {};

    if (!data.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (data.nome.length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação de telefone mais flexível
    if (data.telefone && !/^[\d\s()+-]*$/.test(data.telefone.trim())) {
        newErrors.telefone = 'Telefone inválido (use apenas números, espaços, (), +, -)';
    } else if (data.telefone && data.telefone.replace(/\D/g, '').length < 8) {
        newErrors.telefone = 'Telefone parece curto demais';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (data: { senhaAtual: string; novaSenha: string }) => {
    const newErrors: Record<string, string> = {};

    if (!data.senhaAtual) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    }

    if (!data.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (data.novaSenha.length < 8) { // Aumentado para 8 por segurança
      newErrors.novaSenha = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])/.test(data.novaSenha)) {
        newErrors.novaSenha = 'Senha deve conter minúscula';
    } else if (!/(?=.*[A-Z])/.test(data.novaSenha)) {
        newErrors.novaSenha = 'Senha deve conter maiúscula';
    } else if (!/(?=.*\d)/.test(data.novaSenha)) {
        newErrors.novaSenha = 'Senha deve conter número';
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(data.novaSenha)) {
        newErrors.novaSenha = 'Senha deve conter caractere especial';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateProfile, validatePassword };
};

// --- COMPONENTE HEADER DO PERFIL ---
const ProfileHeader = ({
  user,
  avatarUrl,
  onAvatarChange,
  isGamificationActive
}: {
  user: Usuario;
  avatarUrl: string;
  onAvatarChange: () => void;
  isGamificationActive: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl shadow-2xl p-8 text-white mb-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img
            src={avatarUrl}
            alt="Foto de Perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-white/80 shadow-2xl group-hover:border-white transition-all duration-300"
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=f59e0b&color=fff&size=128&bold=true`; }} // Fallback robusto
          />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Camera className="text-white w-8 h-8" />
          </div>
          <motion.button
            onClick={onAvatarChange}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Alterar Foto
          </motion.button>
        </motion.div>

        <div className="text-center md:text-left flex-1">
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {user.nome}
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {user.email}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center md:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isGamificationActive && user.pontos != null && user.pontos > 0 && ( // Checa se pontos existem e são > 0
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-white/30">
                <Star className="w-5 h-5 text-amber-300" />
                <span className="font-semibold">{user.pontos} pontos</span>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE DE NAVEGAÇÃO RESPONSIVA ---
const ResponsiveNavigation = ({
  activeView,
  setActiveView,
  isGamificationActive
}: {
  activeView: ProfileView;
  setActiveView: (view: ProfileView) => void;
  isGamificationActive: boolean;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview' as ProfileView, label: 'Resumo', icon: ICONS.dashboard },
    ...(isGamificationActive ? [
      { id: 'gamification' as ProfileView, label: 'Minha Pontuação', icon: ICONS.trophy },
      { id: 'login_history' as ProfileView, label: 'Histórico de Login', icon: ICONS.calendar }
    ] : []),
    { id: 'edit_profile' as ProfileView, label: 'Editar Perfil', icon: ICONS.user },
    { id: 'change_password' as ProfileView, label: 'Alterar Senha', icon: ICONS.lock },
    { id: 'meus_pedidos' as ProfileView, label: 'Meus Pedidos', icon: ICONS.clipboard },
  ];

  return (
    <>
      {/* Botão Mobile */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden w-full bg-white rounded-2xl p-4 shadow-lg mb-4 flex items-center justify-between border border-amber-100"
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-semibold text-gray-800">Menu do Perfil</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Navegação */}
      <motion.nav
        className={`${isMobileMenuOpen ? 'block mb-4' : 'hidden'} md:block flex-shrink-0 w-full md:w-64`}
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 'auto' }} // Animação de altura
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false); // Fecha o menu mobile ao clicar
              }}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl text-left font-semibold transition-all duration-200 border ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-transparent'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-gray-800 border-amber-50'
              }`}
              whileHover={{ x: 4 }}
              initial={{ opacity: 0, x: -10 }} // Animação de entrada
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }} // Delay escalonado
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </>
  );
};

// --- COMPONENTE OVERVIEW ---
const OverviewView = ({
  donationCount,
  volunteerStatus,
  pontos,
  pedidos,
  isGamificationActive
}: {
  donationCount: number;
  volunteerStatus: string | null;
  pontos: number;
  pedidos: Adocao[];
  isGamificationActive: boolean;
}) => {
  const stats = [
    {
      title: 'Doações Realizadas',
      value: donationCount,
      icon: ICONS.gift,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Total de contribuições',
      action: '/doacoes'
    },
    {
      title: 'Status de Voluntário',
      value: volunteerStatus || 'Não candidatou',
      icon: ICONS.heart,
      color: volunteerStatus === 'aprovado' ? 'from-amber-500 to-amber-600' : 'from-gray-400 to-gray-500', // Ajustado para 'aprovado'
      bgColor: volunteerStatus === 'aprovado' ? 'bg-amber-50' : 'bg-gray-50',
      description: 'Seu status atual',
      action: '/voluntario'
    },
    {
      title: 'Pedidos de Adoção',
      value: pedidos.length,
      icon: ICONS.clipboard,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Total de solicitações',
      action: '/adote'
    },
    ...(isGamificationActive ? [{
      title: 'Pontuação Total',
      value: pontos,
      icon: ICONS.star,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Seus pontos acumulados',
      action: '/ranking'
    }] : [])
  ];

  const recentActivities = pedidos.slice(0, 3).map(pedido => ({
    id: pedido.id,
    title: `Pedido de adoção - ${pedido.animal?.nome || 'Animal desconhecido'}`, // Fallback
    date: pedido.createdAt ? new Date(pedido.createdAt) : new Date(), // Usar createdAt se disponível
    status: pedido.status,
    type: 'adocao' as const
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADA': return 'text-green-600 bg-green-100 border border-green-200';
      case 'RECUSADA': return 'text-red-600 bg-red-100 border border-red-200';
      default: return 'text-amber-600 bg-amber-100 border border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Estatísticas em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 cursor-pointer`}
            onClick={() => window.location.href = stat.action} // Ou usar <Link> se preferir navegação Next.js
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-gray-600 font-semibold text-sm mb-2">{stat.title}</p>
            <p className="text-gray-400 text-xs">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividades Recentes */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'APROVADA' ? 'bg-green-500' :
                    activity.status === 'RECUSADA' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{activity.title}</p>
                    <p className="text-gray-500 text-xs">{activity.date.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-gray-500 text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Nenhuma atividade recente
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <motion.a
              href="/doacoes"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <span className="font-semibold">Fazer uma Doação</span>
            </motion.a>

            <motion.a
              href="/voluntario"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-semibold">Tornar-se Voluntário</span>
            </motion.a>

            <motion.a
              href="/adote"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                <Clipboard className="w-5 h-5" />
              </div>
              <span className="font-semibold">Adotar um Animal</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


// --- COMPONENTE GAMIFICATION ---
const GamificationView = ({ pontos, conquistas }: { pontos: number; conquistas: UsuarioConquistaComDetalhes[] }) => {
    const POINTS_PER_LEVEL = 100;
    const level = Math.floor(pontos / POINTS_PER_LEVEL) + 1;
    const pointsInCurrentLevel = pontos % POINTS_PER_LEVEL;
    const progressPercentage = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
    const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel;

    return (
        <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 space-y-8 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Cabeçalho */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Minhas Conquistas</h2>
                <p className="text-gray-500 text-lg">Cada ação sua faz a diferença! Continue ajudando para desbloquear mais conquistas.</p>
            </div>

            {/* Nível e Progresso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl text-white text-center shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold opacity-90">Nível Atual</p>
                        <p className="text-6xl font-extrabold my-4 drop-shadow-lg">{level}</p>
                        <div className="flex items-center justify-center gap-2">
                            <Star className="w-6 h-6 text-amber-300 fill-current" />
                            <p className="font-bold text-2xl">{pontos} <span className="text-lg font-medium opacity-90">pontos</span></p>
                        </div>
                    </div>
                </motion.div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 text-lg">Progresso para o Nível {level + 1}</h3>
                        <p className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                            {pointsInCurrentLevel}/{POINTS_PER_LEVEL}
                        </p>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-4 overflow-hidden mb-3 shadow-inner">
                        <motion.div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full relative shadow-md"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </motion.div>
                    </div>
                    <p className="text-sm text-gray-600 text-center font-medium">
                        {pointsToNextLevel === POINTS_PER_LEVEL ? 'Comece a ganhar pontos!' :
                         `Faltam ${pointsToNextLevel} pontos para o próximo nível`}
                    </p>
                </div>
            </div>

            {/* Conquistas */}
            <motion.div
                className="border-t border-amber-200 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Minhas Medalhas</h3>
                        <p className="text-gray-500 mt-1">Suas conquistas na jornada solidária</p>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">{conquistas.length} conquistas</span>
                    </div>
                </div>

                {conquistas.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {conquistas.map((userConquista, index) => (
                            <motion.div
                                key={userConquista.conquista.id}
                                className="group relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.6 + index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                whileHover={{
                                    scale: 1.02,
                                    y: -2
                                }}
                            >
                                <div className="bg-white rounded-2xl p-6 border-2 border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-amber-200 relative overflow-hidden h-full">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 flex items-center justify-center relative">
                                                <img
                                                    src={buildImageUrl(userConquista.conquista.icone)}
                                                    alt={userConquista.conquista.nome}
                                                    className="w-20 h-20 object-contain filter drop-shadow-lg"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `https://via.placeholder.com/80/4a5568/ffffff?text=${userConquista.conquista.nome.charAt(0)}`;
                                                    }}
                                                />
                                            </div>

                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg border-2 border-white">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <h4 className="font-bold text-gray-800 text-xl mb-3 group-hover:text-gray-900 transition-colors leading-tight">
                                                {userConquista.conquista.nome}
                                            </h4>

                                            <p className="text-gray-600 text-sm mb-4 leading-relaxed px-2">
                                                {userConquista.conquista.descricao}
                                            </p>

                                            <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm font-semibold">
                                                    {new Date(userConquista.dataDeGanho).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/3 group-hover:to-orange-500/5 transition-all duration-300 pointer-events-none"></div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="text-center py-16 bg-gradient-to-br from-gray-50 to-amber-50 rounded-2xl border-2 border-dashed border-amber-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
                            <Trophy className="w-12 h-12 text-gray-400" />
                        </div>
                        <h4 className="text-2xl font-semibold text-gray-600 mb-3">Nenhuma conquista ainda</h4>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                            Suas medalhas aparecerão aqui conforme você for ajudando a causa animal.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/doacoes"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Gift className="w-5 h-5" />
                                Fazer Primeira Doação
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- COMPONENTE DE HISTÓRICO DE LOGIN (COM DADOS REAIS E CORREÇÃO DE STREAK/DIAS FUTUROS) ---
interface LoginHistoryFromAPI {
  data: string;
  status: 'completed' | 'missed';
}

const HistoricoDeLogin = () => {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLoginHistory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<LoginHistoryFromAPI[]>('/gamificacao/login-history');

      // Formata e garante que as datas sejam tratadas como locais
      const formattedHistory = response.data.map(item => {
        const dateString = item.data.substring(0, 10); // Pega YYYY-MM-DD
        // Cria a data como se fosse meia-noite no fuso horário local do navegador
        const dataLocal = new Date(dateString + 'T00:00:00');
        return { ...item, data: dataLocal };
      });
      setLoginHistory(formattedHistory);
    } catch (err: any) {
      console.error("Erro detalhado ao buscar histórico de login:", err);
      let errorMsg = "Não foi possível carregar seu histórico.";
      if (err.response?.status === 401) errorMsg = "Sessão expirada. Faça login novamente.";
      else if (err.response?.status === 403) errorMsg = "Sem permissão.";
      else if (err.response?.status === 404) errorMsg = "Serviço não encontrado.";
      else if (err.message?.includes('Network Error')) errorMsg = "Erro de conexão.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-500 text-lg font-semibold mb-2">{error}</p>
        <button
          onClick={fetchLoginHistory}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return <LoginHistoryView loginHistory={loginHistory} />;
};

// Componente de visualização do histórico (COM CORREÇÃO DE STREAK E DIAS FUTUROS)
const LoginHistoryView = ({ loginHistory }: { loginHistory: LoginHistoryItem[] }) => {
    const hoje = new Date();
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Lógica de cálculo da sequência (streak) CORRIGIDA
    const getStreak = () => {
        let streak = 0;
        const hojeSemHoras = new Date();
        hojeSemHoras.setHours(0, 0, 0, 0);

        // Filtra para remover dias futuros ANTES de calcular
        const historicoPassadoEPresente = loginHistory.filter(item => {
            const diaItem = new Date(item.data);
            diaItem.setHours(0,0,0,0);
            // Compara apenas a data, ignorando a hora
            return diaItem.toISOString().split('T')[0] <= hojeSemHoras.toISOString().split('T')[0];
        });

        // Calcula a streak usando o array filtrado
        for (let i = historicoPassadoEPresente.length - 1; i >= 0; i--) {
            if (historicoPassadoEPresente[i].status === 'completed') {
                const dia = new Date(historicoPassadoEPresente[i].data);
                dia.setHours(0, 0, 0, 0);
                const diffDias = Math.round((hojeSemHoras.getTime() - dia.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDias === streak) {
                    streak++;
                } else {
                    break; // Sequência quebrada
                }
            } else {
                 const dia = new Date(historicoPassadoEPresente[i].data);
                 dia.setHours(0, 0, 0, 0);
                 const diffDias = Math.round((hojeSemHoras.getTime() - dia.getTime()) / (1000 * 60 * 60 * 24));
                 if(diffDias > 0) { // Se o dia perdido foi ANTES de hoje
                    break;
                 }
                 // Se o dia perdido for HOJE, não quebra, mas também não incrementa
            }
        }
        return streak;
    };

    const currentStreak = getStreak();
    // Filtra novamente aqui para garantir que dias futuros não contem para pontos
     const completedLoginsThisWeek = loginHistory.filter(l => {
         const diaItem = new Date(l.data);
         diaItem.setHours(0,0,0,0);
         return l.status === 'completed' && diaItem.toISOString().split('T')[0] <= hoje.toISOString().split('T')[0];
     }).length;
    const totalPoints = completedLoginsThisWeek * 5;


    return (
        <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 space-y-8 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Histórico de Login Diário</h2>
                <p className="text-gray-500 text-lg">Acompanhe sua sequência de logins e ganhe pontos todos os dias!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl text-white text-center shadow-lg"
                    whileHover={{ scale: 1.02 }}
                >
                    <p className="text-sm font-semibold opacity-90">Sequência Atual</p>
                    <p className="text-6xl font-extrabold my-4">{currentStreak}</p>
                    <p className="font-bold text-lg">dias consecutivos</p>
                </motion.div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center">
                    <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-700 text-lg mb-2">Pontos por Login</h3>
                    <p className="text-2xl font-bold text-amber-600">+5</p>
                    <p className="text-sm text-gray-500 mt-1">pontos por dia</p>
                </div>

                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center">
                    <Star className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-700 text-lg mb-2">Total na Semana</h3>
                    <p className="text-2xl font-bold text-amber-600">{totalPoints}</p>
                    <p className="text-sm text-gray-500 mt-1">pontos ganhos</p>
                </div>
            </div>

            <motion.div
                className="border-t border-amber-200 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Últimos 7 Dias</h3>
                <div className="grid grid-cols-7 gap-4">
                    {loginHistory.map((day, index) => {
                        const hojeSemHoras = new Date();
                        hojeSemHoras.setHours(0, 0, 0, 0);
                        const diaItemSemHoras = new Date(day.data);
                        diaItemSemHoras.setHours(0,0,0,0);

                        const isToday = diaItemSemHoras.toISOString().split('T')[0] === hojeSemHoras.toISOString().split('T')[0];
                        const diaSemana = diasDaSemana[day.data.getDay()];
                        const diaMes = day.data.getDate();
                        const mes = meses[day.data.getMonth()];
                        const isFuture = diaItemSemHoras.getTime() > hojeSemHoras.getTime();


                        return (
                            <motion.div
                                key={index}
                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isFuture ? 'bg-gray-50 border-gray-200 opacity-40 cursor-not-allowed' : // Estilo futuro
                                    day.status === 'completed'
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg'
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                } ${isToday ? 'ring-2 ring-amber-400 ring-opacity-50' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: isFuture ? 1 : 1.05 }}
                            >
                                <div className={`mb-2 ${
                                    isFuture ? 'text-gray-300' :
                                    day.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                    {isFuture ? <HelpCircle className="w-8 h-8" /> :
                                     day.status === 'completed' ? <CheckCircle className="w-8 h-8" /> :
                                     <XCircle className="w-8 h-8" />}
                                </div>
                                <p className={`font-semibold text-sm ${
                                    isFuture ? 'text-gray-400' :
                                    day.status === 'completed' ? 'text-gray-800' : 'text-gray-400'
                                }`}>
                                    {diaSemana}
                                </p>
                                <p className={`text-xs ${isFuture ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {diaMes} {mes}
                                </p>
                                {isToday && (
                                    <span className="absolute -top-2 -right-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                        Hoje
                                    </span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- COMPONENTE MEUS PEDIDOS (ATUALIZADO) ---
const MeusPedidosView = ({ pedidos }: { pedidos: Adocao[] }) => {
  // Verifica se existe alguma adoção aprovada de animal da associação
  const showCongratsMessage = pedidos.some(
    pedido => pedido.status === StatusAdocao.APROVADA && pedido.animal?.isFromDivulgacao === false
  );

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos de Adoção</h2>

      {/* --- ADICIONADO: Mensagem de Parabéns Condicional --- */}
      {showCongratsMessage && (
        <motion.div
          className="mb-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Parabéns pela Adoção!</h3>
              <p className="text-green-700 mt-1 text-sm leading-relaxed">
                Além de adotar um lindo animalzinho, ao adotar um animal diretamente da associação, você está recebendo um companheiro já castrado e vacinado. Obrigado por fazer a diferença!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      {/* --- FIM DA ADIÇÃO --- */}


      {pedidos.length === 0 ? (
        <div className="text-center py-12">
          <Clipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum pedido de adoção</h3>
          <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido de adoção.</p>
          <Link
            href="/adote" // Corrigido para /adote
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors border border-amber-600"
          >
            <Heart className="w-4 h-4" />
            Ver Animais para Adoção
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido, index) => (
            // Garante que o animal exista antes de renderizar
            pedido.animal && (
              <motion.div
                key={pedido.id}
                className="flex flex-col sm:flex-row items-center justify-between p-6 border rounded-2xl bg-gradient-to-r from-amber-50 to-white hover:shadow-lg transition-all duration-300 border-amber-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + (showCongratsMessage ? 0.3 : 0) }} // Atraso adicional se a msg aparecer
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <img
                    src={buildImageUrl(pedido.animal.animalImageUrl)}
                    alt={pedido.animal.nome}
                    className="w-20 h-20 object-cover rounded-xl shadow-md border border-amber-200"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=Sem+Foto'; }}
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{pedido.animal.nome}</p>
                    <p className="text-sm text-gray-500">Pedido em: {new Date(pedido.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p> {/* Fallback para createdAt */}
                    <p className="text-xs text-gray-400">ID: {pedido.id.slice(0, 8)}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  pedido.status === 'APROVADA' ? 'bg-green-100 text-green-800 border border-green-200' :
                  pedido.status === 'RECUSADA' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {pedido.status.replace('_', ' ')}
                </span>
              </motion.div>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
};


// --- COMPONENTE PRINCIPAL ---
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuth();
  const [activeView, setActiveView] = useState<ProfileView>('overview');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Usar hooks personalizados
  const profileData = useProfileData(user);
  const { errors, validateProfile, validatePassword } = useFormValidation();

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');
      // Usa buildImageUrl para o avatar
      setAvatarUrl(buildImageUrl(user.profileImageUrl));
    } else {
        // Define um avatar padrão se não houver usuário (embora a página deva redirecionar)
        setAvatarUrl('https://via.placeholder.com/128/e2e8f0/cbd5e0?text=?');
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateProfile({ nome, email, telefone })) return;
    setIsProfileLoading(true);
    try {
      const response = await api.patch('/usuario/me/profile', { nome, email, telefone });
      updateUser(response.data); // Atualiza o contexto de autenticação
      toast.success('Perfil atualizado com sucesso! 🎉');
      setActiveView('overview'); // Volta para a visão geral
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Erro ao atualizar o perfil.';
        // Exibe erros de validação específicos do backend, se houver
        if (Array.isArray(errorMsg)) {
            errorMsg.forEach(msg => toast.error(msg));
        } else {
            toast.error(errorMsg);
        }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword({ senhaAtual, novaSenha })) return;
    setIsPasswordLoading(true);
    try {
      await api.patch('/usuario/me/change-password', { senhaAtual, novaSenha });
      toast.success('Senha alterada com sucesso! 🔐');
      setSenhaAtual('');
      setNovaSenha('');
      setActiveView('overview');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // Limite de 5MB
      toast.error('A imagem deve ter menos de 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Enviando foto...');
    try {
      const response = await api.patch<Usuario>('/usuario/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data);
      setAvatarUrl(buildImageUrl(response.data.profileImageUrl)); // Atualiza URL com buildImageUrl
      toast.success('Foto de perfil atualizada!', { id: toastId });
    } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Erro ao enviar a foto.';
        toast.error(errorMsg, { id: toastId });
    }
  };

  const triggerAvatarUpload = () => fileInputRef.current?.click();

  // Estados de loading e autenticação
  if (isAuthLoading || profileData.isLoading) { // Verifica os dois loadings
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-gray-600 font-semibold">Carregando dados do perfil...</p> {/* Mensagem mais informativa */}
        </motion.div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <motion.div
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl text-center space-y-6 border border-amber-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Acesso Negado</h2>
          <p className="text-gray-600">Por favor, faça login para acessar ao seu perfil.</p>
          <Link href="/login" className="block w-full px-6 py-4 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-600">
            Ir para o Login
          </Link>
        </motion.div>
      </main>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <main className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header do Perfil */}
        <ProfileHeader
          user={user}
          avatarUrl={avatarUrl}
          onAvatarChange={triggerAvatarUpload}
          isGamificationActive={profileData.isGamificationActive}
        />

        {/* Input de Arquivo Escondido */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          className="hidden"
          accept="image/png, image/jpeg, image/webp" // Tipos de imagem mais comuns
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navegação */}
          <ResponsiveNavigation
            activeView={activeView}
            setActiveView={setActiveView}
            isGamificationActive={profileData.isGamificationActive}
          />

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView} // Chave para AnimatePresence funcionar
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeView === 'overview' && (
                  <OverviewView
                    donationCount={profileData.donationCount}
                    volunteerStatus={profileData.volunteerStatus}
                    pontos={user.pontos || 0}
                    pedidos={profileData.pedidos}
                    isGamificationActive={profileData.isGamificationActive}
                  />
                )}

                {activeView === 'gamification' && profileData.isGamificationActive && ( // Renderiza condicionalmente
                  <GamificationView
                    pontos={user.pontos || 0}
                    conquistas={profileData.conquistas}
                  />
                )}

                 {activeView === 'login_history' && profileData.isGamificationActive && ( // Renderiza condicionalmente
                    <HistoricoDeLogin />
                 )}

                {activeView === 'edit_profile' && (
                  <motion.div
                    className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Dados Pessoais</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div>
                        <label htmlFor="nome" className="block mb-3 text-sm font-semibold text-gray-700">Nome Completo</label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={e => setNome(e.target.value)}
                          disabled={isProfileLoading}
                          className={errors.nome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'}
                        />
                        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block mb-3 text-sm font-semibold text-gray-700">E-mail</label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={isProfileLoading}
                          className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="telefone" className="block mb-3 text-sm font-semibold text-gray-700">Telefone</label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={e => setTelefone(e.target.value)}
                          disabled={isProfileLoading}
                          className={errors.telefone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'}
                        />
                        {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <Button
                          type="button"
                          onClick={() => setActiveView('overview')}
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold border border-gray-300"
                          disabled={isProfileLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" isLoading={isProfileLoading} className="bg-amber-500 hover:bg-amber-600 border-amber-600">
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeView === 'change_password' && (
                  <motion.div
                    className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Alterar Senha</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label htmlFor="senhaAtual" className="block mb-3 text-sm font-semibold text-gray-700">Senha Atual</label>
                        <Input
                          id="senhaAtual"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={senhaAtual}
                          onChange={e => setSenhaAtual(e.target.value)}
                          icon={showCurrentPassword ? <Eye/> : <EyeOff/>}
                          onIconClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={isPasswordLoading}
                          className={errors.senhaAtual ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'}
                        />
                        {errors.senhaAtual && <p className="text-red-500 text-sm mt-1">{errors.senhaAtual}</p>}
                      </div>

                      <div>
                        <label htmlFor="novaSenha" className="block mb-3 text-sm font-semibold text-gray-700">Nova Senha</label>
                        <Input
                          id="novaSenha"
                          type={showNewPassword ? 'text' : 'password'}
                          value={novaSenha}
                          onChange={e => setNovaSenha(e.target.value)}
                          icon={showNewPassword ? <Eye/> : <EyeOff/>}
                          onIconClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isPasswordLoading}
                          className={errors.novaSenha ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-amber-200 focus:border-amber-500 focus:ring-amber-500'}
                        />
                        {errors.novaSenha && <p className="text-red-500 text-sm mt-1">{errors.novaSenha}</p>}
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <Button
                          type="button"
                          onClick={() => setActiveView('overview')}
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold border border-gray-300"
                          disabled={isPasswordLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" isLoading={isPasswordLoading} className="bg-amber-500 hover:bg-amber-600 border-amber-600">
                          Alterar Senha
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* --- ATUALIZADO: Passa os pedidos para MeusPedidosView --- */}
                {activeView === 'meus_pedidos' && (
                  <MeusPedidosView pedidos={profileData.pedidos} />
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}


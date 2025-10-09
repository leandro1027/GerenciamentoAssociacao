'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Doacao, Voluntario, Usuario, Adocao } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Camera, Clock, ChevronDown, Star, Trophy, Gift, Heart, Clipboard, User, Lock, Home } from 'lucide-react';

type ProfileView = 'overview' | 'edit_profile' | 'change_password' | 'meus_pedidos' | 'gamification';

// --- ÍCONES PERSONALIZADOS ---
const CustomIcon = ({ icon: Icon, className = "h-6 w-6" }: { icon: any; className?: string }) => (
  <Icon className={className} />
);

const ICONS = {
  dashboard: <CustomIcon icon={Home} />,
  user: <CustomIcon icon={User} />,
  lock: <CustomIcon icon={Lock} />,
  gift: <CustomIcon icon={Gift} className="h-8 w-8 text-amber-500" />,
  heart: <CustomIcon icon={Heart} className="h-8 w-8 text-rose-500" />,
  camera: <CustomIcon icon={Camera} className="h-5 w-5" />,
  clipboard: <CustomIcon icon={Clipboard} />,
  star: <CustomIcon icon={Star} className="h-8 w-8 text-yellow-400" />,
  trophy: <CustomIcon icon={Trophy} className="h-6 w-6" />,
};

// --- HOOK PARA DADOS DO PERFIL ---
const useProfileData = (user: Usuario | null) => {
  const [profileData, setProfileData] = useState({
    donationCount: 0,
    volunteerStatus: null as string | null,
    pedidos: [] as Adocao[],
    isGamificationActive: false,
    isLoading: true
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const [donationsRes, volunteerRes, adocoesRes, configRes] = await Promise.all([
          api.get<Doacao[]>('/doacao'),
          api.get<Voluntario | null>('/voluntario/meu-status'),
          api.get<Adocao[]>('/adocoes/meus-pedidos'),
          api.get('/configuracao'),
        ]);

        const userDonations = donationsRes.data.filter(d => d.usuarioId === user.id);
        
        setProfileData({
          donationCount: userDonations.length,
          volunteerStatus: volunteerRes.data?.status || null,
          pedidos: adocoesRes.data,
          isGamificationActive: configRes.data.gamificacaoAtiva,
          isLoading: false
        });
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        toast.error('Não foi possível carregar todos os dados do perfil.');
        setProfileData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProfileData();
  }, [user]);

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

    if (data.telefone && !/^[\d\s+\-()]+$/.test(data.telefone)) {
      newErrors.telefone = 'Telefone inválido';
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
    } else if (data.novaSenha.length < 6) {
      newErrors.novaSenha = 'Senha deve ter pelo menos 6 caracteres';
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
  onAvatarChange 
}: { 
  user: Usuario; 
  avatarUrl: string; 
  onAvatarChange: () => void; 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white mb-8 relative overflow-hidden"
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
          />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Camera className="text-white w-8 h-8" />
          </div>
          <motion.button 
            onClick={onAvatarChange}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
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
            {user.pontos > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-white/30">
                <Star className="w-5 h-5 text-yellow-300" />
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
    ...(isGamificationActive ? [{ id: 'gamification' as ProfileView, label: 'Minha Pontuação', icon: ICONS.trophy }] : []),
    { id: 'edit_profile' as ProfileView, label: 'Editar Perfil', icon: ICONS.user },
    { id: 'change_password' as ProfileView, label: 'Alterar Senha', icon: ICONS.lock },
    { id: 'meus_pedidos' as ProfileView, label: 'Meus Pedidos', icon: ICONS.clipboard },
  ];

  return (
    <>
      {/* Botão Mobile */}
      <motion.button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden w-full bg-white rounded-2xl p-4 shadow-lg mb-4 flex items-center justify-between hover-lift"
        whileTap={{ scale: 0.98 }}
      >
        <span className="font-semibold text-slate-800">Menu do Perfil</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Navegação */}
      <motion.nav 
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block flex-shrink-0 w-full md:w-64`}
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 'auto' }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button 
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl text-left font-semibold transition-all duration-200 hover-lift ${
                activeView === item.id 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              whileHover={{ x: 4 }}
              transition={{ delay: index * 0.1 }}
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

// --- COMPONENTE OVERVIEW MELHORADO ---
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
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      description: 'Total de contribuições',
      action: '/doar'
    },
    {
      title: 'Status de Voluntário',
      value: volunteerStatus || 'Não candidatou',
      icon: ICONS.heart,
      color: volunteerStatus === 'APROVADO' ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600',
      bgColor: volunteerStatus === 'APROVADO' ? 'bg-blue-50' : 'bg-gray-50',
      description: 'Seu status atual',
      action: '/voluntariado'
    },
    {
      title: 'Pedidos de Adoção',
      value: pedidos.length,
      icon: ICONS.clipboard,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total de solicitações',
      action: '/animais'
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
    title: `Pedido de adoção - ${pedido.animal?.nome}`,
    date: new Date(pedido.dataSolicitacao),
    status: pedido.status,
    type: 'adocao' as const
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROVADA': return 'text-green-600 bg-green-100';
      case 'RECUSADA': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
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
            className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border border-transparent hover-lift cursor-pointer`}
            onClick={() => window.location.href = stat.action}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-md`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
            <p className="text-slate-600 font-semibold text-sm mb-2">{stat.title}</p>
            <p className="text-slate-400 text-xs">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividades Recentes */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-lg border hover-lift"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'APROVADA' ? 'bg-green-500' : 
                    activity.status === 'RECUSADA' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{activity.title}</p>
                    <p className="text-slate-500 text-xs">{activity.date.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.p 
                className="text-slate-500 text-center py-8"
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
          className="bg-white rounded-2xl p-6 shadow-lg border hover-lift"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <motion.a 
              href="/doar"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <span className="font-semibold">Fazer uma Doação</span>
            </motion.a>
            
            <motion.a 
              href="/voluntariado"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-semibold">Tornar-se Voluntário</span>
            </motion.a>
            
            <motion.a 
              href="/animais"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200 group"
              whileHover={{ x: 5 }}
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
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

const GamificationView = ({ pontos }: { pontos: number }) => {
    const POINTS_PER_LEVEL = 100;
    const level = Math.floor(pontos / POINTS_PER_LEVEL) + 1;
    const pointsInCurrentLevel = pontos % POINTS_PER_LEVEL;
    const progressPercentage = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
    const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel;

    const achievements = [
        { id: 1, name: 'Primeira Doação', icon: '🎁', unlocked: pontos >= 50, description: 'Faça sua primeira doação' },
        { id: 2, name: 'Coração Voluntário', icon: '❤️', unlocked: pontos >= 100, description: 'Torne-se voluntário' },
        { id: 3, name: 'Herói de um Peludo', icon: '🏆', unlocked: pontos >= 200, description: 'Complete uma adoção' },
        { id: 4, name: 'Amigo Fiel', icon: '⭐', unlocked: pontos >= 300, description: 'Alcance 300 pontos' },
    ];

    return (
        <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg space-y-8 hover-lift"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Meu Progresso</h2>
                <p className="text-slate-500 text-lg">Acumule pontos e ajude ainda mais a nossa causa!</p>
            </div>

            {/* Nível e Progresso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                    className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-2xl text-white text-center shadow-lg"
                    whileHover={{ scale: 1.02 }}
                >
                    <p className="text-sm font-semibold opacity-90">Nível Atual</p>
                    <p className="text-6xl font-extrabold my-4">{level}</p>
                    <p className="font-bold text-2xl">{pontos} <span className="text-lg font-medium opacity-90">pontos</span></p>
                </motion.div>

                <div className="bg-slate-50 p-6 rounded-2xl border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 text-lg">Progresso para o Nível {level + 1}</h3>
                        <p className="text-sm font-semibold text-amber-700">{pointsInCurrentLevel} / {POINTS_PER_LEVEL}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden mb-2">
                        <motion.div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full shadow-inner"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        /> {/* <-- CORREÇÃO: Esta div estava mal fechada */}
                    </div>
                    <p className="text-sm text-slate-500 text-center">
                        {pointsToNextLevel} pontos para o próximo nível
                    </p>
                </div>
            </div>

            {/* Como ganhar pontos */}
            <motion.div 
                className="border-t pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-xl font-bold text-slate-800 mb-4">Como ganhar pontos?</h3>
                <div className="space-y-3 text-slate-600">
                    <motion.div className="flex items-center gap-4 p-3 rounded-lg bg-amber-50" whileHover={{ x: 5 }}>
                        <span className="text-2xl">🎁</span>
                        <div>
                            <p className="font-semibold">+50 pontos</p>
                            <p className="text-sm">Faça uma doação para a associação</p>
                        </div>
                    </motion.div>
                    <motion.div className="flex items-center gap-4 p-3 rounded-lg bg-rose-50" whileHover={{ x: 5 }}>
                        <span className="text-2xl">❤️</span>
                        <div>
                            <p className="font-semibold">+100 pontos</p>
                            <p className="text-sm">Candidate-se e seja aprovado como voluntário</p>
                        </div>
                    </motion.div>
                    <motion.div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50" whileHover={{ x: 5 }}>
                        <span className="text-2xl">📝</span>
                        <div>
                            <p className="font-semibold">+150 pontos</p>
                            <p className="text-sm">Complete uma adoção responsável</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Conquistas */}
            <motion.div 
                className="border-t pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="text-xl font-bold text-slate-800 mb-4">Conquistas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {achievements.map((achievement, index) => (
                        <motion.div
                            key={achievement.id}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl text-center border-2 ${
                                achievement.unlocked 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                                : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                                {achievement.icon}
                            </div>
                            <p className={`font-semibold text-sm ${
                                achievement.unlocked ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                                {achievement.name}
                            </p>
                            <p className={`text-xs ${
                                achievement.unlocked ? 'text-green-600' : 'text-slate-400'
                            }`}>
                                {achievement.unlocked ? '🏆 Conquistada' : achievement.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div> // <-- CORREÇÃO: Esta div estava a mais e mal posicionada
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

      if (user.profileImageUrl) {
        setAvatarUrl(`${api.defaults.baseURL}${user.profileImageUrl}?t=${new Date().getTime()}`);
      } else {
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=0ea5e9&color=fff&size=128&bold=true`);
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile({ nome, email, telefone })) {
      return;
    }

    setIsProfileLoading(true);
    try {
      const response = await api.patch('/usuario/me/profile', { nome, email, telefone });
      updateUser(response.data);
      toast.success('Perfil atualizado com sucesso! 🎉');
      setActiveView('overview');
    } catch {
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword({ senhaAtual, novaSenha })) {
      return;
    }

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

    // Validação básica do arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter menos de 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('A enviar a sua nova foto... 📸');
    try {
      const response = await api.patch<Usuario>('/usuario/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data);
      setAvatarUrl(`${api.defaults.baseURL}${response.data.profileImageUrl}?t=${new Date().getTime()}`);
      toast.success('Foto de perfil atualizada! ✨', { id: toastId });
    } catch {
      toast.error('Erro ao enviar a foto.', { id: toastId });
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  // Estados de loading e autenticação
  if (isAuthLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando seu perfil...</p>
        </motion.div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <motion.div 
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl text-center space-y-6 hover-lift"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Acesso Negado</h2>
          <p className="text-slate-600">Por favor, faça login para aceder ao seu perfil.</p>
          <Link href="/login" className="block w-full px-6 py-4 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
            Ir para o Login
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header do Perfil */}
        <ProfileHeader 
          user={user} 
          avatarUrl={avatarUrl} 
          onAvatarChange={triggerAvatarUpload} 
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleAvatarUpload} 
          className="hidden" 
          accept="image/*" 
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
                key={activeView}
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

                {activeView === 'gamification' && <GamificationView pontos={user.pontos || 0} />}

                {activeView === 'edit_profile' && (
                  <motion.div 
                    className="bg-white p-8 rounded-2xl shadow-lg hover-lift"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Dados Pessoais</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div>
                        <label htmlFor="nome" className="block mb-3 text-sm font-semibold text-gray-700">Nome Completo</label>
                        <Input 
                          id="nome" 
                          value={nome} 
                          onChange={e => setNome(e.target.value)} 
                          disabled={isProfileLoading}
                          className={errors.nome ? 'border-red-500' : ''}
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
                          className={errors.email ? 'border-red-500' : ''}
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
                          className={errors.telefone ? 'border-red-500' : ''}
                        />
                        {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                      </div>
                      
                      <div className="pt-4 flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          onClick={() => setActiveView('overview')} 
                          className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" 
                          disabled={isProfileLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" isLoading={isProfileLoading}>
                          Guardar Alterações
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeView === 'change_password' && (
                  <motion.div 
                    className="bg-white p-8 rounded-2xl shadow-lg hover-lift"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Alterar Senha</h2>
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
                          className={errors.senhaAtual ? 'border-red-500' : ''}
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
                          className={errors.novaSenha ? 'border-red-500' : ''}
                        />
                        {errors.novaSenha && <p className="text-red-500 text-sm mt-1">{errors.novaSenha}</p>}
                      </div>
                      
                      <div className="pt-4 flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          onClick={() => setActiveView('overview')} 
                          className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" 
                          disabled={isPasswordLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" isLoading={isPasswordLoading}>
                          Alterar Senha
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeView === 'meus_pedidos' && (
                  <motion.div 
                    className="bg-white p-8 rounded-2xl shadow-lg hover-lift"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Meus Pedidos de Adoção</h2>
                    {profileData.pedidos.length === 0 ? (
                      <div className="text-center py-12">
                        <Clipboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum pedido de adoção</h3>
                        <p className="text-slate-500 mb-6">Você ainda não fez nenhum pedido de adoção.</p>
                        <Link 
                          href="/animais" 
                          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          Ver Animais para Adoção
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profileData.pedidos.map((pedido, index) => (
                          pedido.animal && (
                            <motion.div 
                              key={pedido.id} 
                              className="flex items-center justify-between p-6 border rounded-2xl bg-gradient-to-r from-slate-50 to-white hover-lift"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={`${api.defaults.baseURL}${pedido.animal.animalImageUrl}`} 
                                  alt={pedido.animal.nome}
                                  className="w-20 h-20 object-cover rounded-xl shadow-md"
                                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=Sem+Foto'; }}
                                />
                                <div>
                                  <p className="font-bold text-gray-800 text-lg">{pedido.animal.nome}</p>
                                  <p className="text-sm text-gray-500">Pedido em: {new Date(pedido.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                                  <p className="text-xs text-gray-400">ID: {pedido.id.slice(0, 8)}</p>
                                </div>
                              </div>
                              <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                                pedido.status === 'APROVADA' ? 'bg-green-100 text-green-800 border border-green-200' :
                                pedido.status === 'RECUSADA' ? 'bg-red-100 text-red-800 border border-red-200' :
                                'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {pedido.status.replace('_', ' ')}
                              </span>
                            </motion.div>
                          )
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Doacao, Voluntario, Usuario, Adocao } from '../../types';


type ProfileView = 'overview' | 'edit_profile' | 'change_password' | 'meus_pedidos' | 'gamification';
import { Eye, EyeOff } from 'lucide-react';

// --- ÍCONES DEFINIDOS LOCALMENTE ---
const Icon = ({ path, className = "h-6 w-6" }: { path: string; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const ICONS = {
    dashboard: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    user: <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    lock: <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    gift: <Icon className="h-8 w-8 text-amber-500" path="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
    heart: <Icon className="h-8 w-8" path="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />,
    camera: <Icon className="h-5 w-5 mr-2" path="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
    clipboard: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    star: <Icon className="h-8 w-8 text-yellow-400" path="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />,
    trophy: <Icon path="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 6v2.25m5.06-4.424-1.28-1.28a.75.75 0 00-1.06 0l-1.28 1.28m11.94 4.424l.804.804a.75.75 0 010 1.06l-4.425 4.425a.75.75 0 01-1.06 0l-4.425-4.425a.75.75 0 010-1.06l.804-.804m-7.12 7.12l.804.804a.75.75 0 010 1.06l-4.425 4.425a.75.75 0 01-1.06 0l-4.425-4.425a.75.75 0 010-1.06l.804-.804" />,
};

// --- COMPONENTE PARA A VIEW DE GAMIFICAÇÃO ---
const GamificationView = ({ pontos }: { pontos: number }) => {
    const POINTS_PER_LEVEL = 100;
    const level = Math.floor(pontos / POINTS_PER_LEVEL) + 1;
    const pointsInCurrentLevel = pontos % POINTS_PER_LEVEL;
    const progressPercentage = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Meu Progresso</h2>
                <p className="text-slate-500">Acumule pontos e ajude ainda mais a nossa causa!</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-800">Nível Atual</p>
                <p className="text-5xl font-extrabold text-amber-600 my-2">{level}</p>
                <p className="font-bold text-slate-700 text-2xl">{pontos} <span className="text-lg font-medium text-slate-500">pontos</span></p>
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700">Progresso para o Nível {level + 1}</h3>
                    <p className="text-sm font-semibold text-amber-700">{pointsInCurrentLevel} / {POINTS_PER_LEVEL}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div className="bg-amber-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Como ganhar pontos?</h3>
                <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-3"><span className="text-amber-500">{ICONS.gift}</span><span>Faça uma doação para a associação.</span></li>
                    <li className="flex items-center gap-3"><span className="text-amber-500">{ICONS.heart}</span><span>Candidate-se e seja aprovado como voluntário.</span></li>
                    <li className="flex items-center gap-3"><span className="text-amber-500">{ICONS.clipboard}</span><span>Complete uma adoção responsável.</span></li>
                </ul>
            </div>
            <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Conquistas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2"><div className="p-4 bg-slate-100 rounded-full text-slate-400">{ICONS.gift}</div><p className="text-xs font-semibold text-slate-500">Primeira Doação</p></div>
                    <div className="flex flex-col items-center gap-2"><div className="p-4 bg-slate-100 rounded-full text-slate-400">{ICONS.heart}</div><p className="text-xs font-semibold text-slate-500">Coração Voluntário</p></div>
                    <div className="flex flex-col items-center gap-2"><div className="p-4 bg-slate-100 rounded-full text-slate-400">{ICONS.trophy}</div><p className="text-xs font-semibold text-slate-500">Herói de um Peludo</p></div>
                    <div className="flex flex-col items-center gap-2"><div className="p-4 bg-slate-100 rounded-full text-slate-400">{ICONS.star}</div><p className="text-xs font-semibold text-slate-500">Amigo Fiel</p></div>
                </div>
                <p className="text-center text-sm text-slate-400 mt-4">Em breve, novas conquistas estarão disponíveis!</p>
            </div>
        </div>
    );
};

// --- COMPONENTE PARA MOSTRAR OS PEDIDOS DE ADOÇÃO ---
const MeusPedidosView = ({ pedidos }: { pedidos: Adocao[] }) => {
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'APROVADA': return 'bg-green-100 text-green-800';
            case 'RECUSADA': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Meus Pedidos de Adoção</h2>
            {pedidos.length === 0 ? (
                <p className="text-gray-600">Você ainda não fez nenhum pedido de adoção.</p>
            ) : (
                <div className="space-y-4">
                    {pedidos.map(pedido => (
                        pedido.animal && (
                            <div key={pedido.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <img 
                                        src={`${api.defaults.baseURL}${pedido.animal.animalImageUrl}`} 
                                        alt={pedido.animal.nome}
                                        className="w-16 h-16 object-cover rounded-md"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/e2e8f0/cbd5e0?text=Sem+Foto'; }}
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800">{pedido.animal.nome}</p>
                                        <p className="text-sm text-gray-500">Pedido em: {new Date(pedido.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(pedido.status)}`}>
                                    {pedido.status.replace('_', ' ')}
                                </span>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: isAuthLoading, updateUser } = useAuth();
    const [activeView, setActiveView] = useState<ProfileView>('overview');
    
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [donationCount, setDonationCount] = useState(0);
    const [volunteerStatus, setVolunteerStatus] = useState<string | null>(null);
    const [pedidos, setPedidos] = useState<Adocao[]>([]);
    const [pontos, setPontos] = useState(0);
    const [isGamificationActive, setIsGamificationActive] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    useEffect(() => {
        if (user) {
            setNome(user.nome);
            setEmail(user.email);
            setTelefone(user.telefone || '');
            setPontos(user.pontos || 0);

            if (user.profileImageUrl) {
                setAvatarUrl(`${api.defaults.baseURL}${user.profileImageUrl}?t=${new Date().getTime()}`);
            } else {
                setAvatarUrl(`https://ui-avatars.com/api/?name=${user.nome.replace(' ', '+')}&background=0ea5e9&color=fff&size=128`);
            }

            const fetchAllData = async () => {
                try {
                    const [donationsRes, volunteerRes, adocoesRes, configRes] = await Promise.all([
                        api.get<Doacao[]>('/doacao'),
                        api.get<Voluntario | null>('/voluntario/meu-status'),
                        api.get<Adocao[]>('/adocoes/meus-pedidos'),
                        api.get('/configuracao'),
                    ]);
                    
                    setIsGamificationActive(configRes.data.gamificacaoAtiva);
                    const userDonations = donationsRes.data.filter(d => d.usuarioId === user.id);
                    setDonationCount(userDonations.length);
                    const userVolunteer = volunteerRes.data;
                    setVolunteerStatus(userVolunteer ? userVolunteer.status : 'Não se candidatou');
                    setPedidos(adocoesRes.data);
                } catch (error) {
                    console.error("Erro ao buscar dados do perfil:", error);
                    toast.error('Não foi possível carregar todos os dados do perfil.');
                }
            };
            fetchAllData();
        }
    }, [user]);

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            const response = await api.patch('/usuario/me/profile', { nome, email, telefone });
            updateUser(response.data);
            toast.success('Perfil atualizado com sucesso!');
            setActiveView('overview');
        } catch {
            toast.error('Erro ao atualizar o perfil.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            await api.patch('/usuario/me/change-password', { senhaAtual, novaSenha });
            toast.success('Senha alterada com sucesso!');
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

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading('A enviar a sua nova foto...');
        try {
            const response = await api.patch<Usuario>('/usuario/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateUser(response.data);
            toast.success('Foto de perfil atualizada!', { id: toastId });
        } catch {
            toast.error('Erro ao enviar a foto.', { id: toastId });
        }
    };

    if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen" />;

    if (!isAuthenticated || !user) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
                <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center space-y-6">
                    <h2 className="text-3xl font-extrabold text-slate-900">Acesso Negado</h2>
                    <p className="text-slate-600">Por favor, faça login para aceder ao seu perfil.</p>
                    <Link href="/login" className="block w-full px-6 py-3 font-semibold text-white bg-amber-600 rounded-lg shadow-md hover:bg-amber-700 transition">
                        Ir para o Login
                    </Link>
                </div>
            </main>
        );
    }

    const getStatusClasses = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'aprovado': return 'text-green-600 bg-green-100 border-green-200';
            case 'pendente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'recusado': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-slate-600 bg-slate-100 border-slate-200';
        }
    };

    return (
        <main className="bg-slate-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="relative">
                        <img 
                            src={avatarUrl} 
                            alt="Foto de Perfil" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 bg-slate-200" 
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-800">{user.nome}</h1>
                        <p className="text-slate-500 mt-1">{user.email}</p>
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 bg-amber-200 text-slate-800 hover:bg-amber-300 font-semibold"
                        >
                            {ICONS.camera}
                            Alterar Foto
                        </Button>
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                <div className="flex flex-col md:flex-row gap-8">
                    <nav className="flex-shrink-0 w-full md:w-64">
                        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
                            <button onClick={() => setActiveView('overview')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'overview' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                                {ICONS.dashboard}
                                <span>Resumo</span>
                            </button>
                            {isGamificationActive && (
                                <button onClick={() => setActiveView('gamification')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'gamification' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                                    {ICONS.trophy}
                                    <span>Minha Pontuação</span>
                                </button>
                            )}
                            <button onClick={() => setActiveView('edit_profile')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'edit_profile' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                                {ICONS.user}
                                <span>Editar Perfil</span>
                            </button>
                            <button onClick={() => setActiveView('change_password')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'change_password' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                                {ICONS.lock}
                                <span>Alterar Senha</span>
                            </button>
                            <button onClick={() => setActiveView('meus_pedidos')} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left font-semibold transition-all duration-200 ${activeView === 'meus_pedidos' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                                {ICONS.clipboard}
                                <span>Meus Pedidos</span>
                            </button>
                        </div>
                    </nav>
                    <div className="flex-1">
                        {activeView === 'overview' && (
                            <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumo da sua Atividade</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {isGamificationActive && (
                                        <div className="bg-slate-50 p-6 rounded-xl border flex items-center gap-4">
                                            {ICONS.star}
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Sua Pontuação</p>
                                                <p className="text-3xl font-bold text-slate-800">{pontos}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 p-6 rounded-xl border flex items-center gap-4">
                                        {ICONS.gift}
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Doações Realizadas</p>
                                            <p className="text-3xl font-bold text-amber-600">{donationCount}</p>
                                        </div>
                                    </div>
                                    <div className={`p-6 rounded-xl border flex items-center gap-4 ${getStatusClasses(volunteerStatus)}`}>
                                        <div className="text-current">{ICONS.heart}</div>
                                        <div>
                                            <p className="text-sm font-medium">Status de Voluntário</p>
                                            <p className="text-2xl font-bold capitalize">{volunteerStatus || 'Não se candidatou'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeView === 'gamification' && <GamificationView pontos={pontos} />}

                        {activeView === 'edit_profile' && (
                           <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Dados Pessoais</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-700">Nome Completo</label>
                                        <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} disabled={isProfileLoading} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
                                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isProfileLoading} />
                                    </div>
                                    <div>
                                        <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-700">Telefone</label>
                                        <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} disabled={isProfileLoading} />
                                    </div>
                                    <div className="pt-4 flex justify-end space-x-3">
                                        <Button type="button" onClick={() => setActiveView('overview')} className="bg-red-200 text-red-800 hover:bg-red-300 font-semibold" disabled={isProfileLoading}>Cancelar</Button>
                                        <Button type="submit" isLoading={isProfileLoading}>Guardar Alterações</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeView === 'change_password' && (
                           <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Alterar Senha</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label htmlFor="senhaAtual" className="block mb-2 text-sm font-medium text-gray-700">Senha Atual</label>
                                        <Input id="senhaAtual" type={showCurrentPassword ? 'text' : 'password'} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}  icon={showCurrentPassword ? <Eye/> : <EyeOff/>} onIconClick={() => setShowCurrentPassword(!showCurrentPassword)} disabled={isPasswordLoading} />
                                    </div>
                                    <div>
                                        <label htmlFor="novaSenha" className="block mb-2 text-sm font-medium text-gray-700">Nova Senha</label>
                                        <Input id="novaSenha" type={showNewPassword ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)} icon={showNewPassword ? <Eye/> : <EyeOff/>} onIconClick={() => setShowNewPassword(!showNewPassword)} disabled={isPasswordLoading} />
                                    </div>
                                    <div className="pt-4 flex justify-end space-x-3">
                                        <Button type="button" onClick={() => setActiveView('overview')} className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" disabled={isPasswordLoading}>Cancelar</Button>
                                        <Button type="submit" isLoading={isPasswordLoading}>Alterar Senha</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeView === 'meus_pedidos' && <MeusPedidosView pedidos={pedidos} />}
                    </div>
                </div>
            </div>
        </main>
    );
}


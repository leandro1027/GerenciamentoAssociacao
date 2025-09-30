'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/services/api';
import { Animal, StatusAnimal } from '@/types'; // Adicione 'Especie', 'Sexo', 'Porte' se precisar aqui para os ícones
import Button from '@/app/components/common/button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// --- Ícones (mantidos) ---
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// --- Componente para Características do Animal (ajustado para ser menor) ---
const AnimalFeature = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-2 p-2 bg-amber-50/70 rounded-lg text-sm"> {/* Ajustado para ser menor */}
        <div className="p-2 bg-white rounded-full shadow-sm">
            {icon}
        </div>
        <div>
            <p className="font-semibold text-gray-600">{label}</p>
            <p className="font-bold text-gray-900 capitalize">{value}</p>
        </div>
    </div>
);

// --- AdoptionModal (sem alterações) ---
const AdoptionModal = ({ animal, onClose, onSubmit }: { animal: Animal, onClose: () => void, onSubmit: (data: any) => Promise<void> }) => {
    const [formData, setFormData] = useState({
        tipoMoradia: '',
        outrosAnimais: '',
        tempoDisponivel: '',
        motivoAdocao: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSubmit({ animalId: animal.id, ...formData });
        setIsLoading(false);
    };

    const selectOptions = {
        tipoMoradia: ['Casa com pátio fechado', 'Apartamento', 'Chácara/Sítio'],
        outrosAnimais: ['Sim', 'Não'],
        tempoDisponivel: ['Manhãs e noites', 'Apenas noites', 'Tempo integral'],
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in-up">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Questionário de Adoção</h2>
                    <p className="text-gray-600 mt-1">Interessado em adotar <span className="font-semibold text-amber-800">{animal.nome}</span>?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Qual o seu tipo de moradia?</label>
                        <select value={formData.tipoMoradia} onChange={e => setFormData({ ...formData, tipoMoradia: e.target.value })} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
                            <option value="" disabled>Selecione uma opção</option>
                            {selectOptions.tipoMoradia.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Você possui outros animais?</label>
                        <select value={formData.outrosAnimais} onChange={e => setFormData({ ...formData, outrosAnimais: e.target.value })} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
                            <option value="" disabled>Selecione uma opção</option>
                            {selectOptions.outrosAnimais.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quanto tempo você terá disponível para o animal?</label>
                        <select value={formData.tempoDisponivel} onChange={e => setFormData({ ...formData, tempoDisponivel: e.target.value })} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 text-gray-900">
                            <option value="" disabled>Selecione uma opção</option>
                            {selectOptions.tempoDisponivel.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Por que deseja adotar {animal.nome}?</label>
                        <textarea value={formData.motivoAdocao} onChange={e => setFormData({ ...formData, motivoAdocao: e.target.value })} rows={3} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-800 focus:ring-amber-800 placeholder:text-gray-400 text-gray-900" placeholder="Conte-nos um pouco..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" onClick={onClose} variant="outline">Cancelar</Button>
                        <Button type="submit" isLoading={isLoading} className="bg-amber-800 hover:bg-amber-900 focus:ring-amber-500">Enviar Pedido</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Card para a seção "Outros Animais" (mantido, mas agora com um novo nome para a seção)
const OtherAnimalCard = ({ animal }: { animal: Animal }) => (
    <Link href={`/adote/${animal.id}`} className="group block space-y-2"> {/* Espaçamento reduzido */}
        <div className="aspect-square rounded-xl overflow-hidden shadow-md">
            <img
                src={animal.animalImageUrl ? `${api.defaults.baseURL}${animal.animalImageUrl}` : '/placeholder.png'}
                alt={animal.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <h3 className="font-bold text-base text-gray-800 group-hover:text-amber-800 transition-colors">{animal.nome}</h3> {/* Tamanho da fonte ajustado */}
    </Link>
);


// Componente de Skeleton Loader (adaptado para o novo layout)
const AnimalDetailSkeleton = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded-md mb-8"></div> {/* Breadcrumb */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Esqueleto da Imagem Principal e Miniaturas */}
            <div>
                <div className="aspect-square rounded-2xl bg-gray-200 mb-4"></div>
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>

            {/* Esqueleto dos Detalhes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                <div className="h-6 w-32 bg-gray-200 rounded-full mb-2"></div> {/* Status */}
                <div className="h-10 w-4/5 bg-gray-200 rounded-md"></div> {/* Nome */}
                <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div> {/* Raça */}
                
                <div className="flex flex-wrap gap-2 mt-4"> {/* Tags */}
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    ))}
                </div>

                <div className="border-t pt-6 space-y-4">
                    <div className="h-8 w-40 bg-gray-200 rounded-md"></div> {/* Título Características */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                        <div className="h-20 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
                <div className="border-t pt-6 space-y-3">
                    <div className="h-8 w-32 bg-gray-200 rounded-md"></div> {/* Título História */}
                    <div className="h-5 w-full bg-gray-200 rounded-md"></div>
                    <div className="h-5 w-full bg-gray-200 rounded-md"></div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded-md"></div>
                </div>
                 <div className="border-t pt-6">
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div> {/* Botão */}
                </div>
            </div>
        </div>

        {/* Esqueleto da seção "Outros Amigos" */}
        <div className="mt-16">
            <div className="h-9 w-64 mx-auto bg-gray-200 rounded-md mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="aspect-square bg-gray-200 rounded-xl"></div>
                        <div className="h-5 w-3/4 bg-gray-200 rounded-md"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export default function AnimalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [otherAnimals, setOtherAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasPendingAdoption, setHasPendingAdoption] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // NOVO: Estado para a imagem da galeria

    const id = params.id as string;

    useEffect(() => {
        if (id) {
            const fetchAnimalData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const [animalResponse, othersResponse] = await Promise.all([
                        api.get<Animal>(`/animais/${id}`),
                        // Busca outros 5 animais para ter certeza de 4 diferentes do atual
                        api.get<Animal[]>(`/animais?status=DISPONIVEL&limit=5`)
                    ]);
                    
                    setAnimal(animalResponse.data);
                    // Filtra o animal atual e limita a 4
                    setOtherAnimals(othersResponse.data.filter(a => a.id !== id).slice(0, 4));

                    if (isAuthenticated) {
                        try {
                            const adoptionCheckResponse = await api.get<{ hasPending: boolean }>(`/adocoes/verificar/${id}`);
                            setHasPendingAdoption(adoptionCheckResponse.data.hasPending);
                        } catch (adoptionError) {
                            console.error("Falha ao verificar adoção pendente:", adoptionError);
                        }
                    }
                } catch (err) {
                    setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchAnimalData();
        }
    }, [id, isAuthenticated]);

    // Função para obter todas as URLs de imagem (principal + extras)
    const getAllImageUrls = () => {
        const urls = [];
        if (animal?.animalImageUrl) {
            urls.push(`${api.defaults.baseURL}${animal.animalImageUrl}`);
        }
        // Adicione aqui a lógica para outras imagens, se tiver
        // Exemplo: if (animal?.outrasImagens && animal.outrasImagens.length > 0) {
        //   urls.push(...animal.outrasImagens.map(img => `${api.defaults.baseURL}${img.url}`));
        // }
        // Se não houver outras imagens, use a principal como placeholder para a galeria
        if (urls.length === 1) {
            urls.push(urls[0], urls[0], urls[0]); // Mock 3x a mesma imagem para ter miniaturas
        } else if (urls.length === 0) {
            urls.push('https://placehold.co/600x600/e2e8f0/cbd5e0?text=Sem+Foto');
        }
        return urls;
    };


    const handleOpenAdoptionModal = () => {
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado para solicitar uma adoção.');
            router.push('/login');
            return;
        }
        if (hasPendingAdoption) {
            toast.error('Você já possui um pedido de adoção em andamento para este animal.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleAdoptionSubmit = async (formData: any) => {
        try {
            await api.post('/adocoes', formData);
            toast.success('Pedido de adoção enviado com sucesso! Entraremos em contacto.');
            setIsModalOpen(false);
            setHasPendingAdoption(true);
            if (animal) {
                setAnimal({ ...animal, status: StatusAnimal.EM_PROCESSO_ADOCAO });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Não foi possível enviar o pedido.');
        }
    };
    
    if (loading) return <main className="bg-gray-50 pt-12 pb-24"><AnimalDetailSkeleton /></main>;
    if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;
    if (!animal) return null;

    const allImageUrls = getAllImageUrls();
    const currentImageUrl = allImageUrls[currentImageIndex];

    const statusInfo = {
        DISPONIVEL: { text: 'Disponível para Adoção', color: 'bg-green-100 text-green-800' },
        EM_PROCESSO_ADOCAO: { text: 'Em Processo de Adoção', color: 'bg-yellow-100 text-yellow-800' },
        ADOTADO: { text: 'Já encontrou um lar!', color: 'bg-blue-100 text-blue-800' },
    };

    const getButtonState = () => {
        if (hasPendingAdoption) {
            return { text: 'Pedido já enviado', disabled: true };
        }
        if (animal.status !== 'DISPONIVEL') {
            return { text: 'Adoção em Processo', disabled: true };
        }
        return { text: `Quero Adotar o(a) ${animal.nome}`, disabled: false };
    }

    const buttonState = getButtonState();

    // Mock de características para demonstração (substitua com dados reais se tiver)
    const mockCaracteristicas = ['Dócil', 'Brincalhão', 'Castrado', 'Vacinado', 'Vermifugado'];


    return (
        <>
            {isModalOpen && (
                <AdoptionModal
                    animal={animal}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAdoptionSubmit}
                />
            )}
            <main className="bg-gray-50 pt-8 pb-16 sm:pt-12 sm:pb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="mb-8 text-sm font-medium text-gray-500">
                        <Link href="/adote" className="hover:text-amber-800 transition-colors">Adote</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{animal.nome}</span>
                    </nav>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        
                        {/* Imagem Principal e Galeria de Miniaturas */}
                        <div>
                            <div className="aspect-square rounded-xl overflow-hidden shadow-lg mb-4">
                                <img src={currentImageUrl} alt={`Foto de ${animal.nome}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {allImageUrls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200
                                            ${index === currentImageIndex ? 'border-amber-800 ring-2 ring-amber-500' : 'border-gray-200 hover:border-amber-400'}`}
                                    >
                                        <img src={url} alt={`Miniatura ${index + 1} de ${animal.nome}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Detalhes do Animal */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{animal.nome}</h1> {/* Nome menor */}
                                <p className="text-base text-gray-500">{animal.raca}</p> {/* Raça menor */}
                                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${statusInfo[animal.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                    {statusInfo[animal.status]?.text || 'Status Indefinido'}
                                </span>
                            </div>

                            {/* Tags de Características */}
                            {mockCaracteristicas.length > 0 && ( // Use animal.caracteristicas.length > 0 se tiver o campo
                                <div className="flex flex-wrap gap-2">
                                    {mockCaracteristicas.map((carac, index) => ( // Use animal.caracteristicas.map se tiver o campo
                                        <span key={index} className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {carac}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">Detalhes</h2> {/* Título menor */}
                                <div className="grid grid-cols-2 gap-3"> {/* Espaçamento reduzido */}
                                    <AnimalFeature
                                        icon={<Icon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" className="w-5 h-5 text-amber-700" />}
                                        label="Sexo"
                                        value={animal.sexo}
                                    />
                                    <AnimalFeature
                                        icon={<Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" className="w-5 h-5 text-amber-700" />}
                                        label="Idade"
                                        value={animal.idade}
                                    />
                                    <AnimalFeature
                                        icon={<Icon path="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" className="w-5 h-5 text-amber-700" />}
                                        label="Porte"
                                        value={animal.porte}
                                    />
                                    {/* Adicione outras características aqui, se houver */}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-3">Minha História</h2> {/* Título menor */}
                                <p className="leading-relaxed text-gray-700 text-justify text-sm">{animal.descricao}</p> {/* Texto menor */}
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <Button
                                    onClick={handleOpenAdoptionModal}
                                    className="w-full text-lg py-3 bg-amber-800 hover:bg-amber-900 focus:ring-amber-500"
                                    disabled={buttonState.disabled}
                                >
                                    {buttonState.text}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção "Outros amigos esperando seu clique" */}
                {otherAnimals.length > 0 && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Outros peludos esperando seu clique</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"> {/* Mais colunas e espaçamento */}
                            {otherAnimals.map(other => (
                                <OtherAnimalCard key={other.id} animal={other} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
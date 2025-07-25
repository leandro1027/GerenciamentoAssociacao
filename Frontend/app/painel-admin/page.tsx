'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';
import { Voluntario, Usuario, StatusVoluntario, Slide, Doacao, Animal, Especie, Sexo, Porte, Adocao, StatusAdocao } from '../../types';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// TIPO PARA CONTROLAR A VISTA ATIVA
type AdminView = 'slides' | 'voluntarios' | 'membros' | 'doacoes' | 'animais' | 'adocoes';

// --- COMPONENTES FILHOS ---

// 1. COMPONENTE PARA GERIR SLIDES
const SlideManager = ({ initialSlides }: { initialSlides: Slide[] }) => {
  const [slides, setSlides] = useState(initialSlides);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecione uma imagem.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subtitle', subtitle);

    try {
      const response = await api.post<Slide>('/slide', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSlides([response.data, ...slides]);
      setTitle(''); setSubtitle(''); setFile(null);
      (document.getElementById('slide-file-input') as HTMLInputElement).value = '';
      toast.success('Slide criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar o slide.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem a certeza?')) {
      try {
        await api.delete(`/slide/${id}`);
        setSlides(slides.filter(slide => slide.id !== id));
        toast.success('Slide apagado com sucesso!');
      } catch (error) {
        toast.error('Erro ao apagar o slide.');
      }
    }
  };

  return (
    <section>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleCreate} className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Adicionar Novo Slide</h3>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do Slide" required />
          <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtítulo (opcional)" />
          <div>
            <label htmlFor="slide-file-input" className="block mb-2 text-sm font-medium text-gray-700">Imagem do Slide</label>
            <input id="slide-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
          </div>
          <Button type="submit">Adicionar Slide</Button>
        </form>
        <div>
          <h3 className="font-semibold mb-2 text-gray-800">Slides Atuais</h3>
          <div className="space-y-2">
            {slides.map(slide => (
              <div key={slide.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
                <div className="flex items-center space-x-4">
                  <img src={`${api.defaults.baseURL}${slide.imageUrl}`} alt={slide.title} className="w-20 h-12 object-cover rounded-md" />
                  <div>
                    <p className="font-semibold text-gray-900">{slide.title}</p>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(slide.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Apagar</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. COMPONENTE PARA GERIR VOLUNTÁRIOS
const VolunteerManager = ({ initialVolunteers }: { initialVolunteers: Voluntario[] }) => {
    const [voluntarios, setVoluntarios] = useState(initialVolunteers);

    const handleUpdateStatus = async (voluntarioId: number, status: StatusVoluntario) => {
        try {
          await api.patch(`/voluntario/${voluntarioId}`, { status });
          setVoluntarios(prev => prev.map(v => v.id === voluntarioId ? { ...v, status } : v));
          toast.success('Status do voluntário atualizado!');
        } catch (err) {
          toast.error('Erro ao atualizar o status.');
        }
    };

    const getStatusClass = (status: StatusVoluntario) => {
        switch (status) {
          case 'aprovado': return 'bg-green-100 text-green-800';
          case 'recusado': return 'bg-red-100 text-red-800';
          default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <section>
          <div className="bg-white rounded-xl shadow p-6">
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {voluntarios.map(voluntario => (
                              <tr key={voluntario.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{voluntario.usuario?.nome || 'Utilizador não encontrado'}</div>
                                      <div className="text-sm text-gray-500">{voluntario.usuario?.email}</div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 max-w-sm whitespace-normal">{voluntario.motivo}</td>
                                  <td className="px-6 py-4 text-center">
                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(voluntario.status)}`}>{voluntario.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                                      {voluntario.status === 'pendente' && (
                                          <>
                                              <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-green-600 hover:text-green-900">Aprovar</button>
                                              <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900">Recusar</button>
                                          </>
                                      )}
                                      {voluntario.status === 'aprovado' && (
                                          <button onClick={() => handleUpdateStatus(voluntario.id, 'recusado')} className="text-red-600 hover:text-red-900">Alterar para Recusado</button>
                                      )}
                                      {voluntario.status === 'recusado' && (
                                          <button onClick={() => handleUpdateStatus(voluntario.id, 'aprovado')} className="text-green-600 hover:text-green-900">Alterar para Aprovado</button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        </section>
    );
};

// 3. COMPONENTE PARA GERIR MEMBROS
const MemberManager = ({ initialUsers }: { initialUsers: Usuario[] }) => {
    const [usuarios, setUsuarios] = useState(initialUsers);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    const handleDelete = async (userId: number) => {
        if (confirm('Tem a certeza de que deseja apagar este membro?')) {
            try {
                await api.delete(`/usuario/${userId}`);
                setUsuarios(usuarios.filter(u => u.id !== userId));
                toast.success('Membro apagado com sucesso!');
            } catch (error) {
                toast.error('Erro ao apagar o membro.');
            }
        }
    };

    const handleEdit = (user: Usuario) => {
        setEditingUser({ ...user });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const { id, nome, email, telefone } = editingUser;
            const response = await api.patch(`/usuario/${id}`, { nome, email, telefone });
            setUsuarios(usuarios.map(u => u.id === id ? response.data : u));
            setEditingUser(null);
            toast.success('Membro atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar o membro.');
        }
    };

    return (
        <section>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map(user => (
                                <tr key={user.id}>
                                    {editingUser?.id === user.id ? (
                                        <>
                                            <td className="px-6 py-4"><Input value={editingUser.nome} onChange={e => setEditingUser({...editingUser, nome: e.target.value})} /></td>
                                            <td className="px-6 py-4"><Input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} /></td>
                                            <td className="px-6 py-4"><Input value={editingUser.telefone || ''} onChange={e => setEditingUser({...editingUser, telefone: e.target.value})} /></td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button onClick={handleUpdate} className="text-blue-600 hover:text-blue-900">Guardar</button>
                                                <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

// 4. COMPONENTE PARA LISTAR DOAÇÕES
const DonationManager = ({ initialDonations }: { initialDonations: Doacao[] }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <section>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {initialDonations.map(doacao => (
                                <tr key={doacao.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{doacao.usuario?.nome || 'Utilizador não encontrado'}</div>
                                        <div className="text-sm text-gray-500">{doacao.usuario?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(doacao.valor)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(doacao.data)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

// 5. COMPONENTE PARA GERIR ANIMAIS
const AnimalManager = ({ animals, setAnimals }: { animals: Animal[], setAnimals: React.Dispatch<React.SetStateAction<Animal[]>> }) => {
  const [formData, setFormData] = useState({ nome: '', raca: '', idade: '', descricao: '' });
  const [especie, setEspecie] = useState<Especie>(Especie.CAO);
  const [sexo, setSexo] = useState<Sexo>(Sexo.MACHO);
  const [porte, setPorte] = useState<Porte>(Porte.PEQUENO);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const handleCreateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
        toast.error('Por favor, selecione uma imagem para o animal.');
        return;
    }
    setIsLoading(true);

    const data = new FormData();
    data.append('nome', formData.nome);
    data.append('raca', formData.raca);
    data.append('idade', formData.idade);
    data.append('descricao', formData.descricao);
    data.append('especie', especie);
    data.append('sexo', sexo);
    data.append('porte', porte);
    data.append('file', file);

    try {
      const response = await api.post<Animal>('/animais', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAnimals(prev => [response.data, ...prev]);
      toast.success('Animal cadastrado com sucesso!');
      setFormData({ nome: '', raca: '', idade: '', descricao: '' });
      setEspecie(Especie.CAO);
      setSexo(Sexo.MACHO);
      setPorte(Porte.PEQUENO);
      setFile(null);
      (document.getElementById('animal-file-input') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      toast.error('Não foi possível cadastrar o animal.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (animalId: string) => {
    if (confirm('Tem a certeza que deseja apagar este animal?')) {
      try {
        await api.delete(`/animais/${animalId}`);
        setAnimals(prev => prev.filter(a => a.id !== animalId));
        toast.success('Animal apagado com sucesso!');
      } catch (error) {
        toast.error('Erro ao apagar o animal.');
      }
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal({ ...animal });
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAnimal) return;
    setIsLoading(true);

    try {
      const { id, nome, raca, idade, descricao, especie, sexo, porte } = editingAnimal;
      const response = await api.patch<Animal>(`/animais/${id}`, { nome, raca, idade, descricao, especie, sexo, porte });
      setAnimals(prev => prev.map(a => a.id === id ? response.data : a));
      setEditingAnimal(null);
      toast.success('Animal atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar o animal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Cadastrar Novo Animal</h3>
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <Input id="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Bob" required />
            </div>
            <div>
              <label htmlFor="raca" className="block text-sm font-medium text-gray-700 mb-2">Raça</label>
              <Input id="raca" value={formData.raca} onChange={(e) => setFormData({...formData, raca: e.target.value})} placeholder="Ex: Sem Raça Definida (SRD)" required />
            </div>
            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
              <Input id="idade" value={formData.idade} onChange={(e) => setFormData({...formData, idade: e.target.value})} placeholder="Ex: Aprox. 2 anos" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="especie" className="block text-sm font-medium text-gray-700 mb-2">Espécie</label>
              <select id="especie" value={especie} onChange={(e) => setEspecie(e.target.value as Especie)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={Especie.CAO}>Cão</option>
                <option value={Especie.GATO}>Gato</option>
              </select>
            </div>
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
              <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={Sexo.MACHO}>Macho</option>
                <option value={Sexo.FEMEA}>Fêmea</option>
              </select>
            </div>
            <div>
              <label htmlFor="porte" className="block text-sm font-medium text-gray-700 mb-2">Porte</label>
              <select id="porte" value={porte} onChange={(e) => setPorte(e.target.value as Porte)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={Porte.PEQUENO}>Pequeno</option>
                <option value={Porte.MEDIO}>Médio</option>
                <option value={Porte.GRANDE}>Grande</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="animal-file-input" className="block text-sm font-medium text-gray-700 mb-2">Foto do Animal</label>
            <input id="animal-file-input" type="file" accept="image/*" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">Descrição e Comportamento</label>
            <textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" placeholder="Conte a história do animal, como ele é com pessoas, outros animais, etc." required></textarea>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading}>Cadastrar Animal</Button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Animais Cadastrados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raça</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animals.map(animal => (
                <tr key={animal.id}>
                  {editingAnimal?.id === animal.id ? (
                    <>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4"><Input value={editingAnimal.nome} onChange={e => setEditingAnimal({...editingAnimal, nome: e.target.value})} /></td>
                      <td className="px-6 py-4"><Input value={editingAnimal.raca} onChange={e => setEditingAnimal({...editingAnimal, raca: e.target.value})} /></td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4 text-center space-x-2">
                          <button onClick={handleUpdate} className="text-blue-600 hover:text-blue-900">Guardar</button>
                          <button onClick={() => setEditingAnimal(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <img src={`${api.defaults.baseURL}${animal.animalImageUrl}`} alt={animal.nome} className="w-12 h-12 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.raca}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.status}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(animal)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// 6. COMPONENTE PARA GERIR ADOÇÕES (COM MODAL ATUALIZADO)
const AdoptionManager = ({ initialAdoptions, onUpdate }: { initialAdoptions: Adocao[], onUpdate: (updatedAdoption: Adocao) => void }) => {
    const [selectedAdoption, setSelectedAdoption] = useState<Adocao | null>(null);
    const [activeTab, setActiveTab] = useState<'pendentes' | 'finalizadas'>('pendentes');

    const pendingAdoptions = initialAdoptions.filter(a => a.status === StatusAdocao.SOLICITADA || a.status === StatusAdocao.EM_ANALISE);
    const finalizedAdoptions = initialAdoptions.filter(a => a.status === StatusAdocao.APROVADA || a.status === StatusAdocao.RECUSADA);

    const getStatusClass = (status: StatusAdocao) => {
        switch (status) {
            case StatusAdocao.APROVADA: return 'bg-green-100 text-green-800';
            case StatusAdocao.RECUSADA: return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleUpdateStatus = async (adocaoId: string, status: StatusAdocao) => {
        try {
            const response = await api.patch<Adocao>(`/adocoes/${adocaoId}/status`, { status });
            onUpdate(response.data);
            toast.success(`Pedido ${status === StatusAdocao.APROVADA ? 'aprovado' : 'recusado'} com sucesso!`);
            setSelectedAdoption(null);
        } catch (error) {
            toast.error('Erro ao atualizar o status do pedido.');
        }
    };

    const handleWhatsAppContact = (adocao: Adocao, isFollowUp: boolean = false) => {
        if (!adocao.usuario?.telefone) {
            toast.error('Este utilizador não possui um número de telefone registado.');
            return;
        }
        const numero = adocao.usuario.telefone.replace(/\D/g, '');
        const nomeAnimal = adocao.animal?.nome;
        let texto;

        if (isFollowUp) {
            texto = encodeURIComponent(`Olá ${adocao.usuario.nome}! Somos da associação de protetores independentes Fabiana Forte Huergo e gostaríamos de fazer o acompanhamento da adoção do(a) ${nomeAnimal}. Como ele(a) está a adaptar-se ao novo lar?`);
        } else {
            texto = encodeURIComponent(`Olá ${adocao.usuario.nome}! Vimos o seu interesse em adotar o(a) ${nomeAnimal}. Gostaríamos de conversar mais sobre o processo!`);
        }
        
        window.open(`https://wa.me/55${numero}?text=${texto}`, '_blank');
    };

    return (
        <section className="bg-white rounded-xl shadow p-6">
            {/* Abas de Navegação */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('pendentes')} className={`${activeTab === 'pendentes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Pedidos Pendentes ({pendingAdoptions.length})
                    </button>
                    <button onClick={() => setActiveTab('finalizadas')} className={`${activeTab === 'finalizadas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Adoções Finalizadas ({finalizedAdoptions.length})
                    </button>
                </nav>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(activeTab === 'pendentes' ? pendingAdoptions : finalizedAdoptions).map(adocao => (
                            (adocao.animal && adocao.usuario) && (
                                <tr key={adocao.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adocao.animal.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adocao.usuario.nome}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(adocao.status)}`}>
                                            {adocao.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                                        {activeTab === 'pendentes' ? (
                                            <button onClick={() => setSelectedAdoption(adocao)} className="text-blue-600 hover:text-blue-900">Analisar Pedido</button>
                                        ) : (
                                            adocao.status === StatusAdocao.APROVADA && (
                                                <button onClick={() => handleWhatsAppContact(adocao, true)} className="text-green-600 hover:text-green-900">Acompanhar via WhatsApp</button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE DETALHES DA ADOÇÃO (NOVO DESIGN) */}
            {selectedAdoption && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-gray-50 rounded-xl shadow-2xl p-8 max-w-3xl w-full transform transition-all duration-300 scale-95 animate-fade-in-up">
                        {/* Header com título e botão de fechar */}
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Pedido de Adoção</h2>
                            <button onClick={() => setSelectedAdoption(null)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="py-6 space-y-6">
                            {/* Informações do Animal e Candidato */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Informações do Animal</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p><strong className="font-medium text-gray-800">Nome:</strong> {selectedAdoption.animal?.nome}</p>
                                        <p><strong className="font-medium text-gray-800">Espécie:</strong> {selectedAdoption.animal?.especie}</p>
                                        <p><strong className="font-medium text-gray-800">Raça:</strong> {selectedAdoption.animal?.raca}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Informações do Candidato</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p><strong className="font-medium text-gray-800">Nome:</strong> {selectedAdoption.usuario?.nome}</p>
                                        <p><strong className="font-medium text-gray-800">Email:</strong> {selectedAdoption.usuario?.email}</p>
                                        <p><strong className="font-medium text-gray-800">Telefone:</strong> {selectedAdoption.usuario?.telefone || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Questionário */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-700 border-b pb-2">Respostas do Questionário</h3>
                                <div className="bg-white p-4 rounded-lg border space-y-3 text-gray-600">
                                    <div>
                                        <p className="font-medium text-gray-800">Qual o seu tipo de moradia?</p>
                                        <p className="pl-2">- {selectedAdoption.tipoMoradia || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Você possui outros animais?</p>
                                        <p className="pl-2">- {selectedAdoption.outrosAnimais || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Quanto tempo você terá disponível?</p>
                                        <p className="pl-2">- {selectedAdoption.tempoDisponivel || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Por que gostaria de adotar?</p>
                                        <p className="pl-2">- {selectedAdoption.motivoAdocao || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer com botões de ação */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t space-y-4 sm:space-y-0">
                            <Button onClick={() => handleWhatsAppContact(selectedAdoption)} className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.001 2C5.582 2 2 5.582 2 10.001c0 1.511.413 2.925 1.15 4.156l-1.15 4.156 4.296-1.13c1.21.69 2.598 1.093 4.054 1.093 4.418 0 8-3.582 8-8.001 0-4.418-3.582-8-8-8zm4.134 9.478c-.23.645-.854 1.11-1.48 1.228-.51.1-.926.04-1.37-.158-.58-.26-1.18-.59-1.73-.99-1.12-0.8-1.88-1.88-2.08-2.22-.2-.34-.48-.59-.48-.96 0-.37.23-.59.48-.79.25-.2.53-.26.73-.26h.3c.23 0 .45.03.65.34.2.31.68.82.73.88.05.06.1.12.01.23-.09.11-.14.17-.26.31-.12.14-.23.28-.34.39-.12.12-.23.26-.11.48.11.22.53.88 1.12 1.44.79.79 1.41 1.02 1.63 1.12.22.1.34.09.48-.06.14-.15.59-.68.73-.88.14-.2.31-.23.53-.23.2 0 .48.01.68.03.2.02.31.01.45.14.14.13.23.29.26.48.03.19.03.91-.2 1.556z" /></svg>
                                Contactar Candidato
                            </Button>
                            <div className="flex space-x-3 w-full sm:w-auto">
                                {selectedAdoption.status === StatusAdocao.SOLICITADA ? (
                                    <>
                                        <Button onClick={() => handleUpdateStatus(selectedAdoption.id, StatusAdocao.APROVADA)} className="w-full bg-blue-600 hover:bg-blue-700">Aprovar</Button>
                                        <Button onClick={() => handleUpdateStatus(selectedAdoption.id, StatusAdocao.RECUSADA)} className="w-full bg-red-600 hover:bg-red-700">Recusar</Button>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-600">Este pedido já foi processado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function AdminPanelPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('slides');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [adocoes, setAdocoes] = useState<Adocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [voluntariosRes, usuariosRes, slidesRes, doacoesRes, animaisRes, adocoesRes] = await Promise.all([
            api.get<Voluntario[]>('/voluntario'),
            api.get<Usuario[]>('/usuario'),
            api.get<Slide[]>('/slide'),
            api.get<Doacao[]>('/doacao'),
            api.get<Animal[]>('/animais'),
            api.get<Adocao[]>('/adocoes'),
          ]);
          setVoluntarios(voluntariosRes.data);
          setUsuarios(usuariosRes.data);
          setSlides(slidesRes.data);
          setDoacoes(doacoesRes.data);
          setAnimais(animaisRes.data);
          setAdocoes(adocoesRes.data);
        } catch (err) {
          setError('Falha ao carregar os dados do painel.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="mt-2 text-gray-700">Você não tem permissão para aceder a esta página.</p>
          <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
            Voltar à Página Inicial
          </Link>
        </div>
      </main>
    );
  }

  const Sidebar = () => (
    <aside className={`bg-stone-800 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}>
        <div className="mb-8"><h2 className="text-2xl font-bold">Cadastro</h2></div>
        <nav className="flex flex-col space-y-2">
            <button onClick={() => setActiveView('slides')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'slides' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>📝 Gerir Slides</button>
            <button onClick={() => setActiveView('animais')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'animais' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>🐾 Gerir Animais</button>
            <button onClick={() => setActiveView('adocoes')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'adocoes' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>❤️ Gerir Adoções</button>
            <button onClick={() => setActiveView('voluntarios')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'voluntarios' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>🤝 Gerir Voluntários</button>
            <button onClick={() => setActiveView('membros')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'membros' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>👥 Gerir Membros</button>
            <button onClick={() => setActiveView('doacoes')} className={`text-left p-3 rounded-lg transition-colors whitespace-nowrap ${activeView === 'doacoes' ? 'bg-stone-700' : 'hover:bg-stone-700'}`}>💰 Histórico de Doações</button>
        </nav>
        <div className="mt-auto"><Link href="/" className="block text-center p-3 rounded-lg bg-stone-700 hover:bg-stone-600 transition-colors whitespace-nowrap">Sair do Painel</Link></div>
    </aside>
  );

  const MainContent = () => {
    const viewTitles: Record<AdminView, string> = {
      slides: 'Gestão do Carrossel',
      animais: 'Gestão de Animais para Adoção',
      adocoes: 'Gestão de Pedidos de Adoção',
      voluntarios: 'Gestão de Voluntários',
      membros: 'Membros Registados',
      doacoes: 'Histórico de Doações',
    };

    return (
    <div className="flex-1 flex flex-col h-screen overflow-y-hidden">
        <header className="bg-white shadow-sm p-4 flex-shrink-0 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{viewTitles[activeView]}</h1>
        </header>
        <div className="flex-1 p-6 md:p-10 bg-gray-100 overflow-y-auto">
            {loading && <p>A carregar dados...</p>}
            {error && <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg">{error}</div>}
            
            {!loading && !error && (
                <>
                    {activeView === 'slides' && <SlideManager initialSlides={slides} />}
                    {activeView === 'animais' && <AnimalManager animals={animais} setAnimals={setAnimais} />}
                    {activeView === 'adocoes' && <AdoptionManager initialAdoptions={adocoes} onUpdate={(updated) => setAdocoes(adocoes.map(a => a.id === updated.id ? updated : a))} />}
                    {activeView === 'voluntarios' && <VolunteerManager initialVolunteers={voluntarios} />}
                    {activeView === 'membros' && <MemberManager initialUsers={usuarios} />}
                    {activeView === 'doacoes' && <DonationManager initialDonations={doacoes} />}
                </>
            )}
        </div>
    </div>
    )
  };

  return (
    <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <MainContent />
    </div>
  );
}

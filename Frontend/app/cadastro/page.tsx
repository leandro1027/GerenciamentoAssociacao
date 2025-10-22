'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import Input from '../components/common/input';
import Button from '../components/common/button';
import { Usuario } from '../../types';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import SelecaoLocalizacao from '../components/common/SelecaoLocalizacao';

const PasswordStrengthIndicator = ({ password = '' }: { password?: string }) => {
    const checks = [
        { label: 'Pelo menos 8 caracteres', regex: /.{8,}/ },
        { label: 'Pelo menos uma letra maiúscula', regex: /(?=.*[A-Z])/ },
        { label: 'Pelo menos uma letra minúscula', regex: /(?=.*[a-z])/ },
        { label: 'Pelo menos um número', regex: /(?=.*\d)/ },
        { label: 'Pelo menos um caractere especial', regex: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/ },
    ];

    return (
        <div className="mt-2 space-y-1">
            {checks.map((check, index) => {
                const isValid = check.regex.test(password);
                return (
                    <div key={index} className={`flex items-center text-sm transition-colors ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isValid ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            )}
                        </svg>
                        <span>{check.label}</span>
                    </div>
                );
            })}
        </div>
    );
};


export default function CadastroPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        estado: '',
        cidade: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Função para atualizar os campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post<Usuario>('/usuario', formData);

            toast.success(`Utilizador "${response.data.nome}" registado com sucesso!`);
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            if (Array.isArray(err.response?.data?.message)) {
                err.response.data.message.forEach((message: string) => {
                    toast.error(message);
                });
            } else {
                const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao cadastrar.';
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Crie a sua Conta
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-700">
                            Nome Completo
                        </label>
                        <Input
                            id="nome"
                            type="text"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                            E-mail
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <SelecaoLocalizacao
                        onEstadoChange={(estado) => setFormData(prev => ({ ...prev, estado, cidade: '' }))} // Reseta a cidade ao mudar o estado
                        onCidadeChange={(cidade) => setFormData(prev => ({ ...prev, cidade }))}
                    />

                    <div>
                        <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <Input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Crie uma senha forte"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                            icon={showPassword ? <Eye/> : <EyeOff/>}
                            onIconClick={() => setShowPassword(!showPassword)}
                        />
                        {formData.senha.length > 0 && <PasswordStrengthIndicator password={formData.senha} />}
                    </div>
                    <div>
                        <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-700">
                            Telefone
                        </label>
                        <Input
                            id="telefone"
                            type="tel"
                            placeholder=""
                            value={formData.telefone}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <Button type="submit" isLoading={isLoading}>
                        Registar
                    </Button>
                </form>
            </div>
        </main>
    );
}


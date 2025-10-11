// Ficheiro: /components/common/AnimalDetailModal.tsx
'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimalComunitario } from '@/types';

// Ícone de Fechar
const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

interface ModalProps {
  animal: AnimalComunitario;
  onClose: () => void;
}

export default function AnimalDetailModal({ animal, onClose }: ModalProps) {

  // Importa o mini-mapa dinamicamente
  const MapaDetalhe = useMemo(() => dynamic(
    () => import('./MapaDetalheAnimal'),
    {
      ssr: false,
      loading: () => <div className="h-full w-full flex justify-center items-center bg-gray-100 rounded-lg"><p className="text-gray-500">A carregar mapa...</p></div>
    }
  ), [animal]); // Recarrega se o animal mudar

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Fecha o modal ao clicar no fundo
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-auto max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        {/* Lado Esquerdo: Foto e Endereço */}
        <div className="w-full md:w-1/2 flex-shrink-0 bg-gray-100">
            <img 
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${animal.imageUrl}`}
                alt={`Foto de ${animal.nomeTemporario}`}
                className="w-full h-full object-cover"
            />
        </div>

        {/* Lado Direito: Informações e Mapa */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-800">{animal.nomeTemporario}</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                >
                    <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                </button>
            </div>
            
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase">Costuma ficar em:</p>
                <p className="text-gray-700">{animal.enderecoCompleto || 'Localização não informada'}</p>
            </div>

            <div className="flex-grow min-h-[250px] md:min-h-0">
                <MapaDetalhe latitude={animal.latitude} longitude={animal.longitude} />
            </div>
        </div>
      </div>
    </div>
  );
}
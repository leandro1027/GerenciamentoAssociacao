'use client';

import { useMemo, useState, useEffect } from 'react'; // Adicionado useState, useEffect
import dynamic from 'next/dynamic';
import { AnimalComunitario } from '@/types';
import { buildImageUrl } from '@/utils/helpers';
import { Loader2 } from 'lucide-react'; // Ícone de Loading

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
  const [mapError, setMapError] = useState(false); // Estado para erro no mapa

   // Verifica se latitude/longitude são válidas ANTES de importar
   const hasValidCoordinates = typeof animal.latitude === 'number' && typeof animal.longitude === 'number' &&
                               !isNaN(animal.latitude) && !isNaN(animal.longitude);


  // Importa o mini-mapa dinamicamente SÓ SE as coordenadas forem válidas
  const MapaDetalhe = useMemo(() => {
     if (!hasValidCoordinates) return () => null; // Retorna componente vazio se não houver coords

     return dynamic(
        () => import('./MapaDetalheAnimal').catch(err => {
            console.error("Falha ao carregar MapaDetalheAnimal:", err);
            setMapError(true); // Ativa o estado de erro
            return () => null; // Retorna componente vazio em caso de erro no import
        }),
        {
            ssr: false,
            loading: () => ( // Indicador de loading
                <div className="flex justify-center items-center h-full bg-gray-100">
                   <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            )
        }
     )
  }, [animal.latitude, animal.longitude, hasValidCoordinates]); // Depende das coordenadas e da validade delas

   // Resetar erro ao trocar de animal
   useEffect(() => {
     setMapError(false);
   }, [animal.id]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Fecha o modal ao clicar no fundo
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden" 
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro do modal
      >
        {/* Lado Esquerdo: Foto */}
        <div className="w-full h-64 md:h-auto md:w-1/2 flex-shrink-0 bg-gray-100">
            <img
                src={buildImageUrl(animal.imageUrl)}
                alt={`Foto de ${animal.nomeTemporario}`}
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Sem+Foto'; }}
            />
        </div>

        {/* Lado Direito: Informações e Mapa */}
        <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{animal.nomeTemporario}</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                    aria-label="Fechar modal"
                >
                    <Icon path="M6 18L18 6M6 6l12 12" className="w-6 h-6" />
                </button>
            </div>

            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase">Costuma ficar em:</p>
                <p className="text-gray-700">{animal.enderecoCompleto || 'Localização não informada'}</p>
            </div>
            <div className="h-[250px] md:flex-grow md:min-h-0 rounded-lg overflow-hidden border">
                {hasValidCoordinates && !mapError ? (
                   <MapaDetalhe latitude={animal.latitude as number} longitude={animal.longitude as number} />
                 ) : (
                    <div className="flex justify-center items-center h-full bg-gray-100 text-center p-4">
                       <p className="text-gray-500 text-sm">
                          {mapError
                            ? "Erro ao carregar o mapa."
                            : "Coordenadas de localização não disponíveis para este animal."}
                       </p>
                    </div>
                 )}
            </div>
        </div>
      </div>
       <style jsx global>{`
           @keyframes fade-in {
               from { opacity: 0; }
               to { opacity: 1; }
           }
           .animate-fade-in {
               animation: fade-in 0.3s ease-out forwards;
           }
       `}</style>
    </div>
  );
}


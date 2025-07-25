'use client';

import Link from 'next/link';
import api from '../../services/api'; 
import { Animal } from '../../../types';

const AnimalCard = ({ animal }: { animal: Animal }) => {
  const imageUrl = animal.animalImageUrl
    ? `${api.defaults.baseURL}${animal.animalImageUrl}`
    : 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Sem+Foto';
  };

  return (
    // O <Link> foi movido para envolver apenas a secção de texto.
    // O div principal agora tem os estilos de hover.
    <div className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-56 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={`Foto de ${animal.nome}`} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      <Link href={`/adote/${animal.id}`} className="block p-4 hover:bg-gray-50 transition-colors duration-200">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{animal.nome}</h3>
        <p className="text-sm text-gray-600 mt-1">{animal.raca}</p>
      </Link>
    </div>
  );
};

export default AnimalCard;

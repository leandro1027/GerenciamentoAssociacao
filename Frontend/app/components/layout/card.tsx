// components/common/Card.tsx
'use client';

import React from 'react';

// Definimos as propriedades que nosso card genérico vai aceitar
type CardProps = {
  imageUrl: string;
  title: string;
  description: string;
  imageAlt?: string;
  children?: React.ReactNode; // 'children' é onde colocaremos nossos botões de ação
};

const Card = ({ imageUrl, title, description, imageAlt = 'Imagem do card', children }: CardProps) => {
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback caso a imagem local não seja encontrada
    e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Imagem+Indisponivel';
  };

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Imagem */}
      <div className="relative w-full h-48 bg-gray-200">
        <img 
          src={imageUrl} 
          alt={imageAlt} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      
      {/* Conteúdo de Texto */}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-800 transition-colors duration-200">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      {/* Ações (Botões) */}
      {children && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
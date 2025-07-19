'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Slide } from '@/types';

const SlideGallery = () => {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    api.get<Slide[]>('/slide')
      .then(response => {
        // Limita a quantidade de slides
        setSlides(response.data.slice(0, 2));
      })
      .catch(error => console.error("[SlideGallery] ERRO ao buscar slides:", error));
  }, []);

  if (slides.length === 0) {
    return null;
  }

  const apiBaseUrl = api.defaults.baseURL;

  return (

    <div className="w-full bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slides.map((slide) => (
          // Altura fixa aqui para controlar o tamanho da imagem
          <div key={slide.id} className="overflow-hidden group h-80"> {/* Altura de 320px */}
            <img 
              src={`${apiBaseUrl}${slide.imageUrl}`} 
              alt={slide.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideGallery;

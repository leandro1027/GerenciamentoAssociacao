'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Slide } from '@/types';

const SlideGallery = () => {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    api.get<Slide[]>('/slide')
      .then(response => {
        setSlides(response.data);
      })
      .catch(error => console.error("[SlideGallery] ERRO ao buscar slides:", error));
  }, []);

  if (slides.length === 0) {
    return null;
  }

  const apiBaseUrl = api.defaults.baseURL;

  return (
    <div className="w-full">
      {/* A grelha agora não tem espaçamento para criar um efeito de faixa contínua */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((slide) => (
          <div key={slide.id} className="overflow-hidden group">
            <img 
              src={`${apiBaseUrl}${slide.imageUrl}`} 
              alt={slide.title} 
              className="w-full h-full object-cover aspect-video transform group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideGallery;

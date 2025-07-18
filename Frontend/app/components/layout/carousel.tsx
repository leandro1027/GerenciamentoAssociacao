'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Slide } from '@/types';

const Carousel = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api.get<Slide[]>('/slide')
      .then(response => setSlides(response.data))
      .catch(error => console.error("Erro ao buscar slides:", error));
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 5000); // Muda a cada 5 segundos
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const apiBaseUrl = api.defaults.baseURL;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={`${apiBaseUrl}${slide.imageUrl}`} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
            <h2 className="text-2xl md:text-4xl font-bold text-center">{slide.title}</h2>
            {slide.subtitle && <p className="mt-2 text-lg text-center">{slide.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Carousel;

'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Slide } from '@/types';

const SlideGallery = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api.get<Slide[]>('/slide')
      .then(response => {
        setSlides(response.data.slice(0, 5));
      })
      .catch(error => console.error("[SlideGallery] ERRO ao buscar slides:", error));
  }, []);

  if (slides.length === 0) {
    return null;
  }

  const apiBaseUrl = api.defaults.baseURL;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {/* Slide atual */}
      <img
        src={`${apiBaseUrl}${slides[currentIndex].imageUrl}`}
        alt={slides[currentIndex].title}
        className="w-full h-full object-cover"
      />

      {/* Gradiente só na esquerda */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

      {/* Conteúdo sobreposto */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20 text-white">
        <h1 className="text-3xl sm:text-5xl font-bold max-w-xl">
          {slides[currentIndex].title || "Do you think about adopting a pet?"}
        </h1>
        <p className="mt-4 text-lg sm:text-xl max-w-lg">
          {slides[currentIndex].subtitle || "Open your heart and home to a friend for life."}
        </p>

        <div className="mt-6 flex gap-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            NOS CONHEÇA
          </button>
          <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition">
            AJUDE
          </button>
        </div>
      </div>

      {/* Botões de navegação */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 text-white text-3xl font-bold bg-black/40 rounded-full px-3 py-1 hover:bg-black/70"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white text-3xl font-bold bg-black/40 rounded-full px-3 py-1 hover:bg-black/70"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition ${
              index === currentIndex ? "bg-orange-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlideGallery;

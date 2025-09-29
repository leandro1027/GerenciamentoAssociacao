'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Slide } from '@/types';
import Link from 'next/link';

// Importações do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SlideGallery = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Slide[]>('/slide')
      .then(response => {
        setSlides(response.data); // Pega todos os slides
      })
      .catch(error => console.error("[SlideGallery] ERRO ao buscar slides:", error))
      .finally(() => setLoading(false));
  }, []);

  const apiBaseUrl = api.defaults.baseURL;

  if (loading) {
    return (
      <div className="relative w-full h-[70vh] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Carregando slides...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return null; // Ou um slide padrão de fallback
  }

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          // Classes para estilizar os bullets
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        navigation={true}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full h-full relative">
              {/* Imagem do Slide */}
              <img
                src={`${apiBaseUrl}${slide.imageUrl}`}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

              {/* Conteúdo do Slide */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20 text-white">
                <h1 className="text-3xl sm:text-5xl font-bold max-w-xl animate-fade-in-down">
                  {slide.title}
                </h1>
                <p className="mt-4 text-lg sm:text-xl max-w-lg animate-fade-in-up">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex gap-4">
                  <Link href="/quem-somos" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                    NOS CONHEÇA
                  </Link>
                  <Link href="/voluntario" className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition">
                    AJUDE
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Estilização customizada para os controles do Swiper */}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: white;
          background-color: rgba(0, 0, 0, 0.4);
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          transition: background-color 0.2s;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        .swiper-button-next::after, .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background-color: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background-color: #f97316; /* Cor Laranja 500 */
        }
      `}</style>
    </div>
  );
};

export default SlideGallery;
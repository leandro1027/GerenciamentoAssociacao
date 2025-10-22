'use client';

import { useState, useEffect } from 'react';
import api from '../../services/api'; // Ajuste o caminho se necessário
import { Slide } from '@/types'; // Ajuste o caminho se necessário
import Link from 'next/link';
import { buildImageUrl } from '@/utils/helpers'; // Certifique-se que este caminho está correto

// Importações do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const SlideGallery = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Slide[]>('/slide') // Endpoint para buscar os slides
      .then((response) => {
        setSlides(response.data);
      })
      .catch((error) => {
        console.error('[SlideGallery] ERRO ao buscar slides:', error);
        // Opcional: Mostrar uma mensagem de erro na UI
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Estado de loading
  if (loading) {
    return (
      <div className="relative w-full h-[80vh] bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // Estado caso não haja slides cadastrados
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[80vh] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Bem-vindo</h1>
          <p className="text-xl mb-8">
            Juntos fazemos a diferença na vida dos animais
          </p>
          <Link
            href="/adote"
            className="inline-block bg-white text-amber-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Conheça Nossos Animais
          </Link>
        </div>
      </div>
    );
  }

  // Renderização do Carousel com os slides
  return (
    <div className="relative w-full h-[80vh] overflow-hidden group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0} // Sem espaço entre slides
        slidesPerView={1} // Mostra um slide por vez
        loop={true} // Navegação infinita
        effect="fade" // Efeito de transição
        fadeEffect={{ crossFade: true }} // Configuração do fade
        speed={1200} // Velocidade da transição em ms
        autoplay={{
          delay: 6000, // Tempo de exibição de cada slide em ms
          disableOnInteraction: false, // Não para ao interagir
          pauseOnMouseEnter: true, // Pausa ao passar o mouse
        }}
        pagination={{
          clickable: true, // Permite clicar nas bolinhas
          dynamicBullets: true, // Efeito visual nas bolinhas
          renderBullet: (index, className) => {
            // Estilização customizada das bolinhas
            return `<span class="${className} !w-3 !h-3 !bg-white/50 !mx-1 transition-all duration-300 hover:!bg-white/80"></span>`;
          },
        }}
        navigation={{
          nextEl: '.swiper-button-next', // Seletor para botão "próximo"
          prevEl: '.swiper-button-prev', // Seletor para botão "anterior"
        }}
        className="h-full" // Garante que o Swiper ocupe toda a altura do container
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full h-full relative">
              {/* Imagem do Slide com Overlay */}
              <div className="absolute inset-0">
                <img
                  src={buildImageUrl(slide.imageUrl)} // <-- **CORREÇÃO PRINCIPAL AQUI**
                  alt={slide.title || 'Slide da associação'} // Adiciona um alt padrão
                  className="w-full h-full object-cover transform scale-105" // scale-105 pode ser parte de uma animação Ken Burns
                  // Fallback para caso a imagem não carregue
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/1920x1080/e2e8f0/cbd5e0?text=Imagem+Indisponível';
                    e.currentTarget.alt = 'Imagem indisponível';
                  }}
                />
                {/* Overlays para escurecer a imagem e melhorar legibilidade do texto */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>

              {/* Conteúdo Textual do Slide */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-100 px-4 py-2 rounded-full mb-6 animate-fade-in">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">
                        Transformando Vidas
                      </span>
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 animate-fade-in-down">
                      {slide.title.split(' ').map((word, i) => (
                        <span
                          key={i}
                          className="inline-block mr-2 lg:mr-3 animate-slide-in-up" // Aumentado um pouco o espaçamento
                          style={{ animationDelay: `${i * 0.08}s` }} // Acelerado um pouco a animação
                        >
                          {word}
                        </span>
                      ))}
                    </h1>

                    {/* Subtítulo (renderiza apenas se existir) */}
                    {slide.subtitle && (
                      <p className="text-xl md:text-2xl text-amber-100/90 leading-relaxed mb-8 max-w-xl animate-fade-in-up">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Botões de Ação */}
                    <div
                      className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                      style={{ animationDelay: '0.5s' }} // Ajustado delay para sincronia
                    >
                      <Link
                        href="/quem-somos"
                        className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center gap-3"
                      >
                        <span>NOS CONHEÇA</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="/voluntario"
                        className="group border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                      >
                        <span>QUERO AJUDAR</span>
                        <svg
                          className="w-5 h-5 transform group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicador Visual de Scroll (Opcional) */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70 hidden md:block">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                  <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botões de Navegação (Setas) */}
      <div className="swiper-button-prev !hidden lg:!flex !w-14 !h-14 !bg-white/10 backdrop-blur-sm !border !border-white/20 !rounded-full !text-white hover:!bg-white/20 hover:!scale-110 transition-all duration-300 after:!content-none group">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </div>
      <div className="swiper-button-next !hidden lg:!flex !w-14 !h-14 !bg-white/10 backdrop-blur-sm !border !border-white/20 !rounded-full !text-white hover:!bg-white/20 hover:!scale-110 transition-all duration-300 after:!content-none group">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Estilos Globais e Animações */}
      <style jsx global>{`
        /* Posicionamento da Paginação */
        .swiper-pagination {
          bottom: 30px !important; /* Aproxima um pouco mais da base */
        }

        /* Estilo Base das Bolinhas da Paginação */
        .swiper-pagination-bullet {
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
          width: 10px !important; /* Tamanho ligeiramente menor */
          height: 10px !important; /* Tamanho ligeiramente menor */
        }

        /* Estilo da Bolinha Ativa */
        .swiper-pagination-bullet-active {
          background: #f59e0b !important; /* Cor Amber */
          transform: scale(1.3); /* Destaque maior */
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }

        /* Esconde setas por padrão, mostra no hover do container */
        .swiper-button-next,
        .swiper-button-prev {
          opacity: 0;
          pointer-events: none; /* Evita cliques quando invisível */
          transition: all 0.3s ease;
        }

        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev {
          opacity: 1;
          pointer-events: auto; /* Permite cliques quando visível */
        }

        /* Definições das Animações */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-25px); } /* Suavizado */
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(25px); } /* Suavizado */
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(40px); } /* Suavizado */
          to { opacity: 1; transform: translateY(0); }
        }

        /* Aplicação das Animações */
        .animate-fade-in { animation: fade-in 0.8s ease-out both; }
        .animate-fade-in-down { animation: fade-in-down 1s ease-out both; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out 0.2s both; } /* Pequeno delay */
        .animate-slide-in-up { animation: slide-in-up 0.6s ease-out both; }

         /* Animação Ken Burns (Zoom Lento) na imagem */
        .swiper-slide-active img {
             transform: scale(1.1);
             transition: transform 7s ease-out; /* Duração longa para efeito sutil */
         }

        /* Sombra nos botões */
        .shadow-2xl {
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        }
        .hover\\:shadow-amber-500\\/25:hover {
          box-shadow: 0 10px 25px -3px rgba(245, 158, 11, 0.25), 0 4px 6px -4px rgba(245, 158, 11, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SlideGallery;
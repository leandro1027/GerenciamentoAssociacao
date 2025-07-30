// Em: app/quem-somos/page.tsx

'use client';

import React from 'react';
import Link from 'next/link';

// --- Componente de Ícone ---
const Icon = ({ path, className = "w-8 h-8" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Componente para os Cards de Valores (com imagem) ---
const ValueCard = ({ imageUrl, iconPath, title, children }: { imageUrl: string, iconPath: string, title: string, children: React.ReactNode }) => (
    <div className="relative rounded-xl shadow-lg overflow-hidden group h-80">
        <img src={imageUrl} alt={title} className="absolute w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-6 text-white text-left">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full w-fit mb-4">
                <Icon path={iconPath} className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-amber-50">{children}</p>
        </div>
    </div>
);

// --- Componente: Card de Estatísticas ---
const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-white p-6 rounded-xl text-center shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <p className="text-5xl font-extrabold text-amber-800">{value}</p>
        <p className="mt-2 text-gray-600 font-medium">{label}</p>
    </div>
);


export default function QuemSomosPage() {
  return (
    <main className="bg-gray-50">
      {/* --- Secção Hero --- */}
      <section className="relative bg-amber-800 text-white py-20 sm:py-32">
        <div className="absolute inset-0">
            <img src="/SobreNossaCausa.avif" alt="Gato a ser acariciado" className="w-full h-full object-cover opacity-30"/>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Sobre a Nossa Causa</h1>
          <p className="mt-6 text-xl text-amber-100 max-w-3xl mx-auto">
            Somos um grupo de protetores independentes dedicados a resgatar, cuidar e encontrar lares amorosos para animais em Porto União, Santa Catarina.
          </p>
        </div>
      </section>

      {/* --- Secção Missão, Visão e Valores --- */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Nossos Pilares</h2>
            <p className="mt-3 text-lg text-gray-600">O que nos move todos os dias.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              imageUrl="/NossaMissao.jpg"
              iconPath="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
              title="Nossa Missão"
            >
              Resgatar animais em situação de vulnerabilidade, oferecer cuidados e encontrar famílias que lhes deem amor e segurança para sempre.
            </ValueCard>
            <ValueCard 
              imageUrl="/NossaVisao.jpg"
              iconPath="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1-1.5m1 1.5l1-1.5m0 0l-1-1.5m1 1.5l1-1.5M6 16.5h2.25m0 0l-1-1.5m1 1.5l1-1.5m0 0l-1-1.5m1 1.5l1-1.5m-7.5 0h7.5" 
              title="Nossa Visão"
            >
              Ser uma referência na proteção animal na nossa região, construindo uma comunidade onde nenhum animal seja abandonado ou sofra maus-tratos.
            </ValueCard>
            <ValueCard 
              imageUrl="/NossosValores.png"
              iconPath="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" 
              title="Nossos Valores"
            >
              Compromisso, respeito pela vida, transparência, amor incondicional pelos animais e trabalho em equipa.
            </ValueCard>
          </div>
        </div>
      </section>

        {/* --- Secção de Chamada para Ação com efeito Parallax --- */}
      <section 
        className="relative bg-cover bg-center bg-fixed" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-amber-900/70"></div>
        
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Junte-se a nós e faça parte desta história.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-amber-100">
            A sua ajuda, seja através de doações, voluntariado ou adoção, é o que nos permite continuar.
          </p>
          <Link href="/voluntario" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-amber-800 bg-white hover:bg-amber-50 sm:w-auto">
            Quero Ajudar
          </Link>
        </div>
      </section>

      {/* --- SECÇÃO: Nossos Números --- */}
      <section className="bg-gray-100 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Nosso Impacto em Números</h2>
            <p className="mt-3 text-lg text-gray-600">Cada número representa uma vida transformada.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatCard value="+500" label="Animais Resgatados" />
            <StatCard value="+450" label="Adoções Bem-sucedidas" />
            <StatCard value="+50" label="Voluntários Ativos" />
          </div>
        </div>
      </section>
      
    
    </main>
  );
}

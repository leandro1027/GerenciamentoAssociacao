'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Target, Eye, Users, PawPrint, Star, ArrowRight } from 'lucide-react';

// --- Componente de Ícone ---
const Icon = ({ path, className = "w-8 h-8" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// --- Componente para os Cards de Valores (com imagem) ---
const ValueCard = ({ imageUrl, iconPath, title, children, delay = 0 }: { imageUrl: string, iconPath: string, title: string, children: React.ReactNode, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="relative rounded-2xl shadow-2xl overflow-hidden group h-80 hover:shadow-3xl transition-all duration-500"
  >
    <img 
      src={imageUrl} 
      alt={title} 
      className="absolute w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
    <div className="relative h-full flex flex-col justify-end p-8 text-white text-left">
      <div className="bg-amber-500/20 backdrop-blur-lg p-3 rounded-2xl w-fit mb-4 border border-amber-400/30">
        <Icon path={iconPath} className="w-8 h-8 text-amber-300" />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-amber-100 leading-relaxed text-lg">{children}</p>
    </div>
    
    {/* Efeito de brilho no hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </motion.div>
);

// --- Componente: Card de Estatísticas ---
const StatCard = ({ value, label, icon, delay = 0 }: { value: string, label: string, icon: React.ReactNode, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    whileHover={{ 
      scale: 1.05,
      y: -5,
      transition: { type: "spring", stiffness: 300 }
    }}
    className="bg-white p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-100 group"
  >
    <div className="flex justify-center mb-4">
      <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <p className="text-5xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{value}</p>
    <p className="text-gray-600 font-semibold text-lg">{label}</p>
  </motion.div>
);

// --- Componente de Destaque ---
const FeatureHighlight = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 hover:border-amber-300 transition-colors"
  >
    <div className="p-3 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function QuemSomosPage() {
  return (
    <main className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* --- Secção Hero --- */}
      <section className="relative bg-gradient-to-r from-amber-900 to-orange-900 text-white py-24 sm:py-36 overflow-hidden">
        {/* Background com padrão */}
        <div className="absolute inset-0">
          <img 
            src="/SobreNossaCausa.avif" 
            alt="Gato" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 to-orange-900/90"></div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 opacity-10">
          <PawPrint size={80} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Heart size={80} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 mb-6"
          >
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="block bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Sobre Nossa
            </span>
            <span className="block bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
              Causa
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-xl lg:text-2xl text-amber-100 max-w-4xl mx-auto leading-relaxed"
          >
            Somos um grupo de protetores independentes dedicados a resgatar, cuidar e encontrar 
            <span className="text-white font-semibold"> lares amorosos </span>
            para animais em Porto União, Santa Catarina e União da Vitória, Paraná.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/voluntario" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-800 rounded-2xl font-semibold hover:bg-amber-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              Quero Ajudar
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/adote" 
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-amber-800 transition-all duration-300 backdrop-blur-sm"
            >
              Quero Adotar
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- Secção Missão, Visão e Valores --- */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Nossos Pilares
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Os fundamentos que guiam cada ação e decisão que tomamos
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              imageUrl="/NossaMissao.jpg"
              iconPath="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
              title="Nossa Missão"
              delay={0.1}
            >
              Resgatar animais em situação de vulnerabilidade, oferecer cuidados veterinários e encontrar famílias que lhes deem amor e segurança para sempre.
            </ValueCard>
            
            <ValueCard 
              imageUrl="/NossaVisao.jpg"
              iconPath="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1-1.5m1 1.5l1-1.5m0 0l-1-1.5m1 1.5l1-1.5M6 16.5h2.25m0 0l-1-1.5m1 1.5l1-1.5m0 0l-1-1.5m1 1.5l1-1.5m-7.5 0h7.5" 
              title="Nossa Visão"
              delay={0.2}
            >
              Ser referência na proteção animal no sul do Brasil, construindo uma comunidade consciente onde nenhum animal seja abandonado ou sofra maus-tratos.
            </ValueCard>
            
            <ValueCard 
              imageUrl="/NossosValores.png"
              iconPath="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" 
              title="Nossos Valores"
              delay={0.3}
            >
              Compaixão, transparência, responsabilidade, respeito pela vida e trabalho em equipe guiam cada uma de nossas ações.
            </ValueCard>
          </div>

          {/* Destaques Adicionais */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
          >
            <FeatureHighlight 
              icon={<Users className="w-6 h-6" />}
              title="Trabalho em Equipe"
              description="Unimos forças com voluntários, veterinários e a comunidade para maximizar nosso impacto positivo."
            />
            <FeatureHighlight 
              icon={<Heart className="w-6 h-6" />}
              title="Amor Incondicional"
              description="Cada animal é tratado com dignidade, carinho e respeito, independente de sua história."
            />
          </motion.div>
        </div>
      </section>

      {/* --- Secção de Chamada para Ação com efeito Parallax --- */}
      <section className="relative bg-cover bg-center bg-fixed min-h-[500px] flex items-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1974&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-orange-900/80"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-400/30"
          >
            <Heart className="w-10 h-10 text-amber-300" fill="currentColor" />
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            <span className="block">Junte-se a Nós</span>
            <span className="block text-amber-200">e Faça Parte Desta História</span>
          </h2>
          
          <p className="mt-4 text-xl leading-7 text-amber-100 max-w-2xl mx-auto">
            Sua ajuda, seja através de doações, voluntariado ou adoção, é o combustível que nos permite 
            continuar transformando vidas todos os dias.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/voluntario" 
              className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-white rounded-2xl font-semibold hover:bg-amber-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              Seja Voluntário
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/doacoes" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/20 border border-white/30 transition-all duration-300"
            >
              Faça uma Doação
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECÇÃO: Nossos Números --- */}
      <section className="bg-gradient-to-br from-white to-amber-50 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Nosso Impacto em Números
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada número representa uma vida resgatada, um coração curado e uma família formada
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StatCard 
              value="+200" 
              label="Animais Resgatados" 
              icon={<PawPrint className="w-6 h-6" />}
              delay={0.1}
            />
            <StatCard 
              value="+80" 
              label="Adoções Bem-sucedidas" 
              icon={<Heart className="w-6 h-6" />}
              delay={0.2}
            />
            <StatCard 
              value="+10" 
              label="Voluntários Ativos" 
              icon={<Users className="w-6 h-6" />}
              delay={0.3}
            />
          </div>

          {/* Mensagem Final */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-200"
          >
            <p className="text-2xl text-gray-700 font-light italic">
              "Sozinhos podemos fazer tão pouco; juntos podemos fazer tanto."
            </p>
            <p className="mt-4 text-amber-600 font-semibold">- Helen Keller</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
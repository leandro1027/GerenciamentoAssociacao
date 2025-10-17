'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import api from '@/app/services/api';
import { User, LogOut, Settings, PawPrint, Trophy } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isGamificacaoAtiva, setIsGamificacaoAtiva] = useState(false);

  const navLinks = [
    { href: "/voluntario", label: "Quero Ajudar" },
    { href: "/doacoes", label: "Quero Doar" },
    { href: "/adote", label: "Quero Adotar" },
    { href: "/quem-somos", label: "Quem Somos" },
    { href: "/comunitarios", label: "Animais Comunitários" },
  ];

  useEffect(() => {
    const fetchGamificacaoStatus = async () => {
      try {
        const { data } = await api.get('/configuracao');
        if (data && typeof data.gamificacaoAtiva === 'boolean') {
          setIsGamificacaoAtiva(data.gamificacaoAtiva);
        }
      } catch (error) {
        console.error("Falha ao carregar configuração da gamificação.", error);
        setIsGamificacaoAtiva(false);
      }
    };
    fetchGamificacaoStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (pathname.startsWith('/painel-admin')) return null;

  const apiBaseUrl = api.defaults.baseURL;

  const renderNavLinks = (isMobile = false) =>
    navLinks.map(link => {
      const isActive = pathname === link.href;
      const baseStyle = "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300";
      const desktopStyle = isActive
        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
        : "text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md";
      const mobileStyle = isActive
        ? "bg-amber-100 text-amber-700 border-l-4 border-amber-500"
        : "text-gray-700 hover:bg-amber-50 hover:text-amber-700";
      
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`${baseStyle} ${isMobile ? mobileStyle : desktopStyle} ${isMobile ? "text-base" : "text-sm"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      );
    });
  
  const renderRankingLink = (isMobile = false) => {
    if (!isGamificacaoAtiva) return null;

    const isActive = pathname === '/ranking';
    const baseStyle = "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300";
    const desktopStyle = isActive
      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg"
      : "text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:shadow-md";
    const mobileStyle = isActive
      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-800";

    return (
      <Link
        href="/ranking"
        className={`${baseStyle} ${isMobile ? mobileStyle : desktopStyle} ${isMobile ? "text-base" : "text-sm"}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <Trophy className="w-4 h-4" />
        Ranking
      </Link>
    );
  };

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'border-b border-amber-200 shadow-2xl backdrop-blur-sm bg-white/95'
        : 'border-b border-gray-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Logótipo da Associação"
                  width={65}
                  height={65}
                  priority
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Associação
                </h1>
                <p className="text-xs text-gray-500">Fabiana Forte Huergo</p>
              </div>
            </Link>
          </div>

          {/* Links de Navegação (Centro) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 flex-1 justify-center">
            {renderNavLinks()}
            {renderRankingLink()}
            {/* O Link do Painel Admin foi MOVIDO daqui */}
          </div>

          {/* Ações e Autenticação (Direita) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Link do Painel Admin agora AGRUPADO aqui */}
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link
                href="/painel-admin"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                Painel Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                 <button
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="flex items-center gap-3 text-gray-700 text-sm font-medium p-2 rounded-2xl hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 group"
                   aria-haspopup="true"
                   aria-expanded={isDropdownOpen}
                 >
                   <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                       {user?.profileImageUrl ? (
                         <img 
                           src={`${apiBaseUrl}${user.profileImageUrl}`} 
                           alt="Avatar" 
                           className="w-full h-full object-cover" 
                         />
                       ) : (
                         <span className="text-white font-bold text-sm">
                           {user?.nome?.[0]?.toUpperCase() || "U"}
                         </span>
                       )}
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                   </div>
                   <div className="text-left">
                     <p className="font-semibold text-gray-800 group-hover:text-amber-700">
                       {user?.nome?.split(' ')[0]}
                     </p>
                   </div>
                   <svg 
                     className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>
                 
                 {isDropdownOpen && (
                   <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 z-20 border border-amber-100 backdrop-blur-sm animate-fade-in">
                     <div className="px-4 py-3 border-b border-amber-100">
                       <p className="font-semibold text-gray-800">{user?.nome}</p>
                       <p className="text-sm text-gray-500">{user?.email}</p>
                       <div className="flex items-center gap-2 mt-1">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <p className="text-xs text-gray-500">Online</p>
                       </div>
                     </div>
                     <Link 
                       href="/perfil" 
                       onClick={() => setIsDropdownOpen(false)}
                       className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 transition-colors group"
                     >
                       <User className="w-4 h-4 text-amber-600" />
                       <span>Meu Perfil</span>
                     </Link>
                     {user?.role === "ADMIN" && (
                       <Link 
                         href="/painel-admin" 
                         onClick={() => setIsDropdownOpen(false)}
                         className="flex items-center gap-3 px-4 py-3 text-amber-700 hover:bg-amber-50 transition-colors group"
                       >
                         <Settings className="w-4 h-4 text-amber-600" />
                         <span>Painel Admin</span>
                       </Link>
                     )}
                     <button 
                       onClick={() => {
                         logout();
                         setIsDropdownOpen(false);
                       }} 
                       className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                     >
                       <LogOut className="w-4 h-4 text-red-500" />
                       <span>Sair</span>
                     </button>
                   </div>
                 )}
              </div>
            ) : (
               <div className="flex items-center space-x-3">
                 <Link 
                   href="/login" 
                   className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-amber-700 border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                 >
                   <User className="w-4 h-4" />
                   Entrar
                 </Link>
                 <Link 
                   href="/cadastro" 
                   className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                 >
                   <PawPrint className="w-4 h-4" />
                   Cadastrar
                 </Link>
               </div>
             )}
          </div>

          {/* Menu Mobile Button */}
          <div className="flex lg:hidden items-center gap-2"> {/* Alterado de md:hidden para lg:hidden */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              className="bg-white inline-flex items-center justify-center p-3 rounded-2xl text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {isMobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Painel Mobile */}
      {/* O código do painel mobile continua o mesmo */}
      {isMobileMenuOpen && (
         <div className="lg:hidden animate-slide-in-top bg-white/95 backdrop-blur-sm border-t border-amber-100 shadow-2xl">
           <div className="px-4 pt-4 pb-3 space-y-1">
             {renderNavLinks(true)}
             {renderRankingLink(true)}
             {isAuthenticated && user?.role === "ADMIN" && (
               <Link
                 href="/painel-admin"
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
               >
                 <Settings className="w-4 h-4" />
                 Painel Admin
               </Link>
             )}
           </div>
           
           <div className="pt-4 pb-6 border-t border-amber-100">
             {isAuthenticated ? (
               <div className="px-4 space-y-2">
                 <div className="px-4 py-3 bg-amber-50 rounded-xl mb-2">
                   <p className="font-semibold text-gray-800">{user?.nome}</p>
                   <p className="text-sm text-gray-500">{user?.email}</p>
                   <div className="flex items-center gap-2 mt-1">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-xs text-gray-500">Online</span>
                   </div>
                 </div>
                 
                 <Link
                   href="/perfil"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-amber-50 transition-colors"
                 >
                   <User className="w-4 h-4 text-amber-600" />
                   Meu Perfil
                 </Link>
                 
                 <button
                   onClick={() => {
                     logout();
                     setIsMobileMenuOpen(false);
                   }}
                   className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                 >
                   <LogOut className="w-4 h-4 text-red-500" />
                   Sair
                 </button>
               </div>
             ) : (
               <div className="px-4 space-y-3">
                 <Link
                   href="/login"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-semibold text-amber-700 border-2 border-amber-200 hover:bg-amber-50 transition-colors"
                 >
                   <User className="w-4 h-4" />
                   Fazer Login
                 </Link>
                 <Link
                   href="/cadastro"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg transition-colors"
                 >
                   <PawPrint className="w-4 h-4" />
                   Criar Conta
                 </Link>
               </div>
             )}
           </div>
         </div>
       )}

      {/* Estilos de Animação */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-top {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 0.4s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
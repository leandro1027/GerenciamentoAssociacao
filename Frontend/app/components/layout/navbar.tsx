'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import api from '@/app/services/api';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 768) {
            setIsMobileMenuOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  if (pathname === '/painel-admin') {
    return null;
  }

  const apiBaseUrl = api.defaults.baseURL;

  const linkStyle = "text-amber-800 font-semibold hover:text-amber-900 px-3 py-2 rounded-md text-sm transition-colors";
  const mobileLinkStyle = "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900";

  // Estilos base para os botões
  const buttonPrimaryBase = "px-5 py-2 rounded-md text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 transition-colors shadow-sm";
  const buttonSecondaryBase = "text-amber-800 border border-amber-800 hover:bg-amber-50 px-5 py-2 rounded-md text-sm font-semibold transition-colors";

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logótipo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Image src="/logo.png" alt="Logótipo da Associação" width={60} height={60} priority />
            </Link>
          </div>

          {/* Links do Menu Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/voluntario" className={linkStyle}>Quero Ajudar</Link>
              <Link href="/doacoes" className={linkStyle}>Quero Doar</Link>
              <Link href="/adote" className={linkStyle}>Quero Adotar</Link>
              <Link href="/quem-somos" className={linkStyle}>Quem Somos</Link>
              <Link href="/#parceiros" className={linkStyle}>Parceiros</Link>
              <Link href="#" className={linkStyle}>Animais Comunitários</Link>
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link href="/painel-admin" className={linkStyle}>Painel Admin</Link>
              )}
            </div>
          </div>

          {/* Botões de Autenticação Desktop */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-gray-800 text-sm font-medium p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                    {user?.profileImageUrl ? (
                      <img src={`${apiBaseUrl}${user.profileImageUrl}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  Olá, <span className="font-semibold ml-1">{user?.nome?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link href="/perfil" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">O Meu Perfil</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100">Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className={buttonSecondaryBase}>Login</Link>
                <Link href="/cadastro" className={buttonPrimaryBase}>Cadastre-se</Link>
              </div>
            )}
          </div>

          {/* Botão do Menu Hambúrguer */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-amber-800 hover:bg-amber-50 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Painel do Menu Móvel */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/voluntario" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Quero Ajudar</Link>
            <Link href="/doacoes" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Quero Doar</Link>
            <Link href="/adote" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Quero Adotar</Link>
            <Link href="/quem-somos" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Quem Somos</Link>
            <Link href="/#parceiros" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Parceiros</Link>
            <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Animais Comunitários</Link>
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link href="/painel-admin" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkStyle}>Painel Admin</Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">O Meu Perfil</Link>
                <button onClick={logout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50">Sair</button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className={`${buttonSecondaryBase} w-full flex justify-center`}>Login</Link>
                <Link href="/cadastro" onClick={() => setIsMobileMenuOpen(false)} className={`${buttonPrimaryBase} w-full flex justify-center`}>Cadastre-se</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
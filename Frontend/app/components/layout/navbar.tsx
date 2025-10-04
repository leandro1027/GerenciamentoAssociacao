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

  const navLinks = [
    { href: "/voluntario", label: "Quero Ajudar" },
    { href: "/doacoes", label: "Quero Doar" },
    { href: "/adote", label: "Quero Adotar" },
    { href: "/quem-somos", label: "Quem Somos" },
    { href: "/comunitarios", label: "Animais comunitários" },
  ];

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
      const baseStyle = "px-3 py-2 rounded-md font-semibold transition-colors";
      const desktopStyle = isActive ? "text-amber-900" : "text-amber-800 hover:text-amber-900";
      const mobileStyle = isActive ? "bg-amber-100 text-amber-900" : "text-gray-700 hover:bg-amber-50 hover:text-amber-900";
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`${baseStyle} ${isMobile ? "block text-base" : "text-sm"} ${isMobile ? mobileStyle : desktopStyle}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Image src="/logo.png" alt="Logótipo da Associação" width={60} height={60} priority />
            </Link>
          </div>

          {/* Links Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {renderNavLinks()}
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link href="/painel-admin" className="px-3 py-2 text-sm font-semibold text-amber-800 hover:text-amber-900">Painel Admin</Link>
            )}
          </div>

          {/* Auth Desktop */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-gray-800 text-sm font-medium p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img src={`${apiBaseUrl}${user.profileImageUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{user?.nome?.[0] || "?"}</span>
                    )}
                  </div>
                  Olá, <span className="font-semibold ml-1">{user?.nome?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100" role="menu">
                    <Link href="/perfil" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Meu Perfil</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50" role="menuitem">Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-amber-800 border border-amber-800 hover:bg-amber-50 px-5 py-2 rounded-md text-sm font-semibold transition">Login</Link>
                <Link href="/cadastro" className="px-5 py-2 rounded-md text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 transition shadow-sm">Cadastre-se</Link>
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-amber-800 hover:bg-amber-50 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Painel Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link href="/painel-admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Painel Admin</Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-900">Meu Perfil</Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50">Sair</button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex justify-center text-amber-800 border border-amber-800 hover:bg-amber-50 px-5 py-2 rounded-md text-sm font-semibold transition">Login</Link>
                <Link href="/cadastro" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex justify-center px-5 py-2 rounded-md text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 transition shadow-sm">Cadastre-se</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

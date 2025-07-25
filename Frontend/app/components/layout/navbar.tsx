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

  if (pathname === '/painel-admin') {
    return null;
  }

  const apiBaseUrl = api.defaults.baseURL;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Logótipo da Associação" width={60} height={60} priority />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/voluntario" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Seja Voluntário</Link>
              <Link href="/doacoes" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Faça uma Doação</Link>
               <Link href="/adote" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Quero adotar</Link>
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link href="/painel-admin" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Painel Admin</Link>
              )}
            </div>
          </div>

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
                  Olá, <span className="font-semibold ml-1">{user?.nome}</span>
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
              <>
                <Link href="/login" className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                <Link href="/cadastro" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Cadastre-se</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

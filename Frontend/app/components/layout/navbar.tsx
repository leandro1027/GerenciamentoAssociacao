'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png" 
                alt="Logótipo da Associação"
                width={120}
                height={40}
                priority
              />
            </Link>
          </div>

          {/* Links de Navegação (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/voluntario" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Seja Voluntário
              </Link>
              <Link href="/doacoes" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Faça uma Doação
              </Link>
              
              {/* O link para o Painel Admin só aparece se o utilizador for um ADMIN */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link href="/painel-admin" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Painel Admin
                </Link>
              )}
            </div>
          </div>

          {/* Botões de Ação (Login/Logout) */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              // Mostra se o utilizador está logado
              <>
                <span className="text-gray-800 text-sm mr-4">
                  Olá, <span className="font-semibold">{user?.nome}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              // Mostra se o utilizador não está logado
              <>
                <Link href="/login" className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/cadastro" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Cadastre-se
                </Link>
              </>
            )}
          </div>

          {/* Menu Mobile (simples) */}
          <div className="md:hidden">
             <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {isAuthenticated ? 'Menu' : 'Login'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

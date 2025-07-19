// components/layout/Footer.tsx
'use client'; // Necessário para usar o hook usePathname

import React from 'react';
import { usePathname } from 'next/navigation'; // Importa o hook para ler o URL

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Se a página atual for '/painel-admin', o componente não renderiza nada (retorna null)
  if (pathname === '/painel-admin') {
    return null;
  }

  // Em todas as outras páginas, o rodapé é renderizado normalmente
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Associação. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Desenvolvido por Leandro Balaban.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

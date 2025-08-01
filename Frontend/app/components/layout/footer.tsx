'use client'; 

import React from 'react';
import { usePathname } from 'next/navigation'; 

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Se a página atual for '/painel-admin', o componente não renderiza nada (retorna null)
  if (pathname === '/painel-admin') {
    return null;
  }

  // Em todas as outras páginas, o rodapé é renderizado normalmente
  return (
    <footer className="bg-amber-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Coluna Sobre Nós */}
            <div>
                <h3 className="text-lg font-semibold">Sobre Nós</h3>
                <p className="mt-4 text-sm text-amber-100">
                    Somos uma associação dedicada ao resgate, cuidado e adoção de animais em Porto União, Santa Catarina.
                </p>
            </div>
            {/* Coluna Links Rápidos */}
            <div>
                <h3 className="text-lg font-semibold">Links Rápidos</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><a href="/adote" className="text-amber-100 hover:text-white transition-colors">Quero Adotar</a></li>
                    <li><a href="/voluntario" className="text-amber-100 hover:text-white transition-colors">Quero Ajudar</a></li>
                    <li><a href="/doacoes" className="text-amber-100 hover:text-white transition-colors">Faça uma Doação</a></li>
                </ul>
            </div>
            {/* Coluna Siga-nos */}
            <div>
                <h3 className="text-lg font-semibold">Siga-nos</h3>
                <div className="mt-4 flex justify-center md:justify-start space-x-4">
                    <a href="#" className="text-amber-100 hover:text-white transition-colors">
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                    </a>
                    <a href="#" className="text-amber-100 hover:text-white transition-colors">
                        <span className="sr-only">Instagram</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.456-9.873a1.144 1.144 0 10-2.288 0 1.144 1.144 0 002.288 0z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
        <div className="mt-8 border-t border-amber-800 pt-8 text-center">
          <p className="text-sm text-amber-200">
            &copy; {currentYear} Associação. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-amber-300">
            Desenvolvido por Leandro Balaban.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

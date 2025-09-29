'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === '/painel-admin') return null;

  return (
    <footer className="bg-amber-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Sobre nós */}
          <section aria-labelledby="footer-sobre">
            <h3 id="footer-sobre" className="text-lg font-semibold">Sobre Nós</h3>
            <p className="mt-4 text-sm text-amber-100 leading-relaxed">
              Somos uma associação dedicada ao resgate, cuidado e adoção de animais
              em Porto União, Santa Catarina.
            </p>
          </section>

          {/* Links rápidos */}
          <nav aria-labelledby="footer-links">
            <h3 id="footer-links" className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="/adote" className="text-amber-100 hover:text-white transition">Quero Adotar</a></li>
              <li><a href="/voluntario" className="text-amber-100 hover:text-white transition">Quero Ajudar</a></li>
              <li><a href="/doacoes" className="text-amber-100 hover:text-white transition">Faça uma Doação</a></li>
            </ul>
          </nav>

          {/* Redes sociais */}
          <section aria-labelledby="footer-social">
            <h3 id="footer-social" className="text-lg font-semibold">Siga-nos</h3>
            <div className="mt-4 flex justify-center md:justify-start space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-amber-100 hover:text-white hover:scale-110 transition-transform"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-amber-100 hover:text-white hover:scale-110 transition-transform"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.78.01 3.8.06 1.06.05 1.79.22 2.43.46a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.25.64.42 1.36.46 2.43.05 1.02.06 1.38.06 3.81s-.01 2.78-.06 3.8c-.04 1.06-.21 1.79-.46 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.46-1.02.05-1.38.06-3.8.06s-2.78-.01-3.81-.06c-1.06-.04-1.79-.21-2.43-.46a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.64-.42-1.37-.46-2.43-.05-1.02-.06-1.38-.06-3.8s.01-2.78.06-3.81c.04-1.06.21-1.79.46-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 016.08 2.53c.64-.25 1.37-.42 2.43-.46 1.03-.05 1.39-.06 3.81-.06zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
              </a>
            </div>
          </section>
        </div>

        {/* Créditos */}
        <div className="mt-8 border-t border-amber-800 pt-8 text-center">
          <p className="text-sm text-amber-200">
            &copy; {currentYear} Associação. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-amber-300">
            Desenvolvido por <a href="https://seu-portfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Leandro Balaban</a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

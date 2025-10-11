'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === '/painel-admin') return null;
  if (pathname === '/login') return null;

  return (
    <footer className="bg-amber-900 text-white mt-auto border-t border-amber-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <section aria-labelledby="footer-brand" className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-amber-50">
                Associação
              </span>
            </div>
            <p className="text-amber-100 leading-relaxed text-sm">
              Dedicados ao resgate, cuidado e adoção responsável de animais 
              em Porto União, Santa Catarina. Juntos construímos um mundo 
              melhor para nossos amigos de quatro patas.
            </p>
          </section>

          {/* Links Rápidos */}
          <nav aria-labelledby="footer-links" className="lg:col-span-1">
            <h3 id="footer-links" className="text-lg font-semibold mb-6 text-amber-50">Navegação</h3>
            <ul className="space-y-3">
              {[
                { href: '/adote', label: 'Quero Adotar' },
                { href: '/voluntario', label: 'Seja Voluntário' },
                { href: '/doacoes', label: 'Faça uma Doação' },
                { href: '/comunitarios', label: 'Animais Comunitários' },
                { href: '/sobre', label: 'Sobre Nós' }
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="text-amber-100 hover:text-amber-300 transition-all duration-300 hover:translate-x-1 hover:underline underline-offset-4 flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contato */}
          <section aria-labelledby="footer-contact" className="lg:col-span-1">
            <h3 id="footer-contact" className="text-lg font-semibold mb-6 text-amber-50">Contato</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-amber-100">Porto União, SC</span>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contato@associacao.org" className="text-amber-100 hover:text-amber-300 transition-colors">
                  contato@associacao.org
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+554299999999" className="text-amber-100 hover:text-amber-300 transition-colors">
                  (42) 9999-9999
                </a>
              </div>
            </div>
          </section>

          {/* Redes Sociais */}
          <section aria-labelledby="footer-social" className="lg:col-span-1">
            <h3 id="footer-social" className="text-lg font-semibold mb-6 text-amber-50">Conecte-se</h3>
            
            <div>
              <p className="text-amber-100 text-sm mb-4">Siga nossas redes sociais</p>
              <div className="flex space-x-4">
                {[
                  {
                    href: "https://www.facebook.com/assoc.protetoresfabianaforte/",
                    label: "Facebook",
                    icon: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"
                  },
                  {
                    href: "https://www.instagram.com/assoc.protetoresfabianaforte/",
                    label: "Instagram",
                    icon: "M12.315 2c2.43 0 2.78.01 3.8.06 1.06.05 1.79.22 2.43.46a4.9 4.9 0 011.77 1.15 4.9 4.9 0 011.15 1.77c.25.64.42 1.36.46 2.43.05 1.02.06 1.38.06 3.81s-.01 2.78-.06 3.8c-.04 1.06-.21 1.79-.46 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.46-1.02.05-1.38.06-3.8.06s-2.78-.01-3.81-.06c-1.06-.04-1.79-.21-2.43-.46a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.64-.42-1.37-.46-2.43-.05-1.02-.06-1.38-.06-3.8s.01-2.78.06-3.81c.04-1.06.21-1.79.46-2.43a4.9 4.9 0 011.15-1.77A4.9 4.9 0 016.08 2.53c.64-.25 1.37-.42 2.43-.46 1.03-.05 1.39-.06 3.81-.06zM12 7a5 5 0 100 10 5 5 0 000-10z"
                  },
                  {
                    href: "https://whatsapp.com",
                    label: "WhatsApp",
                    icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"
                  }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="p-2 bg-amber-800 hover:bg-amber-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  >
                    <svg className="w-5 h-5 text-amber-100 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-amber-200 text-sm">
              &copy; {currentYear} Associação. Todos os direitos reservados.
            </p>
            <p className="text-amber-300 text-xs">
              Desenvolvido por{' '}
              <a 
                href="https://leandrobalaban.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-200 hover:text-amber-50 transition-colors font-medium"
              >
                Leandro Balaban
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
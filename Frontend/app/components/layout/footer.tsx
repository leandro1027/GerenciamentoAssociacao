import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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

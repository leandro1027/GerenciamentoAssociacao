import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Título */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Associação
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
              <Link href="/painel-admin" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Painel Admin
              </Link>
            </div>
          </div>

          {/* Botão de Cadastro */}
          <div className="hidden md:block">
            <Link href="/cadastro" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Cadastre-se
            </Link>
          </div>

          {/* Menu Mobile (simples, pode ser melhorado com JS) */}
          <div className="md:hidden">
            <Link href="/cadastro" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Menu
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

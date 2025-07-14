// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Bem-vindo à Associação
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Junte-se a nós e faça a diferença!
          </p>
        </header>

        {/* Secção de Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/cadastro"
            className="block p-6 text-center bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 transform transition-all duration-300"
          >
            <h2 className="font-semibold text-xl">Novo Registo</h2>
            <p className="text-sm mt-1 opacity-90">Crie uma nova conta</p>
          </Link>
          <Link
            href="/voluntario"
            className="block p-6 text-center bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 hover:scale-105 transform transition-all duration-300"
          >
            <h2 className="font-semibold text-xl">Seja Voluntário</h2>
            <p className="text-sm mt-1 opacity-90">Candidate-se para ajudar</p>
          </Link>
          <Link
            href="/doacoes"
            className="block p-6 text-center bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 hover:scale-105 transform transition-all duration-300"
          >
            <h2 className="font-semibold text-xl">Faça uma Doação</h2>
            <p className="text-sm mt-1 opacity-90">Apoie a nossa causa</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

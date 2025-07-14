// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/layout/navbar'; // Caminho corrigido
import { Providers } from '@/context/providers'; // Caminho corrigido
import Footer from './components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Associação',
  description: 'Projeto de gerenciamento de associação',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers> {/* 2. Use o Providers para embrulhar a aplicação */}
          <Navbar />
          <main>{children}</main>
           <Footer /> 
        </Providers>
      </body>
    </html>
  );
}

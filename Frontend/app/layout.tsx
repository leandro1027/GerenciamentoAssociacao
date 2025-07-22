import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/layout/navbar';
import { Providers } from '@/context/providers';
import Footer from './components/layout/footer';
import { Toaster } from 'react-hot-toast'; 

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
        <Providers>
          <Toaster position="top-center" />
          
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer /> 
        </Providers>
      </body>
    </html>
  );
}
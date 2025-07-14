// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/layout/navbar';

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
        <Navbar /> {/* 2. Adicione a Navbar aqui */}
        <main>{children}</main> {/* 3. O conteúdo da página será renderizado aqui */}
      </body>
    </html>
  );
}

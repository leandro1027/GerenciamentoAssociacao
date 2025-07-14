'use client';

import { AuthProvider } from './AuthContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // Este componente existe para garantir que o AuthProvider, que é um
  // componente de cliente, seja renderizado corretamente.
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

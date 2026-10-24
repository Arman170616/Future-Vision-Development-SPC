'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { MessagesProvider } from '@/lib/messages';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MessagesProvider>{children}</MessagesProvider>
    </AuthProvider>
  );
}

'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type Level = 'success' | 'error' | 'info' | 'warning';
export interface Message { id: number; text: string; level: Level }

interface MessagesState {
  messages: Message[];
  push: (text: string, level?: Level) => void;
  dismiss: (id: number) => void;
}

const MessagesContext = createContext<MessagesState | null>(null);
let nextId = 1;

/** Django-style flash messages that survive client-side navigation (e.g. "… was added successfully"). */
export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const dismiss = useCallback((id: number) => setMessages(list => list.filter(m => m.id !== id)), []);

  const push = useCallback((text: string, level: Level = 'success') => {
    const id = nextId++;
    setMessages(list => [...list, { id, text, level }]);
    window.setTimeout(() => dismiss(id), level === 'error' ? 10000 : 6000);
  }, [dismiss]);

  return <MessagesContext.Provider value={{ messages, push, dismiss }}>{children}</MessagesContext.Provider>;
}

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used inside MessagesProvider');
  return ctx;
};

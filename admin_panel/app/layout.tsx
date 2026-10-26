import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'FutureInnvo Administration',
  robots: { index: false, follow: false },
  icons: { icon: '/admin/logo-tile.svg', apple: '/admin/apple-touch-icon.png' },
};

// Applies the saved theme before first paint to avoid a light/dark flash.
const themeScript = `try{if(localStorage.getItem('fi-admin-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Browser extensions (e.g. element locators) add attributes here before React loads */}
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

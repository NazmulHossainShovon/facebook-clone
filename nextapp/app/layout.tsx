import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';
import { ChatProvider } from './lib/chat-store';
import Footer from 'components/Footer';
import { Toaster } from './components/ui/toaster';

export const metadata: Metadata = {
  title: 'appq.online - Your All-in-One SaaS Platform',
  description: 'A comprehensive SaaS platform offering multiple applications',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col">
        <Providers>
          <ChatProvider>
            <div className="flex-grow">{children}</div>
            <Footer />
            <Toaster />
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}

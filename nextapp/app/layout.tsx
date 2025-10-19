import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';
import { ChatProvider } from './lib/chat-store';
import Footer from 'components/Footer';
import { Toaster } from './components/ui/toaster';

export const metadata: Metadata = {
  title: 'Social Media',
  description: 'A Facebook clone built with Next.js',
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

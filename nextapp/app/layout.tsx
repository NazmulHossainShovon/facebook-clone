import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';
import Navbar from './components/navbar';
import { ChatProvider } from './lib/chat-store';
import ChatIntegration from './components/chat/ChatIntegration';

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
      <body className="font-sans">
        <Providers>
          <ChatProvider>
            <Navbar />
            {children}
            <ChatIntegration />
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}

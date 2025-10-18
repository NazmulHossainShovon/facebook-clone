import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers';
import { ChatProvider } from './lib/chat-store';

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
          <ChatProvider>{children}</ChatProvider>
        </Providers>
      </body>
    </html>
  );
}

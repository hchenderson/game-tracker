import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '../components/header';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GameShelf',
  description: 'Log your game library, track play sessions, and gain insights into your gaming habits.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)} suppressHydrationWarning>
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 md:px-6 lg:py-12">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

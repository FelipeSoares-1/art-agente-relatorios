import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { startFeedUpdateScheduler } from '@/lib/cron-job';
import { useEffect } from 'react'; // Importar useEffect

// Iniciar o scheduler uma única vez no lado do servidor
if (typeof window === 'undefined') { // Garante que roda apenas no servidor
  startFeedUpdateScheduler();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A.R.T. - Agente de Relatórios e Tendências",
  description: "Dashboard e gerenciamento de feeds RSS para agências de publicidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-800 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              A.R.T.
            </Link>
            <div className="space-x-4">
              <Link href="/" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link href="/feeds" className="hover:text-gray-300">
                Gerenciar Feeds
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

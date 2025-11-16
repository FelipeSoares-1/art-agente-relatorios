import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { startFeedUpdateScheduler, startActiveSearchScheduler, startCronScrapingScheduler } from '@/lib/cron-job';

// Iniciar os schedulers uma única vez no lado do servidor
if (typeof window === 'undefined') { // Garante que roda apenas no servidor
  startFeedUpdateScheduler();
  startActiveSearchScheduler();
  startCronScrapingScheduler();
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
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 bg-white border-b-4 border-red-600 shadow-md">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <img src="/Artplan_logo.png" alt="Artplan" className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-red-600">A.R.T</h1>
                <p className="text-xs text-gray-500">Agente de Relatórios e Tendências</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="text-gray-700 hover:text-red-600 transition font-semibold">
                🏠 Home
              </Link>
              <Link href="/feeds" className="text-gray-700 hover:text-red-600 transition font-semibold">
                📰 Fontes
              </Link>
              <Link href="/tags" className="text-gray-700 hover:text-red-600 transition font-semibold">
                🏷️ Tags
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-red-600 transition font-semibold">
                📊 Dashboard
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

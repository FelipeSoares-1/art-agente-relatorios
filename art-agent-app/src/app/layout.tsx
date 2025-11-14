import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { startFeedUpdateScheduler, startActiveSearchScheduler } from '@/lib/cron-job';

// Iniciar os schedulers uma única vez no lado do servidor
if (typeof window === 'undefined') { // Garante que roda apenas no servidor
  startFeedUpdateScheduler();
  startActiveSearchScheduler();
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
        <nav className="sticky top-0 z-40 border-b border-red-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/artplan-logo.svg"
                alt="Logo Artplan"
                width={42}
                height={42}
                className="h-10 w-10 rounded-lg shadow-sm"
                priority
              />
              <div className="leading-tight">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">A.R.T.</span>
                <p className="text-lg font-semibold text-gray-900">Agente de Relatórios e Tendências</p>
              </div>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="transition-colors hover:text-red-500">
                Dashboard
              </Link>
              <Link href="/feeds" className="transition-colors hover:text-red-500">
                Feeds
              </Link>
              <Link href="/tags" className="transition-colors hover:text-red-500">
                Tags
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-red-500">
                Monitoramento
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

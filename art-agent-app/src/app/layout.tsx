import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "./globals.css";
import { startActiveSearchScheduler, startCronScrapingScheduler, startEnrichmentWorkerScheduler, startFeedUpdateScheduler } from "@/lib/cron-job";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto', 
});

// Keep Geist Mono for any code blocks if needed
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A.R.T. - Agente de Relatórios e Tendências",
  description: "Monitore o mercado de publicidade e marketing com inteligência.",
};

// Start server-side schedulers
if (typeof window === 'undefined') {
  console.log("Iniciando schedulers no lado do servidor...");
  startFeedUpdateScheduler();
  startActiveSearchScheduler();
  startCronScrapingScheduler();
  startEnrichmentWorkerScheduler();
}

import { SessionProvider } from "next-auth/react";

import AuthButton from "@/components/AuthButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} ${geistMono.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
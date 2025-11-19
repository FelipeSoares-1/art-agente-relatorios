'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthenticatedNav() {
  const { status } = useSession();

  if (status !== 'authenticated') {
    return null; // Não renderiza nada se o usuário não estiver logado
  }

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
      <Link href="/landing" className="hover:text-red-600 transition-colors">
        🏠 Home
      </Link>
      <Link href="/feeds" className="hover:text-red-600 transition-colors">
        📰 Fontes
      </Link>
      <Link href="/tags" className="hover:text-red-600 transition-colors">
        🏷️ Tags
      </Link>
      <Link href="/dashboard" className="hover:text-red-600 transition-colors">
        📊 Dashboard
      </Link>
    </nav>
  );
}
